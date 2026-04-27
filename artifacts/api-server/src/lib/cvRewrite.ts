import { openai } from "@workspace/integrations-openai-ai-server";

export type RewriteTone = "concise_impact" | "narrative" | "formal_corporate";
export type RewriteLength = "similar" | "shorter" | "longer";

export interface RewriteOptions {
  targetRoleOrIndustry?: string | null;
  tone?: RewriteTone | null;
  length?: RewriteLength | null;
  emphasise?: string | null;
  deemphasise?: string | null;
  jobDescription?: string | null;
}

export interface RewrittenExperience {
  title: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
}

export interface RewrittenEducation {
  qualification: string;
  institution: string;
  dates?: string;
  details?: string;
}

export interface RewrittenAdditionalSection {
  title: string;
  items: string[];
}

export interface RewrittenCv {
  name: string;
  headline?: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  summary: string;
  experience: RewrittenExperience[];
  education: RewrittenEducation[];
  skills: string[];
  qualifications?: string[];
  additional?: RewrittenAdditionalSection[];
}

const TONE_GUIDANCE: Record<RewriteTone, string> = {
  concise_impact:
    "Concise and impact-led. Short, punchy bullets that lead with verbs and quantify outcomes wherever the source supports it (revenue, headcount, time saved, %, £). Trim filler.",
  narrative:
    "Narrative and detailed. Slightly longer paragraphs and bullets that explain the context, the action and the result. Conversational but professional. Suitable for senior or career-change CVs.",
  formal_corporate:
    "Formal corporate. Reserved, third-person feel within the bullets. Avoid colloquialisms. Aligns to traditional UK corporate / consulting / legal / financial-services CV conventions.",
};

const LENGTH_GUIDANCE: Record<RewriteLength, string> = {
  similar:
    "Keep the rewritten CV roughly the same length as the source. Preserve the same number of roles and bullets per role.",
  shorter:
    "Tighten and shorten. Aim for 30–40% fewer words overall. Combine or drop weaker bullets, keep the strongest evidence per role. Cap roles at 3–5 bullets each.",
  longer:
    "Expand. Draw out detail that was implicit in the source — context, scope (team size, budget, geography), result. Cap roles at 5–7 bullets each. Do NOT invent facts; only expand on what is in the source.",
};

const SYSTEM_PROMPT = `You are an expert UK CV writer rewriting a candidate's CV. Your job is to produce a clean, well-structured CV in British English that the candidate can confidently send to employers.

Hard rules:
- BRITISH ENGLISH spelling and phrasing throughout (organisation, specialised, programme, etc.). Never American spelling.
- NEVER invent facts. Every job title, employer, date, qualification, metric and skill must trace back to the source CV. If a metric is not in the source, do not put one in.
- NEVER fabricate or alter contact details (name, email, phone, location, LinkedIn). Copy them verbatim from the source. If a field is missing, leave it empty.
- NO emojis, NO marketing fluff ("synergy", "leverage", "world-class", "rockstar", "ninja", "guru"), NO fake certifications.
- NO third-person voice unless the chosen tone is "formal_corporate" — first-person implied (omit pronouns) is the UK norm for bullets.
- NO photos, references, marital status, age, date-of-birth, nationality (UK CV convention).
- Preserve chronological order: experience and education are most-recent first.

Tailoring:
- If a Target Role / Industry is provided, lead the summary and the most recent role's bullets with the most relevant evidence for that role/industry. Reorder bullets within a role for relevance. Do NOT remove unrelated roles — just shorten them.
- If a Job Description is provided, the candidate is applying for THAT role. Foreground the candidate's evidence that maps to it (skills, sector, scope). Mirror the language of the JD where the candidate's experience genuinely supports it. Do NOT claim experience the candidate does not have.
- "Emphasise" instructions: weave these themes through the summary and bullets where the source supports it.
- "De-emphasise / remove" instructions: shorten or omit these areas. If the user asked to remove a role entirely and that's reasonable (e.g. very old or very brief), drop it; otherwise reduce it to a one-line summary.

Output:
- Return ONLY a single valid JSON object matching the schema below — no markdown, no commentary, no code fences.
- Strings must be plain text (no HTML, no markdown). Bullets are individual array entries — do NOT prefix with "•" or "- ".
- Dates use UK format like "Jan 2020 – Present" or "2018 – 2021". Keep the en-dash style consistent.

Schema:
{
  "name": string,
  "headline": string,                       // e.g. "Senior Product Manager · London" — short, professional
  "contact": {
    "email": string,                        // copy from source
    "phone": string,
    "location": string,
    "linkedin": string
  },
  "summary": string,                        // 2–4 sentence professional summary tailored to the inputs
  "experience": [
    {
      "title": string,
      "company": string,
      "location": string,
      "dates": string,
      "bullets": string[]                   // 3–7 bullets per role; each is one sentence, lead with a verb
    }
  ],
  "education": [
    { "qualification": string, "institution": string, "dates": string, "details": string }
  ],
  "skills": string[],                       // flat list of 8–20 most relevant skills
  "qualifications": string[],               // certifications / memberships, optional
  "additional": [                           // optional extras like Languages, Volunteering, Publications
    { "title": string, "items": string[] }
  ]
}

If a field cannot be determined from the source, return an empty string "" or empty array []. Never return null.`;

function pruneText(input: string | null | undefined, max: number): string {
  if (!input) return "";
  const trimmed = input.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max);
}

function buildUserPrompt(cvText: string, opts: RewriteOptions): string {
  const lines: string[] = [];
  lines.push("REWRITE INSTRUCTIONS");
  lines.push("====================");

  if (opts.targetRoleOrIndustry && opts.targetRoleOrIndustry.trim()) {
    lines.push(`Target role / industry: ${opts.targetRoleOrIndustry.trim()}`);
  } else {
    lines.push("Target role / industry: (none specified — keep the CV broadly applicable)");
  }

  const tone = (opts.tone || "concise_impact") as RewriteTone;
  lines.push(`Tone: ${tone}. ${TONE_GUIDANCE[tone] || TONE_GUIDANCE.concise_impact}`);

  const length = (opts.length || "similar") as RewriteLength;
  lines.push(`Length: ${length}. ${LENGTH_GUIDANCE[length] || LENGTH_GUIDANCE.similar}`);

  if (opts.emphasise && opts.emphasise.trim()) {
    lines.push(`Emphasise: ${opts.emphasise.trim()}`);
  }
  if (opts.deemphasise && opts.deemphasise.trim()) {
    lines.push(`De-emphasise / remove: ${opts.deemphasise.trim()}`);
  }

  if (opts.jobDescription && opts.jobDescription.trim()) {
    lines.push("");
    lines.push("JOB DESCRIPTION (the candidate is applying for THIS role — tailor accordingly, do not invent):");
    lines.push("---");
    lines.push(pruneText(opts.jobDescription, 8000));
    lines.push("---");
  }

  lines.push("");
  lines.push("SOURCE CV TEXT");
  lines.push("==============");
  lines.push(pruneText(cvText, 24000));

  lines.push("");
  lines.push("Now produce the rewritten CV as a single JSON object matching the schema. Output JSON only.");
  return lines.join("\n");
}

function safeStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function safeArr<T = string>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function normaliseRewrittenCv(raw: any): RewrittenCv {
  const contactRaw = raw && typeof raw === "object" ? raw.contact || {} : {};
  return {
    name: safeStr(raw?.name),
    headline: safeStr(raw?.headline),
    contact: {
      email: safeStr(contactRaw.email),
      phone: safeStr(contactRaw.phone),
      location: safeStr(contactRaw.location),
      linkedin: safeStr(contactRaw.linkedin),
    },
    summary: safeStr(raw?.summary),
    experience: safeArr<any>(raw?.experience)
      .map(e => ({
        title: safeStr(e?.title),
        company: safeStr(e?.company),
        location: safeStr(e?.location),
        dates: safeStr(e?.dates),
        bullets: safeArr<string>(e?.bullets).map(b => safeStr(b)).filter(b => b.length > 0),
      }))
      .filter(e => e.title || e.company),
    education: safeArr<any>(raw?.education)
      .map(e => ({
        qualification: safeStr(e?.qualification),
        institution: safeStr(e?.institution),
        dates: safeStr(e?.dates),
        details: safeStr(e?.details),
      }))
      .filter(e => e.qualification || e.institution),
    skills: safeArr<string>(raw?.skills).map(s => safeStr(s)).filter(s => s.length > 0),
    qualifications: safeArr<string>(raw?.qualifications).map(s => safeStr(s)).filter(s => s.length > 0),
    additional: safeArr<any>(raw?.additional)
      .map(s => ({
        title: safeStr(s?.title),
        items: safeArr<string>(s?.items).map(i => safeStr(i)).filter(i => i.length > 0),
      }))
      .filter(s => s.title && s.items.length > 0),
  };
}

export async function generateRewrittenCv(
  cvText: string,
  options: RewriteOptions,
): Promise<RewrittenCv> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(cvText, options) },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON for CV rewrite.");
  }
  return normaliseRewrittenCv(parsed);
}

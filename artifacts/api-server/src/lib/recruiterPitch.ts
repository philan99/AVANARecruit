import { openai } from "@workspace/integrations-openai-ai-server";

interface ExperienceEntry {
  jobTitle?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface PitchInputs {
  name: string;
  currentTitle?: string | null;
  summary?: string | null;
  experienceYears?: number | null;
  location?: string | null;
  skills?: string[] | null;
  qualifications?: string[] | null;
  experience?: ExperienceEntry[] | null;
  education?: string | null;
  educationDetails?: string | null;
  preferredJobTypes?: string[] | null;
  preferredWorkplaces?: string[] | null;
  preferredIndustries?: string[] | null;
  cvText?: string | null;
}

const SYSTEM_PROMPT = `You are a senior UK recruitment consultant writing a short positioning brief about a candidate, the way you would brief a hiring manager you trust at a client company.

Write in British English. Confident, factual, warm but professional. NO marketing fluff, NO superlatives like "world-class" or "rockstar", NO emojis.

Structure (output exactly two short paragraphs as semantic HTML):
1. <p> — Who they are now and how they got here. Sketch the arc of their career: where they started, the shape of their progression (broadening scope, increasing seniority, shifts of sector or specialism), and what that arc tells you about their professional identity today. Anchor in concrete employers, sectors, scale or numbers.
2. <p> — What they're looking to do next and what energises them. Read the signals carefully: explicit preferences (job type, workplace, industry), recent investments in themselves (qualifications, certifications, founding/side ventures, sector moves), and the tone of their own profile summary. Convey their intent and the kind of work that clearly engages them, then close with one sentence on the role and environment they would suit best.

Formatting rules:
- Output VALID HTML only. Use <p>...</p> for paragraphs. You MAY use <strong>...</strong> sparingly (max 3 spans total) to highlight a key role anchor, sector, or specialism. You MAY use <em>...</em> once if it adds clarity. No other tags, no inline styles, no <html>/<body>, no markdown, no code fences.
- 100–150 words across both paragraphs combined. Keep it tight.
- Use the candidate's first name once at the start of paragraph 1 ("Sarah is…"), then "they" / "them" thereafter.
- Mirror the writing style of the candidate's CV summary (if present): direct and metric-led if theirs is, more narrative if theirs is.
- Convey energy and motivation through evidence and verbs ("has chosen", "moved into", "is now actively pursuing", "invested in"), NOT through adjectives.
- Do NOT use the words "passionate", "driven", "motivated", "energetic", "enthusiastic", "synergy", "leverage", "rockstar", "guru", "ninja".
- Anchor every claim in something concrete from the CV or profile. If you don't have evidence for a claim, leave it out.
- Do NOT promise outcomes ("will deliver…"), do NOT speculate beyond the evidence, do NOT mention salary or notice period.
- Output ONLY the HTML. No preface like "Here is the pitch:".`;

function pruneCvText(input: string | null | undefined, max = 8000): string {
  if (!input) return "";
  const trimmed = input.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max);
}

function buildUserPrompt(c: PitchInputs): string {
  const lines: string[] = [];
  lines.push(`Candidate name: ${c.name}`);
  if (c.currentTitle) lines.push(`Current/most recent title: ${c.currentTitle}`);
  if (typeof c.experienceYears === "number" && c.experienceYears > 0) {
    lines.push(`Total years of professional experience: ${c.experienceYears}`);
  }
  if (c.location) lines.push(`Location: ${c.location}`);
  if (c.education) lines.push(`Highest education: ${c.education}`);
  if (c.educationDetails) lines.push(`Education detail: ${c.educationDetails}`);
  if (c.qualifications && c.qualifications.length) {
    lines.push(`Qualifications/certifications: ${c.qualifications.join(", ")}`);
  }
  if (c.skills && c.skills.length) {
    lines.push(`Skills: ${c.skills.slice(0, 30).join(", ")}`);
  }
  if (c.preferredJobTypes && c.preferredJobTypes.length) {
    lines.push(`Preferred job types: ${c.preferredJobTypes.join(", ")}`);
  }
  if (c.preferredWorkplaces && c.preferredWorkplaces.length) {
    lines.push(`Preferred workplace style: ${c.preferredWorkplaces.join(", ")}`);
  }
  if (c.preferredIndustries && c.preferredIndustries.length) {
    lines.push(`Preferred industries: ${c.preferredIndustries.join(", ")}`);
  }
  if (c.summary) lines.push(`\nCandidate's own profile/summary (use to mirror style):\n${c.summary}`);

  if (c.experience && c.experience.length) {
    lines.push("\nWork history (most recent first):");
    for (const e of c.experience.slice(0, 6)) {
      const dates = [e.startDate, e.current ? "present" : (e.endDate || "")].filter(Boolean).join(" – ");
      lines.push(`- ${e.jobTitle || "Role"} at ${e.company || "Company"}${dates ? ` (${dates})` : ""}`);
      if (e.description) {
        const d = e.description.replace(/\s+/g, " ").trim();
        if (d) lines.push(`  ${d.slice(0, 600)}`);
      }
    }
  }

  const cv = pruneCvText(c.cvText);
  if (cv) {
    lines.push("\nFull CV text (for tone and any details not captured above):");
    lines.push(cv);
  }

  lines.push("\nNow write the recruiter positioning paragraph.");
  return lines.join("\n");
}

export async function generateRecruiterPitch(inputs: PitchInputs): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 600,
    temperature: 0.4,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(inputs) },
    ],
  });

  let text = completion.choices[0]?.message?.content?.trim() || "";
  // Strip ```html ... ``` or ``` ... ``` code fences the model sometimes wraps output in.
  text = text.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "").trim();
  // Strip wrapping quotes the model sometimes adds.
  text = text.replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, "").trim();
  // If the model returned plain text without any tags, wrap it as a single paragraph.
  if (text && !/<[a-z][^>]*>/i.test(text)) {
    text = `<p>${text}</p>`;
  }
  return text;
}

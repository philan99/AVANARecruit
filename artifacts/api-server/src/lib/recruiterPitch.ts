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

const SYSTEM_PROMPT = `You are a senior UK recruitment consultant writing a short positioning paragraph about a candidate, the way you would brief a hiring manager you trust at a client company.

Write in British English. Confident, factual, warm but professional. NO marketing fluff, NO superlatives like "world-class" or "rockstar", NO emojis.

Rules:
- 80–120 words. One paragraph. No headings, no bullet lists.
- Use the candidate's first name once at the start ("Sarah is…"), then "they" / "them" thereafter.
- Anchor every claim in something concrete from the CV or profile (numbers, employers, sectors, scope). If you don't have evidence, leave it out.
- Mirror the writing style of the candidate's CV summary (if present): if the CV is direct and metric-led, be direct and metric-led; if the CV is more narrative, be more narrative.
- End with one sentence on the kind of role and environment they would suit best, based on their experience and stated preferences.
- Do NOT promise outcomes ("will deliver…"), do NOT speculate beyond the evidence, do NOT mention salary or notice period.
- Do NOT use the words "passionate", "driven", "synergy", "leverage", "rockstar", "guru", "ninja".
- Output ONLY the paragraph. No preface like "Here is the pitch:".`;

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
    max_completion_tokens: 400,
    temperature: 0.4,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(inputs) },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim() || "";
  // Strip wrapping quotes the model sometimes adds.
  return text.replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, "").trim();
}

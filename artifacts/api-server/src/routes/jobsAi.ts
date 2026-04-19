import { Router, type Request, type Response, type NextFunction, json as expressJson } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, companyProfiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

const router = Router();
const largeJson = expressJson({ limit: "8mb" });

const ALLOWED_JOB_TYPES = ["permanent_full_time", "contract", "fixed_term_contract", "part_time", "temporary"];
const ALLOWED_WORKPLACES = ["office", "remote", "hybrid"];
const ALLOWED_EXP = ["junior", "mid", "senior", "lead", "executive"];
const ALLOWED_EDU = ["GCSE", "A-Level", "HND/HNC", "Foundation Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Professional Qualification", "Other"];
const ALLOWED_INDUSTRIES = [
  "accounting_finance","agriculture","automotive","banking","construction","consulting",
  "creative_design","education","energy_utilities","engineering","healthcare","hospitality_tourism",
  "human_resources","insurance","legal","logistics_supply_chain","manufacturing","marketing_advertising",
  "media_entertainment","nonprofit","pharmaceutical","property_real_estate","public_sector","retail",
  "sales","science_research","technology","telecommunications","transport","other",
];

function cleanHtml(input: string): string {
  if (typeof input !== "string") return "";
  return sanitizeHtml(input, {
    allowedTags: ["p", "ul", "ol", "li", "strong", "em", "br", "h3", "h4"],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

// Tiny in-memory token-bucket-ish rate limit (per IP+companyProfileId).
// Not multi-instance safe, but provides basic abuse protection.
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
  const cid = String((req.body && (req.body as { companyProfileId?: unknown }).companyProfileId) ?? "anon");
  const key = `${ip}:${cid}`;
  const now = Date.now();
  const entry = HITS.get(key);
  if (!entry || entry.resetAt < now) {
    HITS.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
    if (entry.count > MAX_PER_WINDOW) {
      const retry = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retry));
      res.status(429).json({ error: `Too many AI requests. Try again in ${retry}s.` });
      return;
    }
  }
  next();
}

// Verify the caller owns a real company profile. We don't have JWT auth in this app,
// but every legitimate caller of these endpoints is a logged-in company user with a
// companyProfileId. Requiring + DB-checking it gates AI usage to known companies.
async function requireCompany(req: Request, res: Response, next: NextFunction) {
  const idRaw = (req.body as { companyProfileId?: unknown })?.companyProfileId;
  const id = typeof idRaw === "number" ? idRaw : Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(401).json({ error: "Company profile required to use AI features." });
    return;
  }
  try {
    const [row] = await db
      .select({ id: companyProfiles.id, name: companyProfiles.name, industry: companyProfiles.industry })
      .from(companyProfiles)
      .where(eq(companyProfiles.id, id));
    if (!row) {
      res.status(401).json({ error: "Company profile required to use AI features." });
      return;
    }
    (req as Request & { company?: { id: number; name: string | null; industry: string | null } }).company = row;
    next();
  } catch (err) {
    console.error("requireCompany error:", err);
    res.status(500).json({ error: "Internal error." });
  }
}

router.post("/jobs/draft", requireCompany, rateLimit, async (req, res) => {
  try {
    const { brief } = req.body as { brief?: string };
    const company = (req as Request & { company?: { name: string | null; industry: string | null } }).company;
    if (!brief || typeof brief !== "string" || brief.trim().length < 5) {
      res.status(400).json({ error: "Please provide a short brief (at least 5 characters)." });
      return;
    }
    const safeBrief = brief.trim().slice(0, 2000);

    const system = `You are a recruitment assistant that turns a short job brief into a structured job posting. Use British English. Salary is in GBP (£). Return ONLY a JSON object — no prose, no markdown.

The JSON object MUST match this shape:
{
  "title": string,
  "jobType": one of ${JSON.stringify(ALLOWED_JOB_TYPES)},
  "workplace": one of ${JSON.stringify(ALLOWED_WORKPLACES)},
  "location": string (city/region; use "Remote" if fully remote),
  "experienceLevel": one of ${JSON.stringify(ALLOWED_EXP)},
  "industry": one of ${JSON.stringify(ALLOWED_INDUSTRIES)},
  "educationLevel": one of ${JSON.stringify(ALLOWED_EDU)} or "",
  "salaryMin": number or null (annual GBP),
  "salaryMax": number or null (annual GBP),
  "skills": string[] (5-10 concrete skills/technologies),
  "description": string (HTML; use only <p>, <ul>, <li>, <strong>, <em>; include sections: About the role, Key responsibilities, What we're looking for, Nice to have. ~250-350 words.)
}

If the brief omits something, infer reasonable defaults. Do NOT invent salary if not implied — use null.`;

    const user = `Brief: ${safeBrief}
${company?.name ? `Company: ${company.name}` : ""}
${company?.industry ? `Company industry: ${company.industry}` : ""}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      max_completion_tokens: 1400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(raw); } catch {
      res.status(502).json({ error: "AI returned invalid JSON. Please try again." });
      return;
    }

    const pickEnum = (val: unknown, allowed: string[]) =>
      typeof val === "string" && allowed.includes(val) ? val : "";
    const toStr = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");
    const toNum = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    const toArr = (v: unknown) =>
      Array.isArray(v)
        ? v.filter(s => typeof s === "string" && s.trim()).map(s => (s as string).trim().slice(0, 60)).slice(0, 20)
        : [];

    res.json({
      title: toStr(parsed.title),
      jobType: pickEnum(parsed.jobType, ALLOWED_JOB_TYPES),
      workplace: pickEnum(parsed.workplace, ALLOWED_WORKPLACES),
      location: toStr(parsed.location),
      experienceLevel: pickEnum(parsed.experienceLevel, ALLOWED_EXP),
      industry: pickEnum(parsed.industry, ALLOWED_INDUSTRIES),
      educationLevel: pickEnum(parsed.educationLevel, ALLOWED_EDU),
      salaryMin: toNum(parsed.salaryMin),
      salaryMax: toNum(parsed.salaryMax),
      skills: toArr(parsed.skills),
      description: cleanHtml(typeof parsed.description === "string" ? parsed.description : ""),
    });
  } catch (err) {
    console.error("jobs/draft error:", err);
    res.status(500).json({ error: "Failed to draft job." });
  }
});

router.post("/jobs/draft-description", requireCompany, rateLimit, async (req, res) => {
  try {
    const { title, skills, experienceLevel, jobType, workplace, location, industry } = req.body as {
      title?: string; skills?: string[]; experienceLevel?: string; jobType?: string;
      workplace?: string; location?: string; industry?: string;
    };
    const company = (req as Request & { company?: { name: string | null } }).company;
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Job title is required to draft a description." });
      return;
    }
    const safeTitle = title.slice(0, 200);
    const safeSkills = Array.isArray(skills)
      ? skills.filter(s => typeof s === "string").slice(0, 20).map(s => s.slice(0, 60))
      : [];
    const system = `You write professional UK job descriptions in HTML. Use British English. Use only <p>, <ul>, <li>, <strong>, <em>. Output ONLY HTML — no markdown, no code fences, no <script>. Include sections: About the role, Key responsibilities, What we're looking for, Nice to have. Around 250-350 words.`;
    const facts = [
      `Title: ${safeTitle}`,
      jobType && `Job type: ${jobType}`,
      workplace && `Workplace: ${workplace}`,
      location && `Location: ${String(location).slice(0, 200)}`,
      experienceLevel && `Experience level: ${experienceLevel}`,
      industry && `Industry: ${industry}`,
      safeSkills.length > 0 && `Required skills: ${safeSkills.join(", ")}`,
      company?.name && `Company: ${company.name}`,
    ].filter(Boolean).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      max_completion_tokens: 900,
      messages: [
        { role: "system", content: system },
        { role: "user", content: facts },
      ],
    });
    const description = cleanHtml(completion.choices[0]?.message?.content?.trim() || "");
    res.json({ description });
  } catch (err) {
    console.error("jobs/draft-description error:", err);
    res.status(500).json({ error: "Failed to draft description." });
  }
});

async function extractDocumentText(buffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  if (lower.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function buildDescriptionHtml(buffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".docx")) {
    try {
      const { value } = await mammoth.convertToHtml({ buffer });
      const html = cleanHtml(value || "");
      if (html) return html;
    } catch (err) {
      console.error("mammoth convertToHtml failed, falling back:", err);
    }
  }
  // PDF / TXT / DOCX fallback: plain text → paragraphs preserving line breaks
  let text = "";
  try {
    text = await extractDocumentText(buffer, fileName);
  } catch {
    text = "";
  }
  const normalised = text.replace(/\r\n/g, "\n").trim();
  if (!normalised) return "";
  const paragraphs = normalised.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const html = paragraphs
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
  return cleanHtml(html);
}

router.post("/jobs/draft-from-document", largeJson, requireCompany, rateLimit, async (req, res) => {
  try {
    const { fileName, fileBase64 } = req.body as { fileName?: string; fileBase64?: string };
    const company = (req as Request & { company?: { name: string | null; industry: string | null } }).company;
    if (!fileName || typeof fileName !== "string") {
      res.status(400).json({ error: "Missing file name." });
      return;
    }
    if (!fileBase64 || typeof fileBase64 !== "string") {
      res.status(400).json({ error: "Missing file content." });
      return;
    }
    const lower = fileName.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".txt")) {
      res.status(400).json({ error: "Please upload a PDF, DOCX, or TXT file." });
      return;
    }

    let buffer: Buffer;
    try {
      const cleaned = fileBase64.includes(",") ? fileBase64.split(",").pop() ?? "" : fileBase64;
      buffer = Buffer.from(cleaned, "base64");
    } catch {
      res.status(400).json({ error: "Could not decode the uploaded file." });
      return;
    }
    if (buffer.length === 0) {
      res.status(400).json({ error: "The uploaded file is empty." });
      return;
    }
    if (buffer.length > 6 * 1024 * 1024) {
      res.status(413).json({ error: "File is too large. Please upload a document under 6MB." });
      return;
    }

    let docText = "";
    try {
      docText = await extractDocumentText(buffer, fileName);
    } catch (err) {
      console.error("Job document extraction failed:", err);
      res.status(422).json({ error: "Could not read text from this document. Try a text-based PDF, DOCX, or TXT." });
      return;
    }
    docText = docText.replace(/\s+/g, " ").trim();
    if (docText.length < 50) {
      res.status(422).json({ error: "The document appears empty or image-based. Please upload a text-based PDF, DOCX, or TXT." });
      return;
    }
    if (docText.length > 30000) docText = docText.slice(0, 30000);

    const system = `You are a recruitment assistant. Read the job description document and extract ONLY the structured metadata fields below. DO NOT rewrite, summarise, or generate the job description itself. Use British English. Salary is in GBP (£). Return ONLY a JSON object — no prose, no markdown.

The JSON object MUST match this shape:
{
  "title": string,
  "jobType": one of ${JSON.stringify(ALLOWED_JOB_TYPES)},
  "workplace": one of ${JSON.stringify(ALLOWED_WORKPLACES)},
  "location": string (city/region; use "Remote" if fully remote),
  "experienceLevel": one of ${JSON.stringify(ALLOWED_EXP)},
  "industry": one of ${JSON.stringify(ALLOWED_INDUSTRIES)},
  "educationLevel": one of ${JSON.stringify(ALLOWED_EDU)} or "",
  "salaryMin": number or null (annual GBP),
  "salaryMax": number or null (annual GBP),
  "skills": string[] (5-10 concrete skills/technologies actually mentioned in the document)
}

CRITICAL rules:
- Only fill a field if the document clearly states or strongly implies it.
- If a field is NOT in the document, return an empty string "" (for text/enum fields), null (for numbers), or [] (for skills). Leave it blank.
- NEVER write placeholder text such as "Not specified", "N/A", "TBD", "Unknown", "To be confirmed", "See description", "Various", or any similar filler.
- Do NOT invent a job title, location, salary, industry, or experience level. Empty is better than guessed.
- Do NOT include a "description" field.`;

    const user = `${company?.name ? `Company: ${company.name}\n` : ""}${company?.industry ? `Company industry: ${company.industry}\n\n` : "\n"}Job description document:\n\n${docText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      max_completion_tokens: 1600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(raw); } catch {
      res.status(502).json({ error: "AI returned invalid JSON. Please try again." });
      return;
    }

    const PLACEHOLDER_RE = /^\s*(n\/?a|none|null|nil|unknown|unspecified|not\s+(specified|stated|provided|mentioned|listed|given|available|applicable)|tbd|tba|to\s+be\s+(confirmed|determined|advised|decided)|see\s+(description|above|below|details?|job\s+description)|various|any|-{1,3}|\.+|empty)\s*\.?\s*$/i;
    const cleanStr = (v: unknown): string => {
      if (typeof v !== "string") return "";
      const trimmed = v.trim();
      if (!trimmed) return "";
      if (PLACEHOLDER_RE.test(trimmed)) return "";
      return trimmed.slice(0, 200);
    };
    const pickEnum = (val: unknown, allowed: string[]) =>
      typeof val === "string" && allowed.includes(val) ? val : "";
    const toNum = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    const toArr = (v: unknown) =>
      Array.isArray(v)
        ? v
            .filter(s => typeof s === "string" && s.trim())
            .map(s => (s as string).trim())
            .filter(s => !PLACEHOLDER_RE.test(s))
            .map(s => s.slice(0, 60))
            .slice(0, 20)
        : [];

    const descriptionHtml = await buildDescriptionHtml(buffer, fileName);

    res.json({
      title: cleanStr(parsed.title),
      jobType: pickEnum(parsed.jobType, ALLOWED_JOB_TYPES),
      workplace: pickEnum(parsed.workplace, ALLOWED_WORKPLACES),
      location: cleanStr(parsed.location),
      experienceLevel: pickEnum(parsed.experienceLevel, ALLOWED_EXP),
      industry: pickEnum(parsed.industry, ALLOWED_INDUSTRIES),
      educationLevel: pickEnum(parsed.educationLevel, ALLOWED_EDU),
      salaryMin: toNum(parsed.salaryMin),
      salaryMax: toNum(parsed.salaryMax),
      skills: toArr(parsed.skills),
      description: descriptionHtml,
    });
  } catch (err) {
    console.error("jobs/draft-from-document error:", err);
    res.status(500).json({ error: "Failed to read document." });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidatesTable, industriesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ObjectStorageService } from "../lib/objectStorage";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

const EDUCATION_OPTIONS = [
  "GCSE",
  "A-Level",
  "BTEC",
  "HND/HNC",
  "Foundation Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Qualification",
  "Other",
];

const JOB_TYPE_OPTIONS = [
  "permanent_full_time",
  "contract",
  "fixed_term_contract",
  "part_time",
  "temporary",
];
const WORKPLACE_OPTIONS = ["office", "remote", "hybrid"];

async function loadIndustryCodes(): Promise<string[]> {
  try {
    const rows = await db.select({ code: industriesTable.code }).from(industriesTable);
    const codes = rows.map(r => r.code);
    if (!codes.includes("other")) codes.push("other");
    return codes;
  } catch (err) {
    console.error("Failed to load industry codes:", err);
    return ["other"];
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
  }
  return Buffer.concat(chunks);
}

async function extractCvText(buffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  // Default to PDF
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

const buildSystemPrompt = (industryOptions: string[]) => `You are an expert CV/resume parser. Extract structured candidate information from the CV text provided. Return ONLY valid JSON matching the schema below — no commentary, no markdown.

Rules:
- Use British English where applicable.
- Phone: include international dialling code if present (e.g. "+44 7700 900123"). If no code present, leave as written.
- Location: prefer "City, Country" format (e.g. "London, UK").
- experienceYears: estimate total years of professional work experience as a positive integer.
- education: ONE of these EXACT values that best describes their highest qualification: ${EDUCATION_OPTIONS.join(", ")}.
- educationDetails: free-text describing the institution, degree subject, dates, etc.
- qualifications: array of certifications/professional qualifications (e.g. "AWS Certified", "PRINCE2", "CIPD Level 5"). Empty array if none.
- skills: array of technical/professional skills mentioned. Aim for 5-20 relevant items.
- experience: array of jobs in REVERSE chronological order (most recent first). Each: { jobTitle, company, startDate (YYYY-MM or YYYY), endDate (YYYY-MM, YYYY, or "" if current), current (boolean), description (1-3 sentence summary of responsibilities/achievements) }.
- preferredJobTypes / preferredWorkplaces / preferredIndustries: ONLY include if the CV explicitly states preferences (most CVs won't). Use only these enum values: jobTypes=[${JOB_TYPE_OPTIONS.join(",")}], workplaces=[${WORKPLACE_OPTIONS.join(",")}], industries=[${industryOptions.join(",")}]. Empty arrays if not stated.
- Social URLs: linkedinUrl, twitterUrl, facebookUrl, portfolioUrl. Empty string if not present.
- summary: 1-3 sentence professional summary (use the CV's own profile/summary if present, otherwise generate one).
- lowConfidenceFields: array of field names where you had to guess or the CV was ambiguous. Examples: "phone", "location", "experienceYears", "education", "preferredJobTypes". Be honest — flag anything not directly stated.

Schema:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "currentTitle": string,
  "experienceYears": number,
  "summary": string,
  "skills": string[],
  "education": string,
  "educationDetails": string,
  "qualifications": string[],
  "experience": Array<{ jobTitle: string, company: string, startDate: string, endDate: string, current: boolean, description: string }>,
  "preferredJobTypes": string[],
  "preferredWorkplaces": string[],
  "preferredIndustries": string[],
  "linkedinUrl": string,
  "twitterUrl": string,
  "facebookUrl": string,
  "portfolioUrl": string,
  "lowConfidenceFields": string[]
}

If a field cannot be determined at all, use an empty string "" or empty array [] (never null). If the document does not appear to be a CV, return all-empty values and add "not_a_cv" to lowConfidenceFields.`;


router.post("/candidates/:id/parse-cv", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid candidate id" });
      return;
    }

    const [candidate] = await db
      .select({ cvFile: candidatesTable.cvFile, cvFileName: candidatesTable.cvFileName })
      .from(candidatesTable)
      .where(eq(candidatesTable.id, id));

    if (!candidate) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }
    if (!candidate.cvFile) {
      res.status(400).json({ error: "No CV uploaded" });
      return;
    }

    const file = await objectStorage.getObjectEntityFile(candidate.cvFile);
    const buffer = await streamToBuffer(file.createReadStream());

    let cvText = "";
    try {
      cvText = await extractCvText(buffer, candidate.cvFileName || candidate.cvFile);
    } catch (err) {
      console.error("CV text extraction failed:", err);
      res.status(422).json({ error: "Could not read text from this CV. Try re-uploading as a text-based PDF or DOCX." });
      return;
    }

    cvText = cvText.replace(/\s+/g, " ").trim();
    if (cvText.length < 50) {
      res.status(422).json({ error: "CV appears to be empty or image-based. Please upload a text-based PDF or DOCX." });
      return;
    }
    // Cap at ~30k chars to keep tokens reasonable
    if (cvText.length > 30000) cvText = cvText.slice(0, 30000);

    const INDUSTRY_OPTIONS = await loadIndustryCodes();
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(INDUSTRY_OPTIONS) },
        { role: "user", content: `CV text:\n\n${cvText}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Failed to JSON.parse model output:", raw.slice(0, 500));
      res.status(502).json({ error: "AI returned invalid response. Please try again." });
      return;
    }

    // Normalise & defend against missing fields
    const safe = (v: unknown, fallback: any = "") =>
      v === undefined || v === null ? fallback : v;
    const safeStr = (v: unknown) => (typeof v === "string" ? v : "");
    const safeNum = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0);
    const safeArr = <T = string>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

    const result = {
      name: safeStr(parsed.name),
      email: safeStr(parsed.email),
      phone: safeStr(parsed.phone),
      location: safeStr(parsed.location),
      currentTitle: safeStr(parsed.currentTitle),
      experienceYears: safeNum(parsed.experienceYears),
      summary: safeStr(parsed.summary),
      skills: safeArr<string>(parsed.skills).filter(s => typeof s === "string" && s.trim().length > 0),
      education: EDUCATION_OPTIONS.includes(safeStr(parsed.education)) ? safeStr(parsed.education) : "",
      educationDetails: safeStr(parsed.educationDetails),
      qualifications: safeArr<string>(parsed.qualifications).filter(s => typeof s === "string" && s.trim().length > 0),
      experience: safeArr<any>(parsed.experience)
        .map(e => ({
          jobTitle: safeStr(e?.jobTitle),
          company: safeStr(e?.company),
          startDate: safeStr(e?.startDate),
          endDate: safeStr(e?.endDate),
          current: !!e?.current,
          description: safeStr(e?.description),
        }))
        .filter(e => e.jobTitle || e.company),
      preferredJobTypes: safeArr<string>(parsed.preferredJobTypes).filter(v => JOB_TYPE_OPTIONS.includes(v)),
      preferredWorkplaces: safeArr<string>(parsed.preferredWorkplaces).filter(v => WORKPLACE_OPTIONS.includes(v)),
      preferredIndustries: safeArr<string>(parsed.preferredIndustries).filter(v => INDUSTRY_OPTIONS.includes(v)),
      linkedinUrl: safeStr(parsed.linkedinUrl),
      twitterUrl: safeStr(parsed.twitterUrl),
      facebookUrl: safeStr(parsed.facebookUrl),
      portfolioUrl: safeStr(parsed.portfolioUrl),
      lowConfidenceFields: safeArr<string>(parsed.lowConfidenceFields).filter(s => typeof s === "string"),
    };

    res.json(result);
  } catch (err) {
    console.error("parse-cv error:", err);
    res.status(500).json({ error: "Failed to parse CV" });
  }
});

export default router;

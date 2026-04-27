import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidatesTable } from "@workspace/db";
import { ObjectStorageService } from "../lib/objectStorage";
import { extractCvText, normaliseCvText, streamToBuffer } from "../lib/cvText";
import {
  generateRewrittenCv,
  normaliseRewrittenCv,
  type RewriteOptions,
  type RewrittenCv,
} from "../lib/cvRewrite";
import { renderCvToDocxBuffer, renderCvToPdfBuffer } from "../lib/cvDoc";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

const MAX_TEXT_BYTES = 30000;

interface CvSourceBody {
  source?: "stored" | "uploaded";
  uploadedCvFile?: string | null;
  uploadedCvFileName?: string | null;
}

interface JdSourceBody {
  jobDescriptionText?: string | null;
  jobDescriptionFile?: string | null;
  jobDescriptionFileName?: string | null;
}

async function loadSourceCvText(
  candidateId: number,
  body: CvSourceBody,
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
  const source = body.source === "uploaded" ? "uploaded" : "stored";

  let objectPath: string | null = null;
  let fileName: string | null = null;

  if (source === "uploaded") {
    objectPath = (body.uploadedCvFile || "").trim() || null;
    fileName = (body.uploadedCvFileName || "").trim() || null;
    if (!objectPath) {
      return { ok: false, status: 400, error: "No uploaded CV file provided." };
    }
  } else {
    const [candidate] = await db
      .select({ cvFile: candidatesTable.cvFile, cvFileName: candidatesTable.cvFileName })
      .from(candidatesTable)
      .where(eq(candidatesTable.id, candidateId));
    if (!candidate) return { ok: false, status: 404, error: "Candidate not found." };
    if (!candidate.cvFile) {
      return { ok: false, status: 400, error: "You don't have a CV stored on your profile yet. Upload one first or pick the upload option." };
    }
    objectPath = candidate.cvFile;
    fileName = candidate.cvFileName || candidate.cvFile;
  }

  let buffer: Buffer;
  try {
    const file = await objectStorage.getObjectEntityFile(objectPath!);
    buffer = await streamToBuffer(file.createReadStream());
  } catch (err) {
    console.error("cv-rewrite: failed to read CV from storage", err);
    return { ok: false, status: 422, error: "Could not read the CV file. Try uploading it again." };
  }

  let text = "";
  try {
    text = await extractCvText(buffer, fileName || "");
  } catch (err) {
    console.error("cv-rewrite: failed to extract text", err);
    return { ok: false, status: 422, error: "Could not read text from this CV. Try a text-based PDF or .docx." };
  }
  text = normaliseCvText(text, MAX_TEXT_BYTES);
  if (text.length < 50) {
    return { ok: false, status: 422, error: "The CV appears to be empty or image-based. Please use a text-based PDF or .docx." };
  }
  return { ok: true, text };
}

async function loadJobDescriptionText(
  body: JdSourceBody,
): Promise<{ ok: true; text: string | null } | { ok: false; status: number; error: string }> {
  const pasted = (body.jobDescriptionText || "").trim();
  const objectPath = (body.jobDescriptionFile || "").trim();

  if (!pasted && !objectPath) {
    return { ok: true, text: null };
  }

  if (pasted && !objectPath) {
    // Cap pasted JD to 8k chars before passing to LLM
    const t = pasted.replace(/\s+/g, " ").trim();
    return { ok: true, text: t.length > 12000 ? t.slice(0, 12000) : t };
  }

  // Uploaded — extract ephemerally
  const fileName = (body.jobDescriptionFileName || "").trim() || objectPath;
  try {
    const file = await objectStorage.getObjectEntityFile(objectPath);
    const buffer = await streamToBuffer(file.createReadStream());
    let text = await extractCvText(buffer, fileName);
    text = text.replace(/\s+/g, " ").trim();
    if (text.length === 0) {
      return { ok: false, status: 422, error: "Could not read text from the job description file." };
    }
    if (text.length > 12000) text = text.slice(0, 12000);
    return { ok: true, text };
  } catch (err) {
    console.error("cv-rewrite: failed to read JD file", err);
    return { ok: false, status: 422, error: "Could not read the job description file. Try a text-based PDF or .docx." };
  }
}

function readRewriteOptions(body: any): RewriteOptions {
  return {
    targetRoleOrIndustry: typeof body?.targetRoleOrIndustry === "string" ? body.targetRoleOrIndustry : null,
    tone:
      body?.tone === "narrative" || body?.tone === "formal_corporate" || body?.tone === "concise_impact"
        ? body.tone
        : "concise_impact",
    length:
      body?.length === "shorter" || body?.length === "longer" || body?.length === "similar"
        ? body.length
        : "similar",
    emphasise: typeof body?.emphasise === "string" ? body.emphasise : null,
    deemphasise: typeof body?.deemphasise === "string" ? body.deemphasise : null,
  };
}

// ---------------------------------------------------------------------------
// POST /candidates/:id/cv-rewrite — generate the rewrite, return JSON
// ---------------------------------------------------------------------------
router.post("/candidates/:id/cv-rewrite", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid candidate id" });
      return;
    }

    const sourceResult = await loadSourceCvText(id, req.body || {});
    if (!sourceResult.ok) {
      res.status(sourceResult.status).json({ error: sourceResult.error });
      return;
    }

    const jdResult = await loadJobDescriptionText(req.body || {});
    if (!jdResult.ok) {
      res.status(jdResult.status).json({ error: jdResult.error });
      return;
    }

    const opts = readRewriteOptions(req.body || {});
    opts.jobDescription = jdResult.text;

    let rewritten: RewrittenCv;
    try {
      rewritten = await generateRewrittenCv(sourceResult.text, opts);
    } catch (err) {
      console.error("cv-rewrite: LLM error", err);
      res.status(502).json({ error: "The AI did not return a valid rewrite. Please try again." });
      return;
    }

    res.json({ rewrittenCv: rewritten });
  } catch (err) {
    console.error("cv-rewrite error:", err);
    res.status(500).json({ error: "Failed to rewrite CV" });
  }
});

// ---------------------------------------------------------------------------
// POST /candidates/:id/cv-rewrite/download — render and stream as docx/pdf
// ---------------------------------------------------------------------------
router.post("/candidates/:id/cv-rewrite/download", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid candidate id" });
      return;
    }
    const format = req.body?.format === "pdf" ? "pdf" : "docx";
    const cv = normaliseRewrittenCv(req.body?.rewrittenCv);
    if (!cv.name && cv.experience.length === 0 && !cv.summary) {
      res.status(400).json({ error: "Missing rewritten CV payload." });
      return;
    }

    const safeName = (cv.name || "candidate").replace(/[^\w\-]+/g, "_").slice(0, 60) || "candidate";
    if (format === "docx") {
      const buf = await renderCvToDocxBuffer(cv);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}_CV.docx"`);
      res.setHeader("Content-Length", buf.length.toString());
      res.end(buf);
      return;
    }

    const buf = await renderCvToPdfBuffer(cv);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}_CV.pdf"`);
    res.setHeader("Content-Length", buf.length.toString());
    res.end(buf);
  } catch (err) {
    console.error("cv-rewrite download error:", err);
    res.status(500).json({ error: "Failed to generate file." });
  }
});

// ---------------------------------------------------------------------------
// POST /candidates/:id/cv-rewrite/replace — render and replace stored CV
// ---------------------------------------------------------------------------
router.post("/candidates/:id/cv-rewrite/replace", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid candidate id" });
      return;
    }
    const format = req.body?.format === "pdf" ? "pdf" : "docx";
    const cv = normaliseRewrittenCv(req.body?.rewrittenCv);
    if (!cv.name && cv.experience.length === 0 && !cv.summary) {
      res.status(400).json({ error: "Missing rewritten CV payload." });
      return;
    }

    const [existing] = await db
      .select({ id: candidatesTable.id })
      .from(candidatesTable)
      .where(eq(candidatesTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Candidate not found." });
      return;
    }

    const buf = format === "pdf"
      ? await renderCvToPdfBuffer(cv)
      : await renderCvToDocxBuffer(cv);
    const ext = format === "pdf" ? "pdf" : "docx";
    const contentType = format === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const safeName = (cv.name || "candidate").replace(/[^\w\-]+/g, "_").slice(0, 60) || "candidate";
    const fileName = `${safeName}_CV_rewritten.${ext}`;

    let uploadedPath: string;
    try {
      uploadedPath = await objectStorage.uploadBufferToPrivate(buf, contentType, ext);
    } catch (err) {
      console.error("cv-rewrite replace: upload failed", err);
      res.status(500).json({ error: "Could not save the new CV. Please try downloading instead." });
      return;
    }

    await db
      .update(candidatesTable)
      .set({
        cvFile: uploadedPath,
        cvFileName: fileName,
        // mark pitch inputs as touched so the recruiter pitch can be regenerated
        pitchInputsTouchedAt: new Date(),
      })
      .where(eq(candidatesTable.id, id));

    res.json({ ok: true, cvFile: uploadedPath, cvFileName: fileName });
  } catch (err) {
    console.error("cv-rewrite replace error:", err);
    res.status(500).json({ error: "Failed to replace CV." });
  }
});

export default router;

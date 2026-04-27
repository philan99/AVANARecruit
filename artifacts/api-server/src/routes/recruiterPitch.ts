import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidatesTable } from "@workspace/db";
import sanitizeHtml from "sanitize-html";
import { generateRecruiterPitch, type PitchInputs } from "../lib/recruiterPitch";

const router: IRouter = Router();

const MAX_PITCH_CHARS = 4000;

// Allow only the safe formatting tags the rich-text editor produces.
// No attributes, no inline styles — keeps the field XSS-safe for recruiter/admin viewers.
// Inline alignment styles (text-align via TextAlign extension) are intentionally dropped:
// the trade-off (some formatting may not survive save) is worth keeping the field locked down.
function cleanPitchHtml(input: string): string {
  if (typeof input !== "string") return "";
  const cleaned = sanitizeHtml(input, {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "h1", "h2", "h3", "h4", "mark", "hr"],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
  // If after sanitisation we have no block-level wrapper but still have text,
  // wrap it in a paragraph so it renders correctly inside the prose container.
  if (cleaned && !/<(p|ul|ol|h1|h2|h3|h4|hr)[\s>]/i.test(cleaned)) {
    return `<p>${cleaned}</p>`;
  }
  return cleaned;
}

function candidateToPitchInputs(c: any, cvText?: string | null): PitchInputs {
  return {
    name: c.name,
    currentTitle: c.currentTitle,
    summary: c.summary,
    experienceYears: c.experienceYears,
    location: c.location,
    skills: Array.isArray(c.skills) ? c.skills : [],
    qualifications: Array.isArray(c.qualifications) ? c.qualifications : [],
    experience: Array.isArray(c.experience) ? c.experience : [],
    education: c.education,
    educationDetails: c.educationDetails,
    preferredJobTypes: Array.isArray(c.preferredJobTypes) ? c.preferredJobTypes : [],
    preferredWorkplaces: Array.isArray(c.preferredWorkplaces) ? c.preferredWorkplaces : [],
    preferredIndustries: Array.isArray(c.preferredIndustries) ? c.preferredIndustries : [],
    cvText: cvText || null,
  };
}

router.post("/candidates/:id/recruiter-pitch", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid candidate id" });
      return;
    }

    const action = req.body?.action;
    if (action !== "regenerate" && action !== "save") {
      res.status(400).json({ error: "action must be 'regenerate' or 'save'" });
      return;
    }

    const [candidate] = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.id, id));

    if (!candidate) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    const now = new Date();

    if (action === "save") {
      const raw = typeof req.body?.pitch === "string" ? req.body.pitch : "";
      const pitch = cleanPitchHtml(raw).slice(0, MAX_PITCH_CHARS);
      const [updated] = await db
        .update(candidatesTable)
        .set({
          recruiterPitch: pitch,
          recruiterPitchSource: "candidate",
          recruiterPitchUpdatedAt: now,
          recruiterPitchReviewedAt: now,
        })
        .where(eq(candidatesTable.id, id))
        .returning({
          recruiterPitch: candidatesTable.recruiterPitch,
          recruiterPitchSource: candidatesTable.recruiterPitchSource,
          recruiterPitchUpdatedAt: candidatesTable.recruiterPitchUpdatedAt,
          recruiterPitchReviewedAt: candidatesTable.recruiterPitchReviewedAt,
        });
      res.json(updated);
      return;
    }

    // action === "regenerate" — generate from current candidate data.
    // Server-side stale guard: if the existing pitch is already at least as
    // fresh as the latest pitch-input change, refuse to regenerate. This
    // backs up the disabled-button UI for any caller that bypasses it
    // (direct API call, replayed request, etc) and stops accidental AI burn.
    const existingPitch = candidate.recruiterPitch;
    const existingUpdatedAt = candidate.recruiterPitchUpdatedAt;
    const inputsTouchedAt = candidate.pitchInputsTouchedAt;
    if (
      existingPitch &&
      existingUpdatedAt &&
      inputsTouchedAt &&
      existingUpdatedAt.getTime() >= inputsTouchedAt.getTime()
    ) {
      res.status(409).json({
        error: "Pitch is already up to date with your profile. Edit your profile or upload a new CV before regenerating.",
        code: "pitch_already_fresh",
      });
      return;
    }

    // Snapshot the inputs timestamp BEFORE generation so we can detect a
    // concurrent profile edit that lands while the LLM is running. We compare
    // by epoch-millisecond rather than by SQL `=` on the timestamptz column:
    // PostgreSQL stores timestamptz at microsecond precision, but the pg
    // driver serialises it back to JS as a millisecond-precision Date. A SQL
    // `WHERE pitch_inputs_touched_at = $snapshot` would therefore reliably
    // mismatch even when the row hasn't changed, producing false-positive
    // 409s. Re-reading inside a row-locked transaction avoids that entirely.
    const inputsSnapshotMs = inputsTouchedAt ? inputsTouchedAt.getTime() : null;

    const generated = await generateRecruiterPitch(candidateToPitchInputs(candidate));
    const pitch = cleanPitchHtml(generated).slice(0, MAX_PITCH_CHARS);

    const txResult = await db.transaction(async (tx) => {
      const [locked] = await tx
        .select({ pitchInputsTouchedAt: candidatesTable.pitchInputsTouchedAt })
        .from(candidatesTable)
        .where(eq(candidatesTable.id, id))
        .for("update");

      if (!locked) {
        return { kind: "not_found" as const };
      }

      const lockedMs = locked.pitchInputsTouchedAt
        ? locked.pitchInputsTouchedAt.getTime()
        : null;

      if (inputsSnapshotMs !== null && lockedMs !== inputsSnapshotMs) {
        return { kind: "conflict" as const };
      }

      const [updated] = await tx
        .update(candidatesTable)
        .set({
          recruiterPitch: pitch,
          recruiterPitchSource: "ai",
          recruiterPitchUpdatedAt: now,
          // Clear the reviewed marker — this is a fresh AI version that the
          // candidate has not seen yet. Keeps DB state consistent with badge UI.
          recruiterPitchReviewedAt: null,
        })
        .where(eq(candidatesTable.id, id))
        .returning({
          recruiterPitch: candidatesTable.recruiterPitch,
          recruiterPitchSource: candidatesTable.recruiterPitchSource,
          recruiterPitchUpdatedAt: candidatesTable.recruiterPitchUpdatedAt,
          recruiterPitchReviewedAt: candidatesTable.recruiterPitchReviewedAt,
        });

      return { kind: "ok" as const, updated };
    });

    if (txResult.kind === "not_found") {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }
    if (txResult.kind === "conflict") {
      res.status(409).json({
        error: "Your profile changed while the pitch was being generated. Please try again.",
        code: "pitch_inputs_changed",
      });
      return;
    }
    res.json(txResult.updated);
  } catch (err) {
    console.error("recruiter-pitch error:", err);
    res.status(500).json({ error: "Failed to update recruiter pitch" });
  }
});

export default router;

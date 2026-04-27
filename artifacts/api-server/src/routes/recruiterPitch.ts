import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidatesTable } from "@workspace/db";
import { generateRecruiterPitch, type PitchInputs } from "../lib/recruiterPitch";

const router: IRouter = Router();

const MAX_PITCH_CHARS = 1500;

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
      const pitch = raw.trim().slice(0, MAX_PITCH_CHARS);
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
    const pitch = await generateRecruiterPitch(candidateToPitchInputs(candidate));
    const [updated] = await db
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
    res.json(updated);
  } catch (err) {
    console.error("recruiter-pitch error:", err);
    res.status(500).json({ error: "Failed to update recruiter pitch" });
  }
});

export default router;

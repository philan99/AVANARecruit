import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, jobAlertsTable, candidatesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/candidates/:candidateId/job-alerts", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId, 10);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid candidate ID" });
    return;
  }

  const [alert] = await db
    .select()
    .from(jobAlertsTable)
    .where(eq(jobAlertsTable.candidateId, candidateId));

  if (!alert) {
    res.json({
      candidateId,
      enabled: false,
      minScore: 50,
      keywords: [],
      locations: [],
      jobTypes: [],
    });
    return;
  }

  res.json(alert);
});

router.put("/candidates/:candidateId/job-alerts", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId, 10);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid candidate ID" });
    return;
  }

  const { enabled, minScore, keywords, locations, jobTypes } = req.body;

  const [existing] = await db
    .select()
    .from(jobAlertsTable)
    .where(eq(jobAlertsTable.candidateId, candidateId));

  if (existing) {
    const [updated] = await db
      .update(jobAlertsTable)
      .set({
        enabled: enabled ?? existing.enabled,
        minScore: minScore ?? existing.minScore,
        keywords: keywords ?? existing.keywords,
        locations: locations ?? existing.locations,
        jobTypes: jobTypes ?? existing.jobTypes,
      })
      .where(eq(jobAlertsTable.candidateId, candidateId))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(jobAlertsTable)
      .values({
        candidateId,
        enabled: enabled ?? true,
        minScore: minScore ?? 50,
        keywords: keywords ?? [],
        locations: locations ?? [],
        jobTypes: jobTypes ?? [],
      })
      .returning();
    res.json(created);
  }
});

export default router;

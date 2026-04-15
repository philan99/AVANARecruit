import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidateAlertsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/company/:companyProfileId/candidate-alerts", async (req, res): Promise<void> => {
  const companyProfileId = parseInt(req.params.companyProfileId, 10);
  if (isNaN(companyProfileId)) {
    res.status(400).json({ error: "Invalid company profile ID" });
    return;
  }

  const [alert] = await db
    .select()
    .from(candidateAlertsTable)
    .where(eq(candidateAlertsTable.companyProfileId, companyProfileId));

  if (!alert) {
    res.json({
      companyProfileId,
      enabled: false,
      minScore: 50,
      keywords: [],
      locations: [],
    });
    return;
  }

  res.json(alert);
});

router.put("/company/:companyProfileId/candidate-alerts", async (req, res): Promise<void> => {
  const companyProfileId = parseInt(req.params.companyProfileId, 10);
  if (isNaN(companyProfileId)) {
    res.status(400).json({ error: "Invalid company profile ID" });
    return;
  }

  const { enabled, minScore, keywords, locations } = req.body;

  const [existing] = await db
    .select()
    .from(candidateAlertsTable)
    .where(eq(candidateAlertsTable.companyProfileId, companyProfileId));

  if (existing) {
    const [updated] = await db
      .update(candidateAlertsTable)
      .set({
        enabled: enabled ?? existing.enabled,
        minScore: minScore ?? existing.minScore,
        keywords: keywords ?? existing.keywords,
        locations: locations ?? existing.locations,
      })
      .where(eq(candidateAlertsTable.companyProfileId, companyProfileId))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(candidateAlertsTable)
      .values({
        companyProfileId,
        enabled: enabled ?? true,
        minScore: minScore ?? 50,
        keywords: keywords ?? [],
        locations: locations ?? [],
      })
      .returning();
    res.json(created);
  }
});

export default router;

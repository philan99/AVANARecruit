import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, jobAlertsTable } from "@workspace/db";
import { geocodeUkPostcode } from "../lib/geocode";

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
      centerPostcode: null,
      centerTown: null,
      centerLat: null,
      centerLng: null,
      radiusMiles: null,
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

  const {
    enabled, minScore, keywords, jobTypes,
    centerPostcode, radiusMiles,
  } = req.body;

  let geoFields: {
    centerPostcode: string | null;
    centerTown: string | null;
    centerLat: number | null;
    centerLng: number | null;
  } | null = null;

  if (centerPostcode !== undefined) {
    if (centerPostcode === null || centerPostcode === "") {
      geoFields = { centerPostcode: null, centerTown: null, centerLat: null, centerLng: null };
    } else {
      const geo = await geocodeUkPostcode(centerPostcode);
      if (!geo.ok) {
        res.status(400).json({ error: geo.error });
        return;
      }
      geoFields = {
        centerPostcode: geo.postcode,
        centerTown: geo.town,
        centerLat: geo.lat,
        centerLng: geo.lng,
      };
    }
  }

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
        jobTypes: jobTypes ?? existing.jobTypes,
        radiusMiles: radiusMiles === undefined ? existing.radiusMiles : radiusMiles,
        ...(geoFields ?? {}),
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
        jobTypes: jobTypes ?? [],
        radiusMiles: radiusMiles ?? null,
        ...(geoFields ?? { centerPostcode: null, centerTown: null, centerLat: null, centerLng: null }),
      })
      .returning();
    res.json(created);
  }
});

export default router;

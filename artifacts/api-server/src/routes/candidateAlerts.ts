import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, candidateAlertsTable, companyUsers } from "@workspace/db";

const router: IRouter = Router();

// The acting user is read from the x-company-user-id header (the same pattern
// used by other company routes). We never trust a userId from the URL/body,
// so a teammate cannot read or edit another teammate's alert settings.
function getActingUserId(req: { headers: Record<string, unknown> }): number | null {
  const raw = req.headers["x-company-user-id"];
  if (!raw) return null;
  const id = parseInt(String(raw), 10);
  return Number.isFinite(id) ? id : null;
}

router.get("/company/:companyProfileId/candidate-alerts", async (req, res): Promise<void> => {
  const companyProfileId = parseInt(req.params.companyProfileId, 10);
  if (isNaN(companyProfileId)) {
    res.status(400).json({ error: "Invalid company profile ID" });
    return;
  }

  const actingUserId = getActingUserId(req as never);
  if (actingUserId == null) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // Verify the acting user actually belongs to this company.
  const [member] = await db
    .select({ id: companyUsers.id })
    .from(companyUsers)
    .where(and(eq(companyUsers.id, actingUserId), eq(companyUsers.companyProfileId, companyProfileId)));
  if (!member) {
    res.status(403).json({ error: "User does not belong to this company" });
    return;
  }

  const [alert] = await db
    .select()
    .from(candidateAlertsTable)
    .where(
      and(
        eq(candidateAlertsTable.companyProfileId, companyProfileId),
        eq(candidateAlertsTable.companyUserId, actingUserId),
      ),
    );

  if (!alert) {
    res.json({
      companyProfileId,
      companyUserId: actingUserId,
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

  const actingUserId = getActingUserId(req as never);
  if (actingUserId == null) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [member] = await db
    .select({ id: companyUsers.id })
    .from(companyUsers)
    .where(and(eq(companyUsers.id, actingUserId), eq(companyUsers.companyProfileId, companyProfileId)));
  if (!member) {
    res.status(403).json({ error: "User does not belong to this company" });
    return;
  }

  const { enabled, minScore, keywords, locations } = req.body;

  const [existing] = await db
    .select()
    .from(candidateAlertsTable)
    .where(
      and(
        eq(candidateAlertsTable.companyProfileId, companyProfileId),
        eq(candidateAlertsTable.companyUserId, actingUserId),
      ),
    );

  if (existing) {
    const [updated] = await db
      .update(candidateAlertsTable)
      .set({
        enabled: enabled ?? existing.enabled,
        minScore: minScore ?? existing.minScore,
        keywords: keywords ?? existing.keywords,
        locations: locations ?? existing.locations,
      })
      .where(eq(candidateAlertsTable.id, existing.id))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(candidateAlertsTable)
      .values({
        companyProfileId,
        companyUserId: actingUserId,
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

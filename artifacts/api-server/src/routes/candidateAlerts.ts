import { Router, type IRouter } from "express";
import { and, eq, desc } from "drizzle-orm";
import { db, jobsTable, companyUsers } from "@workspace/db";

const router: IRouter = Router();

// The acting user is read from the x-company-user-id header. Never trust an
// id from the URL or body — that would let any teammate read or edit another
// teammate's alert settings.
function getActingUserId(req: { headers: Record<string, unknown> }): number | null {
  const raw = req.headers["x-company-user-id"];
  if (!raw) return null;
  const id = parseInt(String(raw), 10);
  return Number.isFinite(id) ? id : null;
}

// List all jobs the acting user posted, with their alert config.
// Owners optionally see every job in the company via ?scope=company so they
// can manage alerts on roles posted by people who have left.
router.get("/company/:companyProfileId/candidate-alert-jobs", async (req, res): Promise<void> => {
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
    .select({ id: companyUsers.id, role: companyUsers.role })
    .from(companyUsers)
    .where(and(eq(companyUsers.id, actingUserId), eq(companyUsers.companyProfileId, companyProfileId)));
  if (!member) {
    res.status(403).json({ error: "User does not belong to this company" });
    return;
  }

  const scopeAll = req.query.scope === "company" && member.role === "owner";

  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      location: jobsTable.location,
      status: jobsTable.status,
      createdByUserId: jobsTable.createdByUserId,
      candidateAlertEnabled: jobsTable.candidateAlertEnabled,
      candidateAlertMinScore: jobsTable.candidateAlertMinScore,
      createdAt: jobsTable.createdAt,
    })
    .from(jobsTable)
    .where(
      scopeAll
        ? eq(jobsTable.companyProfileId, companyProfileId)
        : and(
            eq(jobsTable.companyProfileId, companyProfileId),
            eq(jobsTable.createdByUserId, actingUserId),
          ),
    )
    .orderBy(desc(jobsTable.createdAt));

  res.json({ jobs, role: member.role });
});

// Update a single job's candidate-alert config. Acting user must be the
// poster, or an owner of the job's company.
router.patch("/jobs/:jobId/candidate-alert", async (req, res): Promise<void> => {
  const jobId = parseInt(req.params.jobId, 10);
  if (isNaN(jobId)) {
    res.status(400).json({ error: "Invalid job ID" });
    return;
  }

  const actingUserId = getActingUserId(req as never);
  if (actingUserId == null) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [job] = await db
    .select({
      id: jobsTable.id,
      companyProfileId: jobsTable.companyProfileId,
      createdByUserId: jobsTable.createdByUserId,
    })
    .from(jobsTable)
    .where(eq(jobsTable.id, jobId));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  // Acting user must currently belong to the job's company. Then they're
  // allowed if they posted the job OR they're an owner of that company.
  if (job.companyProfileId == null) {
    res.status(403).json({ error: "Not allowed to modify alerts for this job" });
    return;
  }
  const [member] = await db
    .select({ role: companyUsers.role })
    .from(companyUsers)
    .where(and(eq(companyUsers.id, actingUserId), eq(companyUsers.companyProfileId, job.companyProfileId)));
  if (!member) {
    res.status(403).json({ error: "Not allowed to modify alerts for this job" });
    return;
  }
  const allowed = job.createdByUserId === actingUserId || member.role === "owner";
  if (!allowed) {
    res.status(403).json({ error: "Not allowed to modify alerts for this job" });
    return;
  }

  const { enabled, minScore } = req.body ?? {};
  const update: { candidateAlertEnabled?: boolean; candidateAlertMinScore?: number } = {};
  if (typeof enabled === "boolean") update.candidateAlertEnabled = enabled;
  if (typeof minScore === "number" && minScore >= 0 && minScore <= 100) {
    update.candidateAlertMinScore = minScore;
  }
  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const [updated] = await db
    .update(jobsTable)
    .set(update)
    .where(eq(jobsTable.id, jobId))
    .returning({
      id: jobsTable.id,
      candidateAlertEnabled: jobsTable.candidateAlertEnabled,
      candidateAlertMinScore: jobsTable.candidateAlertMinScore,
    });

  res.json(updated);
});

export default router;

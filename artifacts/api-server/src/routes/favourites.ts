import { Router } from "express";
import { db, favouritesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/candidates/:candidateId/favourites", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid candidate ID" });
    return;
  }

  const favourites = await db
    .select()
    .from(favouritesTable)
    .where(eq(favouritesTable.candidateId, candidateId));

  res.json(favourites);
});

router.post("/candidates/:candidateId/favourites", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId);
  const { jobId } = req.body;

  if (isNaN(candidateId) || !jobId) {
    res.status(400).json({ error: "Invalid candidate ID or job ID" });
    return;
  }

  try {
    const [favourite] = await db
      .insert(favouritesTable)
      .values({ candidateId, jobId })
      .onConflictDoNothing()
      .returning();

    res.status(201).json(favourite || { candidateId, jobId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add favourite" });
  }
});

router.delete("/candidates/:candidateId/favourites/:jobId", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId);
  const jobId = parseInt(req.params.jobId);

  if (isNaN(candidateId) || isNaN(jobId)) {
    res.status(400).json({ error: "Invalid IDs" });
    return;
  }

  await db
    .delete(favouritesTable)
    .where(and(eq(favouritesTable.candidateId, candidateId), eq(favouritesTable.jobId, jobId)));

  res.json({ success: true });
});

export default router;

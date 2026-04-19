import { Router } from "express";
import { db, savedSearchesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

router.get("/candidates/:candidateId/saved-searches", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid candidate ID" });
    return;
  }

  const rows = await db
    .select()
    .from(savedSearchesTable)
    .where(eq(savedSearchesTable.candidateId, candidateId))
    .orderBy(desc(savedSearchesTable.createdAt));

  res.json(rows);
});

router.post("/candidates/:candidateId/saved-searches", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId);
  const { name, filters } = req.body ?? {};

  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid candidate ID" });
    return;
  }
  if (typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (!filters || typeof filters !== "object") {
    res.status(400).json({ error: "Filters object is required" });
    return;
  }

  try {
    const [row] = await db
      .insert(savedSearchesTable)
      .values({ candidateId, name: name.trim(), filters })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to save search" });
  }
});

router.delete("/candidates/:candidateId/saved-searches/:id", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId);
  const id = parseInt(req.params.id);

  if (isNaN(candidateId) || isNaN(id)) {
    res.status(400).json({ error: "Invalid IDs" });
    return;
  }

  await db
    .delete(savedSearchesTable)
    .where(and(eq(savedSearchesTable.candidateId, candidateId), eq(savedSearchesTable.id, id)));

  res.json({ success: true });
});

export default router;

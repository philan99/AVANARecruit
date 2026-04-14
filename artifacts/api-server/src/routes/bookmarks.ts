import { Router } from "express";
import { db, bookmarksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/companies/:companyProfileId/bookmarks", async (req, res): Promise<void> => {
  const companyProfileId = parseInt(req.params.companyProfileId);
  if (isNaN(companyProfileId)) {
    res.status(400).json({ error: "Invalid company profile ID" });
    return;
  }

  const bookmarks = await db
    .select()
    .from(bookmarksTable)
    .where(eq(bookmarksTable.companyProfileId, companyProfileId));

  res.json(bookmarks);
});

router.post("/companies/:companyProfileId/bookmarks", async (req, res): Promise<void> => {
  const companyProfileId = parseInt(req.params.companyProfileId);
  const { candidateId } = req.body;

  if (isNaN(companyProfileId) || !candidateId) {
    res.status(400).json({ error: "Invalid company profile ID or candidate ID" });
    return;
  }

  try {
    const [bookmark] = await db
      .insert(bookmarksTable)
      .values({ companyProfileId, candidateId })
      .onConflictDoNothing()
      .returning();

    res.status(201).json(bookmark || { companyProfileId, candidateId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add bookmark" });
  }
});

router.delete("/companies/:companyProfileId/bookmarks/:candidateId", async (req, res): Promise<void> => {
  const companyProfileId = parseInt(req.params.companyProfileId);
  const candidateId = parseInt(req.params.candidateId);

  if (isNaN(companyProfileId) || isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid IDs" });
    return;
  }

  await db
    .delete(bookmarksTable)
    .where(and(eq(bookmarksTable.companyProfileId, companyProfileId), eq(bookmarksTable.candidateId, candidateId)));

  res.json({ success: true });
});

export default router;

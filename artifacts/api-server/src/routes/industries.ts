import { Router, type IRouter } from "express";
import { db, industriesTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/industries", async (_req, res) => {
  try {
    const rows = await db
      .select({
        code: industriesTable.code,
        label: industriesTable.label,
        displayOrder: industriesTable.displayOrder,
      })
      .from(industriesTable)
      .where(eq(industriesTable.active, true))
      .orderBy(asc(industriesTable.displayOrder), asc(industriesTable.label));
    res.json(rows.map(r => ({ value: r.code, label: r.label })));
  } catch (err) {
    console.error("GET /api/industries failed", err);
    res.status(500).json({ error: "Failed to load industries" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db, devOptionsTable } from "@workspace/db";
import { and, eq, asc } from "drizzle-orm";

const router: IRouter = Router();

const ALLOWED_TYPES = new Set(["category", "status", "priority"]);

const DEFAULT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  category: [
    { value: "Homepage", label: "Homepage" },
    { value: "Company", label: "Company" },
    { value: "Candidate", label: "Candidate" },
    { value: "Marketing", label: "Marketing" },
    { value: "Other", label: "Other" },
  ],
  status: [
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ],
  priority: [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ],
};

async function ensureDefaults(type: string) {
  const existing = await db.select().from(devOptionsTable).where(eq(devOptionsTable.type, type));
  if (existing.length > 0) return;
  const defs = DEFAULT_OPTIONS[type] || [];
  if (defs.length === 0) return;
  await db.insert(devOptionsTable).values(
    defs.map((d, i) => ({ type, value: d.value, label: d.label, sortOrder: i })),
  ).onConflictDoNothing();
}

router.get("/dev-options", async (req, res) => {
  const type = String(req.query.type || "");
  if (!ALLOWED_TYPES.has(type)) {
    res.status(400).json({ error: "Invalid type" });
    return;
  }
  await ensureDefaults(type);
  const rows = await db
    .select()
    .from(devOptionsTable)
    .where(eq(devOptionsTable.type, type))
    .orderBy(asc(devOptionsTable.sortOrder), asc(devOptionsTable.id));
  res.json(rows);
});

router.post("/dev-options", async (req, res) => {
  const { type, label } = req.body || {};
  if (!ALLOWED_TYPES.has(type)) {
    res.status(400).json({ error: "Invalid type" });
    return;
  }
  const trimmed = String(label || "").trim();
  if (!trimmed) {
    res.status(400).json({ error: "Label is required" });
    return;
  }
  const value = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `opt-${Date.now()}`;

  const existing = await db
    .select()
    .from(devOptionsTable)
    .where(and(eq(devOptionsTable.type, type), eq(devOptionsTable.value, value)));
  if (existing.length > 0) {
    res.status(409).json({ error: "An option with that name already exists" });
    return;
  }
  const maxSort = await db
    .select()
    .from(devOptionsTable)
    .where(eq(devOptionsTable.type, type))
    .orderBy(asc(devOptionsTable.sortOrder));
  const nextSort = maxSort.length > 0 ? Math.max(...maxSort.map(r => r.sortOrder)) + 1 : 0;

  const [row] = await db
    .insert(devOptionsTable)
    .values({ type, value, label: trimmed, sortOrder: nextSort })
    .returning();
  res.status(201).json(row);
});

router.delete("/dev-options/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [row] = await db.delete(devOptionsTable).where(eq(devOptionsTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "Option not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;

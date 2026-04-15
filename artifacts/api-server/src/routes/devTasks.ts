import { Router, type IRouter } from "express";
import { db, devTasksTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dev-tasks", async (_req, res) => {
  const tasks = await db.select().from(devTasksTable).orderBy(desc(devTasksTable.createdAt));
  res.json(tasks);
});

router.post("/dev-tasks", async (req, res) => {
  const { title, description, category, status, priority } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  const [task] = await db.insert(devTasksTable).values({
    title,
    description: description || null,
    category: category || "Other",
    status: status || "todo",
    priority: priority || "medium",
  }).returning();
  res.status(201).json(task);
});

router.patch("/dev-tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const updates: Record<string, any> = {};
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.category !== undefined) updates.category = req.body.category;
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.priority !== undefined) updates.priority = req.body.priority;

  const [task] = await db.update(devTasksTable).set(updates).where(eq(devTasksTable.id, id)).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.delete("/dev-tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [task] = await db.delete(devTasksTable).where(eq(devTasksTable.id, id)).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;

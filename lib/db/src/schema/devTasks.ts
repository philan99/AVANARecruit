import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const devTasksTable = pgTable("dev_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("Other"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type DevTask = typeof devTasksTable.$inferSelect;

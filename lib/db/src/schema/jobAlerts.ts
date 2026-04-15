import { pgTable, serial, integer, boolean, text, timestamp, real } from "drizzle-orm/pg-core";
import { candidatesTable } from "./candidates";

export const jobAlertsTable = pgTable("job_alerts", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }).unique(),
  enabled: boolean("enabled").notNull().default(true),
  minScore: real("min_score").notNull().default(50),
  keywords: text("keywords").array().default([]),
  locations: text("locations").array().default([]),
  jobTypes: text("job_types").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type JobAlert = typeof jobAlertsTable.$inferSelect;

import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { jobsTable } from "./jobs";
import { candidatesTable } from "./candidates";

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobsTable.id, { onDelete: "cascade" }),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }),
  overallScore: real("overall_score").notNull(),
  skillScore: real("skill_score").notNull(),
  experienceScore: real("experience_score").notNull(),
  educationScore: real("education_score").notNull(),
  locationScore: real("location_score").notNull(),
  verificationScore: real("verification_score").notNull().default(0),
  assessment: text("assessment").notNull(),
  matchedSkills: text("matched_skills").array().notNull(),
  missingSkills: text("missing_skills").array().notNull(),
  status: text("status").notNull().default("pending"),
  applied: boolean("applied").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({ id: true, createdAt: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;

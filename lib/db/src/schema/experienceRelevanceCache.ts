import { pgTable, text, serial, timestamp, integer, real, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { jobsTable } from "./jobs";
import { candidatesTable } from "./candidates";

export const experienceRelevanceCacheTable = pgTable("experience_relevance_cache", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobsTable.id, { onDelete: "cascade" }),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }),
  jobHash: text("job_hash").notNull(),
  candidateExperienceHash: text("candidate_experience_hash").notNull(),
  effectiveRelevantYears: real("effective_relevant_years").notNull(),
  perEntryScores: jsonb("per_entry_scores").notNull().default([]),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  jobCandidateUnique: uniqueIndex("erc_job_candidate_idx").on(t.jobId, t.candidateId),
}));

export const insertExperienceRelevanceCacheSchema = createInsertSchema(experienceRelevanceCacheTable).omit({ id: true, computedAt: true });
export type InsertExperienceRelevanceCache = z.infer<typeof insertExperienceRelevanceCacheSchema>;
export type ExperienceRelevanceCache = typeof experienceRelevanceCacheTable.$inferSelect;

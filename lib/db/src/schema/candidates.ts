import { pgTable, text, serial, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password"),
  currentTitle: text("current_title").notNull(),
  summary: text("summary").notNull(),
  skills: text("skills").array().notNull(),
  qualifications: text("qualifications").array().default([]),
  experienceYears: integer("experience_years").notNull(),
  education: text("education").notNull(),
  educationDetails: text("education_details"),
  location: text("location").notNull(),
  profileImage: text("profile_image"),
  cvFile: text("cv_file"),
  cvFileName: text("cv_file_name"),
  experience: jsonb("experience").default([]),
  preferredJobTypes: text("preferred_job_types").array().default([]),
  preferredWorkplaces: text("preferred_workplaces").array().default([]),
  preferredIndustries: text("preferred_industries").array().default([]),
  linkedinUrl: text("linkedin_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  portfolioUrl: text("portfolio_url"),
  verified: boolean("verified").notNull().default(false),
  status: text("status").notNull().default("active"),
  onboardingState: jsonb("onboarding_state").default({ currentStep: 1, completedSteps: [], skippedSteps: [], completedAt: null }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;

import { pgTable, text, serial, timestamp, integer, jsonb, boolean, real } from "drizzle-orm/pg-core";
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
  postcode: text("postcode"),
  town: text("town"),
  country: text("country").default("United Kingdom"),
  lat: real("lat"),
  lng: real("lng"),
  profileImage: text("profile_image"),
  cvFile: text("cv_file"),
  cvFileName: text("cv_file_name"),
  experience: jsonb("experience").default([]),
  preferredJobTypes: text("preferred_job_types").array().default([]),
  preferredWorkplaces: text("preferred_workplaces").array().default([]),
  preferredIndustries: text("preferred_industries").array().default([]),
  maxRadiusMiles: integer("max_radius_miles").default(25),
  linkedinUrl: text("linkedin_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  portfolioUrl: text("portfolio_url"),
  recruiterPitch: text("recruiter_pitch"),
  recruiterPitchSource: text("recruiter_pitch_source"),
  recruiterPitchUpdatedAt: timestamp("recruiter_pitch_updated_at", { withTimezone: true }),
  recruiterPitchReviewedAt: timestamp("recruiter_pitch_reviewed_at", { withTimezone: true }),
  verified: boolean("verified").notNull().default(false),
  isDemo: boolean("is_demo").notNull().default(false),
  status: text("status").notNull().default("active"),
  onboardingState: jsonb("onboarding_state").default({ currentStep: 1, completedSteps: [], skippedSteps: [], completedAt: null }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;

import { pgTable, serial, integer, boolean, text, real, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { companyProfiles } from "./companyProfiles";
import { companyUsers } from "./companyUsers";

export const candidateAlertsTable = pgTable(
  "candidate_alerts",
  {
    id: serial("id").primaryKey(),
    companyProfileId: integer("company_profile_id")
      .notNull()
      .references(() => companyProfiles.id, { onDelete: "cascade" }),
    companyUserId: integer("company_user_id").references(() => companyUsers.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull().default(true),
    minScore: real("min_score").notNull().default(50),
    keywords: text("keywords").array().default([]),
    locations: text("locations").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyUserUnique: uniqueIndex("candidate_alerts_company_user_unique").on(
      table.companyProfileId,
      table.companyUserId,
    ),
  }),
);

export type CandidateAlert = typeof candidateAlertsTable.$inferSelect;

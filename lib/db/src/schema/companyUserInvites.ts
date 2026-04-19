import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { companyProfiles } from "./companyProfiles";

export const companyUserInvites = pgTable(
  "company_user_invites",
  {
    id: serial("id").primaryKey(),
    companyProfileId: integer("company_profile_id")
      .notNull()
      .references(() => companyProfiles.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull().default("member"),
    token: text("token").notNull().unique(),
    invitedByUserId: integer("invited_by_user_id"),
    invitedByName: text("invited_by_name"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true }).notNull().default(sql`now()`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => ({
    companyProfileIdIdx: index("company_user_invites_company_profile_id_idx").on(t.companyProfileId),
    emailIdx: index("company_user_invites_email_idx").on(t.email),
  }),
);

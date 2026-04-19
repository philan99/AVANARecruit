import { pgTable, serial, integer, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { companyProfiles } from "./companyProfiles";

export const companyUsers = pgTable(
  "company_users",
  {
    id: serial("id").primaryKey(),
    companyProfileId: integer("company_profile_id")
      .notNull()
      .references(() => companyProfiles.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    password: text("password"),
    name: text("name"),
    role: text("role").notNull().default("member"),
    verified: boolean("verified").notNull().default(false),
    invitedByUserId: integer("invited_by_user_id"),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => ({
    companyProfileIdIdx: index("company_users_company_profile_id_idx").on(t.companyProfileId),
    companyProfileRoleIdx: index("company_users_company_profile_id_role_idx").on(t.companyProfileId, t.role),
  }),
);

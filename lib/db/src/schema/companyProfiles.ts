import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  industry: text("industry"),
  website: text("website"),
  location: text("location"),
  description: text("description"),
  logoUrl: text("logo_url"),
  size: text("size"),
  founded: text("founded"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

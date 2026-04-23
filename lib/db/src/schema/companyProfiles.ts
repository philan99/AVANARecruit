import { pgTable, serial, text, timestamp, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  location: text("location"),
  postcode: text("postcode"),
  town: text("town"),
  country: text("country").default("United Kingdom"),
  lat: real("lat"),
  lng: real("lng"),
  description: text("description"),
  logoUrl: text("logo_url"),
  size: text("size"),
  founded: text("founded"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { companyProfiles } from "./companyProfiles";
import { candidatesTable } from "./candidates";

export const bookmarksTable = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  companyProfileId: integer("company_profile_id").notNull().references(() => companyProfiles.id, { onDelete: "cascade" }),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.companyProfileId, t.candidateId),
]);

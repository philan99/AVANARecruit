import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { candidatesTable } from "./candidates";

export const verificationsTable = pgTable("verifications", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }),
  candidateName: text("candidate_name").notNull(),
  roleTitle: text("role_title").notNull(),
  company: text("company").notNull(),
  verifierName: text("verifier_name").notNull(),
  verifierEmail: text("verifier_email").notNull(),
  message: text("message"),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  verifierResponse: text("verifier_response"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

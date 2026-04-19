import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { candidatesTable } from "./candidates";

export const savedSearchesTable = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id")
    .notNull()
    .references(() => candidatesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  filters: jsonb("filters").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

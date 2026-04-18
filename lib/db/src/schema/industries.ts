import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const industriesTable = pgTable("industries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  label: text("label").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

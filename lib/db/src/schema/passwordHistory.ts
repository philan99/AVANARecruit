import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const passwordHistoryTable = pgTable(
  "password_history",
  {
    id: serial("id").primaryKey(),
    accountType: text("account_type").notNull(),
    accountId: integer("account_id").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (table) => ({
    accountIdx: index("password_history_account_idx").on(
      table.accountType,
      table.accountId,
      table.createdAt,
    ),
  }),
);

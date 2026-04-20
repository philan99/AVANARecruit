import { pgTable, serial, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";

export const userSessions = pgTable(
  "user_sessions",
  {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 64 }).notNull().unique(),
    userType: varchar("user_type", { length: 20 }).notNull(),
    userId: integer("user_id").notNull(),
    lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    lastActivityIdx: index("user_sessions_last_activity_idx").on(t.lastActivityAt),
  })
);

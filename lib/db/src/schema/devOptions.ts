import { pgTable, serial, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const devOptionsTable = pgTable(
  "dev_options",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    value: text("value").notNull(),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    typeValueUnique: uniqueIndex("dev_options_type_value_unique").on(t.type, t.value),
  }),
);

export type DevOption = typeof devOptionsTable.$inferSelect;

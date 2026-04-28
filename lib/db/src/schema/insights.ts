import { pgTable, serial, varchar, integer, timestamp, jsonb, boolean, text, index, uniqueIndex } from "drizzle-orm/pg-core";

export const insightsWorkspaces = pgTable(
  "insights_workspaces",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    ownerEmail: varchar("owner_email", { length: 320 }).notNull(),
    billingTier: varchar("billing_tier", { length: 32 }).notNull().default("free"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ownerEmailUniqueIdx: uniqueIndex("insights_workspaces_owner_email_unique_idx").on(t.ownerEmail),
  }),
);

export const insightsWorkspaceMembers = pgTable(
  "insights_workspace_members",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull().references(() => insightsWorkspaces.id, { onDelete: "cascade" }),
    memberEmail: varchar("member_email", { length: 320 }).notNull(),
    role: varchar("role", { length: 32 }).notNull().default("member"),
    invitedAt: timestamp("invited_at", { withTimezone: true }).notNull().defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (t) => ({
    workspaceIdx: index("insights_workspace_members_workspace_idx").on(t.workspaceId),
    emailIdx: index("insights_workspace_members_email_idx").on(t.memberEmail),
    workspaceMemberUniqueIdx: uniqueIndex("insights_workspace_members_workspace_email_unique_idx").on(t.workspaceId, t.memberEmail),
  }),
);

export const insightsDataSources = pgTable(
  "insights_data_sources",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull().references(() => insightsWorkspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    sourceType: varchar("source_type", { length: 64 }).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    recordCount: integer("record_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("insights_data_sources_workspace_idx").on(t.workspaceId),
  }),
);

export const insightsSyncLogs = pgTable(
  "insights_sync_logs",
  {
    id: serial("id").primaryKey(),
    sourceId: integer("source_id").notNull().references(() => insightsDataSources.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull(),
    recordsSynced: integer("records_synced").notNull().default(0),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sourceIdx: index("insights_sync_logs_source_idx").on(t.sourceId),
  }),
);

export const insightsQueries = pgTable(
  "insights_queries",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull().references(() => insightsWorkspaces.id, { onDelete: "cascade" }),
    userEmail: varchar("user_email", { length: 320 }).notNull(),
    question: text("question").notNull(),
    sourcesUsed: jsonb("sources_used").$type<number[]>().notNull().default([]),
    response: jsonb("response").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("insights_queries_workspace_idx").on(t.workspaceId),
  }),
);

export const insightsDecisions = pgTable(
  "insights_decisions",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull().references(() => insightsWorkspaces.id, { onDelete: "cascade" }),
    userEmail: varchar("user_email", { length: 320 }).notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    decisionType: varchar("decision_type", { length: 64 }).notNull(),
    context: text("context"),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    report: jsonb("report").$type<Record<string, unknown>>(),
    confidenceScore: integer("confidence_score"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("insights_decisions_workspace_idx").on(t.workspaceId),
  }),
);

export const insightsDashboards = pgTable(
  "insights_dashboards",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull().references(() => insightsWorkspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    layout: jsonb("layout").$type<Record<string, unknown>>().notNull().default({}),
    createdByEmail: varchar("created_by_email", { length: 320 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("insights_dashboards_workspace_idx").on(t.workspaceId),
  }),
);

export const insightsWidgets = pgTable(
  "insights_widgets",
  {
    id: serial("id").primaryKey(),
    dashboardId: integer("dashboard_id").notNull().references(() => insightsDashboards.id, { onDelete: "cascade" }),
    widgetType: varchar("widget_type", { length: 64 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    position: jsonb("position").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    dashboardIdx: index("insights_widgets_dashboard_idx").on(t.dashboardId),
  }),
);

export const insightsAlerts = pgTable(
  "insights_alerts",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull().references(() => insightsWorkspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    conditionText: text("condition_text").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("insights_alerts_workspace_idx").on(t.workspaceId),
  }),
);

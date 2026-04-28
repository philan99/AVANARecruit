import { Router, type IRouter } from "express";
import { db, adminsTable, candidatesTable, companyUsers, insightsWorkspaces, insightsWorkspaceMembers } from "@workspace/db";
import { eq, or, and, sql } from "drizzle-orm";
import { validateAndTouch } from "../lib/sessions";

const router: IRouter = Router();

async function getEmailForSession(token: string): Promise<{ email: string; name: string | null } | null> {
  const session = await validateAndTouch(token);
  if (!session) return null;
  if (session.userType === "admin") {
    const [a] = await db.select({ email: adminsTable.email, name: adminsTable.name }).from(adminsTable).where(eq(adminsTable.id, session.userId));
    return a ? { email: a.email, name: a.name } : null;
  }
  if (session.userType === "candidate") {
    const [c] = await db.select({ email: candidatesTable.email, name: candidatesTable.name }).from(candidatesTable).where(eq(candidatesTable.id, session.userId));
    return c ? { email: c.email, name: c.name } : null;
  }
  if (session.userType === "company") {
    const [u] = await db.select({ email: companyUsers.email, name: companyUsers.name }).from(companyUsers).where(eq(companyUsers.id, session.userId));
    return u ? { email: u.email, name: u.name } : null;
  }
  return null;
}

router.post("/insights/bootstrap", async (req, res): Promise<void> => {
  try {
    const { token } = req.body ?? {};
    if (!token || typeof token !== "string") {
      res.status(401).json({ error: "Missing session token" });
      return;
    }
    const user = await getEmailForSession(token);
    if (!user) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }
    const email = user.email.toLowerCase();

    // Find a workspace where the user is owner OR a member
    const [ownedWs] = await db
      .select()
      .from(insightsWorkspaces)
      .where(eq(insightsWorkspaces.ownerEmail, email))
      .limit(1);

    let workspace = ownedWs;
    let workspaceRole: "owner" | "member" = "owner";

    if (!workspace) {
      const [memberRow] = await db
        .select({ ws: insightsWorkspaces, member: insightsWorkspaceMembers })
        .from(insightsWorkspaceMembers)
        .innerJoin(insightsWorkspaces, eq(insightsWorkspaces.id, insightsWorkspaceMembers.workspaceId))
        .where(eq(insightsWorkspaceMembers.memberEmail, email))
        .limit(1);
      if (memberRow) {
        workspace = memberRow.ws;
        workspaceRole = "member";
      }
    }

    if (!workspace) {
      // Auto-provision a workspace for first-time users.
      // Race-safe: rely on UNIQUE(owner_email) + ON CONFLICT DO NOTHING, then
      // re-select inside the same transaction so concurrent requests converge
      // on the same workspace row instead of creating duplicates.
      const friendlyName = (user.name && user.name.trim()) || email.split("@")[0] || "My";
      workspace = await db.transaction(async (tx) => {
        await tx
          .insert(insightsWorkspaces)
          .values({
            name: `${friendlyName}'s Workspace`,
            ownerEmail: email,
            billingTier: "free",
          })
          .onConflictDoNothing({ target: insightsWorkspaces.ownerEmail });
        const [ws] = await tx
          .select()
          .from(insightsWorkspaces)
          .where(eq(insightsWorkspaces.ownerEmail, email))
          .limit(1);
        if (!ws) {
          throw new Error("Failed to provision workspace");
        }
        // Owner must also be a member row. Idempotent via UNIQUE(workspace_id, member_email).
        await tx
          .insert(insightsWorkspaceMembers)
          .values({
            workspaceId: ws.id,
            memberEmail: email,
            role: "owner",
            acceptedAt: new Date(),
          })
          .onConflictDoNothing({
            target: [insightsWorkspaceMembers.workspaceId, insightsWorkspaceMembers.memberEmail],
          });
        return ws;
      });
      workspaceRole = "owner";
    }

    res.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        ownerEmail: workspace.ownerEmail,
        billingTier: workspace.billingTier,
        createdAt: workspace.createdAt,
      },
      role: workspaceRole,
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    req.log.error({ err }, "insights bootstrap failed");
    res.status(500).json({ error: "Bootstrap failed" });
  }
});

router.get("/insights/workspace/:id/members", async (req, res): Promise<void> => {
  try {
    // Bearer token only — never accept session tokens via query string
    // (they would leak via access logs, browser history, and referer headers).
    const authHeader = req.headers.authorization || "";
    const token = /^Bearer\s+/i.test(authHeader) ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
    if (!token) { res.status(401).json({ error: "Missing token" }); return; }
    const user = await getEmailForSession(token);
    if (!user) { res.status(401).json({ error: "Invalid session" }); return; }
    const wsId = parseInt(req.params.id, 10);
    if (!Number.isFinite(wsId)) { res.status(400).json({ error: "Bad workspace id" }); return; }

    const email = user.email.toLowerCase();
    // Authorize: must be owner or member
    const [ws] = await db.select().from(insightsWorkspaces).where(eq(insightsWorkspaces.id, wsId));
    if (!ws) { res.status(404).json({ error: "Workspace not found" }); return; }
    const [memberRow] = await db
      .select()
      .from(insightsWorkspaceMembers)
      .where(and(eq(insightsWorkspaceMembers.workspaceId, wsId), eq(insightsWorkspaceMembers.memberEmail, email)));
    if (ws.ownerEmail !== email && !memberRow) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const members = await db
      .select()
      .from(insightsWorkspaceMembers)
      .where(eq(insightsWorkspaceMembers.workspaceId, wsId));

    res.json({ members });
  } catch (err) {
    req.log.error({ err }, "list members failed");
    res.status(500).json({ error: "Failed" });
  }
});

// Suppress unused import warnings for or/sql until used in subsequent phases
void or; void sql;

export default router;

import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, companyUsers, companyUserInvites, companyProfiles } from "@workspace/db";
import { eq, and, isNull, sql, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";
import { createSession } from "../lib/sessions";

const router: IRouter = Router();

const ROLE_RANK: Record<string, number> = { owner: 3, admin: 2, member: 1 };
const VALID_ROLES = new Set(["owner", "admin", "member"]);
const ASSIGNABLE_ROLES = new Set(["admin", "member"]);

interface ActingUser {
  id: number;
  companyProfileId: number;
  role: string;
  email: string;
  name: string | null;
}

async function loadActingUser(req: Request): Promise<ActingUser | null> {
  const raw = req.headers["x-company-user-id"];
  const headerVal = Array.isArray(raw) ? raw[0] : raw;
  if (!headerVal) return null;
  const id = parseInt(headerVal, 10);
  if (isNaN(id)) return null;
  const [user] = await db
    .select({
      id: companyUsers.id,
      companyProfileId: companyUsers.companyProfileId,
      role: companyUsers.role,
      email: companyUsers.email,
      name: companyUsers.name,
    })
    .from(companyUsers)
    .where(eq(companyUsers.id, id));
  return user ?? null;
}

function requireCompanyMember(allowedRoles?: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      if (isNaN(companyId)) {
        res.status(400).json({ error: "Invalid company ID" });
        return;
      }
      const acting = await loadActingUser(req);
      if (!acting) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      if (acting.companyProfileId !== companyId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (allowedRoles && !allowedRoles.includes(acting.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }
      (req as any).actingUser = acting;
      (req as any).companyId = companyId;
      next();
    } catch (err) {
      req.log.error(err, "Auth check failed");
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

router.get("/companies/:companyId/team", requireCompanyMember(), async (req, res) => {
  try {
    const companyId = (req as any).companyId as number;
    const acting = (req as any).actingUser as ActingUser;

    const users = await db
      .select({
        id: companyUsers.id,
        email: companyUsers.email,
        name: companyUsers.name,
        role: companyUsers.role,
        verified: companyUsers.verified,
        lastLoginAt: companyUsers.lastLoginAt,
        createdAt: companyUsers.createdAt,
      })
      .from(companyUsers)
      .where(eq(companyUsers.companyProfileId, companyId));

    const invites = await db
      .select({
        id: companyUserInvites.id,
        email: companyUserInvites.email,
        role: companyUserInvites.role,
        invitedByName: companyUserInvites.invitedByName,
        expiresAt: companyUserInvites.expiresAt,
        createdAt: companyUserInvites.createdAt,
        lastSentAt: companyUserInvites.lastSentAt,
      })
      .from(companyUserInvites)
      .where(
        and(
          eq(companyUserInvites.companyProfileId, companyId),
          isNull(companyUserInvites.acceptedAt),
          isNull(companyUserInvites.cancelledAt),
        ),
      );

    res.json({ users, invites, actingUserRole: acting.role, actingUserId: acting.id });
  } catch (err) {
    req.log.error(err, "Failed to load team");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/companies/:companyId/invites", requireCompanyMember(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = (req as any).companyId as number;
    const acting = (req as any).actingUser as ActingUser;

    const rawEmail = req.body?.email;
    const role = String(req.body?.role || "member").toLowerCase();

    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!ASSIGNABLE_ROLES.has(role)) {
      return res.status(400).json({ error: "Role must be admin or member" });
    }

    const email = rawEmail.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const [existingUser] = await db
      .select({ id: companyUsers.id, companyProfileId: companyUsers.companyProfileId })
      .from(companyUsers)
      .where(eq(companyUsers.email, email));
    if (existingUser) {
      if (existingUser.companyProfileId === companyId) {
        return res.status(409).json({ error: "This person is already on your team" });
      }
      return res.status(409).json({ error: "This email is already in use on another account" });
    }

    const [pending] = await db
      .select({ id: companyUserInvites.id })
      .from(companyUserInvites)
      .where(
        and(
          eq(companyUserInvites.email, email),
          eq(companyUserInvites.companyProfileId, companyId),
          isNull(companyUserInvites.acceptedAt),
          isNull(companyUserInvites.cancelledAt),
        ),
      );
    if (pending) {
      return res.status(409).json({ error: "An invite has already been sent to this email" });
    }

    const [company] = await db
      .select({ name: companyProfiles.name })
      .from(companyProfiles)
      .where(eq(companyProfiles.id, companyId));

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invite] = await db
      .insert(companyUserInvites)
      .values({
        companyProfileId: companyId,
        email,
        role,
        token,
        invitedByUserId: acting.id,
        invitedByName: acting.name ?? acting.email,
        expiresAt,
      })
      .returning();

    const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
    const acceptUrl = `${origin}/accept-invite?token=${token}`;

    try {
      const { client, fromEmail } = await getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: email,
        subject: `You've been invited to join ${company?.name ?? "AVANA Recruit"}`,
        html: brandedEmail(
          `Join ${company?.name ?? "your team"} on AVANA Recruit`,
          `<p style="font-size:14px;color:#374151;line-height:1.6;">${acting.name ?? acting.email} has invited you to join <strong>${company?.name ?? "their company"}</strong> on AVANA Recruit as a <strong>${role}</strong>.</p>
           <p style="font-size:14px;color:#374151;line-height:1.6;">Click the button below to accept the invitation and set your password. This link will expire in 7 days.</p>
           <div style="text-align:center;margin:24px 0;">
             <a href="${acceptUrl}" style="background:#4CAF50;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">Accept Invitation</a>
           </div>`,
          "If you weren't expecting this invitation, you can safely ignore this email.",
        ),
      });
    } catch (mailErr) {
      req.log.error(mailErr, "Failed to send invite email");
    }

    res.json({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    req.log.error(err, "Failed to create invite");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/companies/:companyId/invites/:inviteId/resend",
  requireCompanyMember(["owner", "admin"]),
  async (req, res) => {
    try {
      const companyId = (req as any).companyId as number;
      const acting = (req as any).actingUser as ActingUser;
      const inviteId = parseInt(req.params.inviteId, 10);
      if (isNaN(inviteId)) return res.status(400).json({ error: "Invalid invite" });

      const [invite] = await db
        .select()
        .from(companyUserInvites)
        .where(eq(companyUserInvites.id, inviteId));
      if (!invite || invite.companyProfileId !== companyId) {
        return res.status(404).json({ error: "Invite not found" });
      }
      if (invite.acceptedAt || invite.cancelledAt) {
        return res.status(400).json({ error: "Invite is no longer active" });
      }

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db
        .update(companyUserInvites)
        .set({ expiresAt, lastSentAt: sql`now()` })
        .where(eq(companyUserInvites.id, inviteId));

      const [company] = await db
        .select({ name: companyProfiles.name })
        .from(companyProfiles)
        .where(eq(companyProfiles.id, companyId));

      const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
      const acceptUrl = `${origin}/accept-invite?token=${invite.token}`;
      try {
        const { client, fromEmail } = await getResendClient();
        await client.emails.send({
          from: fromEmail,
          to: invite.email,
          subject: `Reminder: Join ${company?.name ?? "AVANA Recruit"}`,
          html: brandedEmail(
            `Join ${company?.name ?? "your team"} on AVANA Recruit`,
            `<p style="font-size:14px;color:#374151;line-height:1.6;">${acting.name ?? acting.email} has re-sent your invitation to join <strong>${company?.name ?? "their company"}</strong> as a <strong>${invite.role}</strong>.</p>
             <div style="text-align:center;margin:24px 0;">
               <a href="${acceptUrl}" style="background:#4CAF50;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">Accept Invitation</a>
             </div>
             <p style="font-size:13px;color:#6b7280;">This link expires in 7 days.</p>`,
            "If you weren't expecting this invitation, you can safely ignore this email.",
          ),
        });
      } catch (mailErr) {
        req.log.error(mailErr, "Failed to resend invite email");
      }

      res.json({ success: true });
    } catch (err) {
      req.log.error(err, "Failed to resend invite");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/companies/:companyId/invites/:inviteId",
  requireCompanyMember(["owner", "admin"]),
  async (req, res) => {
    try {
      const companyId = (req as any).companyId as number;
      const inviteId = parseInt(req.params.inviteId, 10);
      if (isNaN(inviteId)) return res.status(400).json({ error: "Invalid invite" });

      const [invite] = await db
        .select()
        .from(companyUserInvites)
        .where(eq(companyUserInvites.id, inviteId));
      if (!invite || invite.companyProfileId !== companyId) {
        return res.status(404).json({ error: "Invite not found" });
      }

      await db
        .update(companyUserInvites)
        .set({ cancelledAt: sql`now()` })
        .where(eq(companyUserInvites.id, inviteId));

      res.json({ success: true });
    } catch (err) {
      req.log.error(err, "Failed to cancel invite");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.patch(
  "/companies/:companyId/users/:userId",
  requireCompanyMember(["owner"]),
  async (req, res) => {
    try {
      const companyId = (req as any).companyId as number;
      const acting = (req as any).actingUser as ActingUser;
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) return res.status(400).json({ error: "Invalid user" });

      const newRole = String(req.body?.role || "").toLowerCase();
      if (!VALID_ROLES.has(newRole)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const [target] = await db
        .select({ id: companyUsers.id, role: companyUsers.role, companyProfileId: companyUsers.companyProfileId })
        .from(companyUsers)
        .where(eq(companyUsers.id, userId));
      if (!target || target.companyProfileId !== companyId) {
        return res.status(404).json({ error: "User not found" });
      }

      if (target.role === "owner" && newRole !== "owner") {
        const otherOwners = await db
          .select({ id: companyUsers.id })
          .from(companyUsers)
          .where(
            and(
              eq(companyUsers.companyProfileId, companyId),
              eq(companyUsers.role, "owner"),
              ne(companyUsers.id, userId),
            ),
          );
        if (otherOwners.length === 0) {
          return res.status(400).json({ error: "Cannot demote the last owner" });
        }
      }

      if (newRole === "owner" && target.id !== acting.id) {
        // transferring ownership: leave existing owner as-is unless caller explicitly demotes themselves elsewhere
      }

      await db
        .update(companyUsers)
        .set({ role: newRole, updatedAt: sql`now()` })
        .where(eq(companyUsers.id, userId));

      res.json({ success: true });
    } catch (err) {
      req.log.error(err, "Failed to update user role");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/companies/:companyId/users/:userId",
  requireCompanyMember(["owner", "admin"]),
  async (req, res) => {
    try {
      const companyId = (req as any).companyId as number;
      const acting = (req as any).actingUser as ActingUser;
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) return res.status(400).json({ error: "Invalid user" });

      if (userId === acting.id) {
        return res.status(400).json({ error: "You cannot remove yourself" });
      }

      const [target] = await db
        .select({ id: companyUsers.id, role: companyUsers.role, companyProfileId: companyUsers.companyProfileId })
        .from(companyUsers)
        .where(eq(companyUsers.id, userId));
      if (!target || target.companyProfileId !== companyId) {
        return res.status(404).json({ error: "User not found" });
      }

      if (target.role === "owner") {
        return res.status(400).json({ error: "Owners cannot be removed. Demote them first." });
      }

      if ((ROLE_RANK[acting.role] ?? 0) <= (ROLE_RANK[target.role] ?? 0)) {
        return res.status(403).json({ error: "You cannot remove a user with equal or higher role" });
      }

      await db.delete(companyUsers).where(eq(companyUsers.id, userId));

      res.json({ success: true });
    } catch (err) {
      req.log.error(err, "Failed to remove user");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/team-invites/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const [invite] = await db
      .select({
        id: companyUserInvites.id,
        email: companyUserInvites.email,
        role: companyUserInvites.role,
        companyProfileId: companyUserInvites.companyProfileId,
        invitedByName: companyUserInvites.invitedByName,
        expiresAt: companyUserInvites.expiresAt,
        acceptedAt: companyUserInvites.acceptedAt,
        cancelledAt: companyUserInvites.cancelledAt,
      })
      .from(companyUserInvites)
      .where(eq(companyUserInvites.token, token));

    if (!invite) return res.status(404).json({ error: "Invite not found" });
    if (invite.cancelledAt) return res.status(410).json({ error: "This invite has been cancelled" });
    if (invite.acceptedAt) return res.status(410).json({ error: "This invite has already been used" });
    if (new Date(invite.expiresAt).getTime() < Date.now()) {
      return res.status(410).json({ error: "This invite has expired" });
    }

    const [company] = await db
      .select({ name: companyProfiles.name, logoUrl: companyProfiles.logoUrl })
      .from(companyProfiles)
      .where(eq(companyProfiles.id, invite.companyProfileId));

    res.json({
      email: invite.email,
      role: invite.role,
      invitedByName: invite.invitedByName,
      companyName: company?.name ?? null,
      companyLogoUrl: company?.logoUrl ?? null,
    });
  } catch (err) {
    req.log.error(err, "Failed to load invite");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/team-invites/:token/accept", async (req, res) => {
  try {
    const token = req.params.token;
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const [invite] = await db
      .select()
      .from(companyUserInvites)
      .where(eq(companyUserInvites.token, token));

    if (!invite) return res.status(404).json({ error: "Invite not found" });
    if (invite.cancelledAt) return res.status(410).json({ error: "This invite has been cancelled" });
    if (invite.acceptedAt) return res.status(410).json({ error: "This invite has already been used" });
    if (new Date(invite.expiresAt).getTime() < Date.now()) {
      return res.status(410).json({ error: "This invite has expired" });
    }

    const hashed = await bcrypt.hash(password, 10);

    let created;
    try {
      created = await db.transaction(async (tx) => {
        const [emailTaken] = await tx
          .select({ id: companyUsers.id })
          .from(companyUsers)
          .where(eq(companyUsers.email, invite.email));
        if (emailTaken) {
          throw new Error("EMAIL_TAKEN");
        }

        const [acceptedRows] = await tx
          .update(companyUserInvites)
          .set({ acceptedAt: sql`now()` })
          .where(
            and(
              eq(companyUserInvites.id, invite.id),
              isNull(companyUserInvites.acceptedAt),
              isNull(companyUserInvites.cancelledAt),
            ),
          )
          .returning({ id: companyUserInvites.id });
        if (!acceptedRows) {
          throw new Error("INVITE_RACE");
        }

        const [user] = await tx
          .insert(companyUsers)
          .values({
            companyProfileId: invite.companyProfileId,
            email: invite.email,
            password: hashed,
            name,
            role: invite.role,
            verified: true,
            invitedByUserId: invite.invitedByUserId,
            invitedAt: invite.createdAt,
            lastLoginAt: sql`now()`,
          })
          .returning();

        return user;
      });
    } catch (err: any) {
      if (err?.message === "EMAIL_TAKEN" || /unique|duplicate key/i.test(String(err?.message ?? ""))) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
      if (err?.message === "INVITE_RACE") {
        return res.status(410).json({ error: "This invite has already been used" });
      }
      throw err;
    }

    const [company] = await db
      .select({ name: companyProfiles.name })
      .from(companyProfiles)
      .where(eq(companyProfiles.id, invite.companyProfileId));

    const sessionToken = await createSession("company", created.id);
    res.json({
      success: true,
      role: "company",
      companyId: invite.companyProfileId,
      companyName: company?.name ?? null,
      companyUserId: created.id,
      companyUserRole: created.role,
      email: created.email,
      name: created.name,
      sessionToken,
    });
  } catch (err) {
    req.log.error(err, "Failed to accept invite");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

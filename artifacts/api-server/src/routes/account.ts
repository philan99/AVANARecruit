import { Router, type IRouter } from "express";
import { db, candidatesTable, companyProfiles, companyUsers, adminsTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

type AccountType = "candidate" | "company";

async function loadAccount(accountType: AccountType, accountId: number, companyUserId?: number | null) {
  if (accountType === "candidate") {
    const [row] = await db
      .select({ id: candidatesTable.id, name: candidatesTable.name, email: candidatesTable.email, password: candidatesTable.password, phone: candidatesTable.phone })
      .from(candidatesTable)
      .where(eq(candidatesTable.id, accountId));
    return row ? { ...row, type: "candidate" as const } : null;
  }
  // For companies, accountId is the companyProfileId. If a specific companyUserId
  // is provided (stage (b)+), resolve to that user row — otherwise fall back to
  // the Owner row for backward compatibility with older sessions.
  const userPredicate = Number.isFinite(Number(companyUserId))
    ? and(eq(companyUsers.companyProfileId, accountId), eq(companyUsers.id, Number(companyUserId)))
    : and(eq(companyUsers.companyProfileId, accountId), eq(companyUsers.role, "owner"));
  const [row] = await db
    .select({
      id: companyProfiles.id,
      userId: companyUsers.id,
      companyName: companyProfiles.name,
      personName: companyUsers.name,
      email: companyUsers.email,
      password: companyUsers.password,
    })
    .from(companyUsers)
    .innerJoin(companyProfiles, eq(companyProfiles.id, companyUsers.companyProfileId))
    .where(userPredicate);
  return row
    ? {
        id: row.id,
        userId: row.userId,
        name: row.companyName,
        personName: row.personName,
        companyName: row.companyName,
        email: row.email,
        password: row.password,
        phone: null as string | null,
        type: "company" as const,
      }
    : null;
}

async function emailTakenByOther(email: string, accountType: AccountType, accountId: number): Promise<boolean> {
  const lower = email.toLowerCase().trim();

  const [admin] = await db.select({ id: adminsTable.id }).from(adminsTable).where(eq(adminsTable.email, lower));
  if (admin) return true;

  if (accountType === "candidate") {
    const [c] = await db
      .select({ id: candidatesTable.id })
      .from(candidatesTable)
      .where(and(eq(candidatesTable.email, lower), ne(candidatesTable.id, accountId)));
    if (c) return true;
    const [u] = await db.select({ id: companyUsers.id }).from(companyUsers).where(eq(companyUsers.email, lower));
    if (u) return true;
  } else {
    // For company, accountId is the companyProfileId. Email collision against
    // any company_user row that does NOT belong to this company is a conflict.
    const [u] = await db
      .select({ id: companyUsers.id })
      .from(companyUsers)
      .where(and(eq(companyUsers.email, lower), ne(companyUsers.companyProfileId, accountId)));
    if (u) return true;
    const [c] = await db.select({ id: candidatesTable.id }).from(candidatesTable).where(eq(candidatesTable.email, lower));
    if (c) return true;
  }
  return false;
}

router.get("/account", async (req, res): Promise<void> => {
  try {
    const accountType = req.query.accountType as AccountType;
    const accountId = parseInt(String(req.query.accountId || ""), 10);
    const companyUserIdRaw = req.query.companyUserId;
    const companyUserId = companyUserIdRaw != null && companyUserIdRaw !== "" ? parseInt(String(companyUserIdRaw), 10) : null;
    if (!["candidate", "company"].includes(accountType) || !Number.isFinite(accountId)) {
      res.status(400).json({ error: "Invalid account" });
      return;
    }
    const acct = await loadAccount(accountType, accountId, companyUserId);
    if (!acct) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.json({
      id: acct.id,
      name: acct.name,
      personName: (acct as { personName?: string | null }).personName ?? null,
      companyName: (acct as { companyName?: string | null }).companyName ?? null,
      userId: (acct as { userId?: number }).userId ?? null,
      email: acct.email,
      phone: acct.phone,
      accountType: acct.type,
    });
  } catch (err) {
    console.error("Failed to load account:", err);
    res.status(500).json({ error: "Failed to load account" });
  }
});

router.post("/account/change-email", async (req, res): Promise<void> => {
  try {
    const { accountType, accountId, currentPassword, newEmail } = req.body || {};
    if (!["candidate", "company"].includes(accountType) || !Number.isFinite(Number(accountId))) {
      res.status(400).json({ error: "Invalid account" });
      return;
    }
    if (!currentPassword || !newEmail?.trim()) {
      res.status(400).json({ error: "Current password and new email are required" });
      return;
    }
    const lowerNew = String(newEmail).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerNew)) {
      res.status(400).json({ error: "Please enter a valid email address" });
      return;
    }

    const acct = await loadAccount(accountType, Number(accountId));
    if (!acct || !acct.password) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    const ok = await bcrypt.compare(currentPassword, acct.password);
    if (!ok) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    if (acct.email && acct.email.toLowerCase() === lowerNew) {
      res.status(400).json({ error: "That is already your current email" });
      return;
    }
    if (await emailTakenByOther(lowerNew, accountType, Number(accountId))) {
      res.status(409).json({ error: "That email is already in use" });
      return;
    }

    if (accountType === "candidate") {
      await db.update(candidatesTable).set({ email: lowerNew }).where(eq(candidatesTable.id, Number(accountId)));
    } else {
      const userId = (acct as { userId?: number }).userId;
      if (userId) {
        await db.update(companyUsers).set({ email: lowerNew }).where(eq(companyUsers.id, userId));
      }
    }

    res.json({ success: true, email: lowerNew });
  } catch (err) {
    console.error("Failed to change email:", err);
    res.status(500).json({ error: "Failed to change email" });
  }
});

router.post("/account/change-phone", async (req, res): Promise<void> => {
  try {
    const { accountType, accountId, phone } = req.body || {};
    if (accountType !== "candidate" || !Number.isFinite(Number(accountId))) {
      res.status(400).json({ error: "Invalid account" });
      return;
    }
    const trimmed = typeof phone === "string" ? phone.trim() : "";
    if (!trimmed) {
      res.status(400).json({ error: "Mobile number is required" });
      return;
    }
    const digitsOnly = trimmed.replace(/[^\d]/g, "");
    if (digitsOnly.length < 6) {
      res.status(400).json({ error: "Please enter a valid mobile number" });
      return;
    }
    if (trimmed.length > 32) {
      res.status(400).json({ error: "Phone number is too long" });
      return;
    }

    const acct = await loadAccount("candidate", Number(accountId));
    if (!acct) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    await db
      .update(candidatesTable)
      .set({ phone: trimmed })
      .where(eq(candidatesTable.id, Number(accountId)));

    res.json({ success: true, phone: trimmed });
  } catch (err) {
    console.error("Failed to change phone:", err);
    res.status(500).json({ error: "Failed to change phone" });
  }
});

router.post("/account/change-name", async (req, res): Promise<void> => {
  try {
    const { accountType, accountId, companyUserId, name } = req.body || {};
    if (!["candidate", "company"].includes(accountType) || !Number.isFinite(Number(accountId))) {
      res.status(400).json({ error: "Invalid account" });
      return;
    }
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    if (trimmed.length > 120) {
      res.status(400).json({ error: "Name is too long (max 120 characters)" });
      return;
    }

    if (accountType === "candidate") {
      await db.update(candidatesTable).set({ name: trimmed }).where(eq(candidatesTable.id, Number(accountId)));
      res.json({ success: true, name: trimmed });
      return;
    }

    // company: require an explicit companyUserId scoped to this company. Falls
    // back to the Owner row only when no companyUserId is supplied (legacy
    // sessions from before stage (b)).
    let targetUserId: number | null = null;
    if (Number.isFinite(Number(companyUserId))) {
      const [target] = await db
        .select({ id: companyUsers.id })
        .from(companyUsers)
        .where(and(eq(companyUsers.id, Number(companyUserId)), eq(companyUsers.companyProfileId, Number(accountId))));
      if (!target) {
        res.status(404).json({ error: "Team member not found for this company" });
        return;
      }
      targetUserId = target.id;
    } else {
      const [owner] = await db
        .select({ id: companyUsers.id })
        .from(companyUsers)
        .where(and(eq(companyUsers.companyProfileId, Number(accountId)), eq(companyUsers.role, "owner")));
      if (!owner) {
        res.status(404).json({ error: "Owner not found for this company" });
        return;
      }
      targetUserId = owner.id;
    }
    await db.update(companyUsers).set({ name: trimmed, updatedAt: new Date() }).where(eq(companyUsers.id, targetUserId));

    res.json({ success: true, name: trimmed });
  } catch (err) {
    console.error("Failed to change name:", err);
    res.status(500).json({ error: "Failed to change name" });
  }
});

router.post("/account/change-password", async (req, res): Promise<void> => {
  try {
    const { accountType, accountId, currentPassword, newPassword } = req.body || {};
    if (!["candidate", "company"].includes(accountType) || !Number.isFinite(Number(accountId))) {
      res.status(400).json({ error: "Invalid account" });
      return;
    }
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current and new password are required" });
      return;
    }
    if (String(newPassword).length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" });
      return;
    }

    const acct = await loadAccount(accountType, Number(accountId));
    if (!acct || !acct.password) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    const ok = await bcrypt.compare(currentPassword, acct.password);
    if (!ok) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    const sameAsOld = await bcrypt.compare(newPassword, acct.password);
    if (sameAsOld) {
      res.status(400).json({ error: "New password must be different from your current password" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    if (accountType === "candidate") {
      await db.update(candidatesTable).set({ password: hashed }).where(eq(candidatesTable.id, Number(accountId)));
    } else {
      const userId = (acct as { userId?: number }).userId;
      if (userId) {
        await db.update(companyUsers).set({ password: hashed }).where(eq(companyUsers.id, userId));
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to change password:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;

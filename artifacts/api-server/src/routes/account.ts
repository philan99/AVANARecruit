import { Router, type IRouter } from "express";
import { db, candidatesTable, companyProfiles, adminsTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

type AccountType = "candidate" | "company";

async function loadAccount(accountType: AccountType, accountId: number) {
  if (accountType === "candidate") {
    const [row] = await db
      .select({ id: candidatesTable.id, name: candidatesTable.name, email: candidatesTable.email, password: candidatesTable.password, phone: candidatesTable.phone })
      .from(candidatesTable)
      .where(eq(candidatesTable.id, accountId));
    return row ? { ...row, type: "candidate" as const } : null;
  }
  const [row] = await db
    .select({ id: companyProfiles.id, name: companyProfiles.name, email: companyProfiles.email, password: companyProfiles.password })
    .from(companyProfiles)
    .where(eq(companyProfiles.id, accountId));
  return row ? { ...row, phone: null as string | null, type: "company" as const } : null;
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
    const [comp] = await db.select({ id: companyProfiles.id }).from(companyProfiles).where(eq(companyProfiles.email, lower));
    if (comp) return true;
  } else {
    const [comp] = await db
      .select({ id: companyProfiles.id })
      .from(companyProfiles)
      .where(and(eq(companyProfiles.email, lower), ne(companyProfiles.id, accountId)));
    if (comp) return true;
    const [c] = await db.select({ id: candidatesTable.id }).from(candidatesTable).where(eq(candidatesTable.email, lower));
    if (c) return true;
  }
  return false;
}

router.get("/account", async (req, res): Promise<void> => {
  try {
    const accountType = req.query.accountType as AccountType;
    const accountId = parseInt(String(req.query.accountId || ""), 10);
    if (!["candidate", "company"].includes(accountType) || !Number.isFinite(accountId)) {
      res.status(400).json({ error: "Invalid account" });
      return;
    }
    const acct = await loadAccount(accountType, accountId);
    if (!acct) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.json({
      id: acct.id,
      name: acct.name,
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
      await db.update(companyProfiles).set({ email: lowerNew }).where(eq(companyProfiles.id, Number(accountId)));
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
    if (trimmed && trimmed.length > 32) {
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
      .set({ phone: trimmed || null })
      .where(eq(candidatesTable.id, Number(accountId)));

    res.json({ success: true, phone: trimmed || null });
  } catch (err) {
    console.error("Failed to change phone:", err);
    res.status(500).json({ error: "Failed to change phone" });
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
      await db.update(companyProfiles).set({ password: hashed }).where(eq(companyProfiles.id, Number(accountId)));
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to change password:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;

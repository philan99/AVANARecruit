import { Router, type IRouter } from "express";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db, passwordResetsTable, candidatesTable, companyProfiles, companyUsers } from "@workspace/db";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { validatePassword } from "../lib/password-policy";
import { isPasswordReused, recordPasswordHistory, PASSWORD_REUSE_ERROR } from "../lib/password-history";

const router: IRouter = Router();

router.post("/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const lowerEmail = String(email).toLowerCase().trim();

  const [candidate] = await db
    .select({ id: candidatesTable.id, email: candidatesTable.email })
    .from(candidatesTable)
    .where(eq(candidatesTable.email, lowerEmail));

  const [company] = await db
    .select({ id: companyUsers.id, email: companyUsers.email })
    .from(companyUsers)
    .where(eq(companyUsers.email, lowerEmail));

  if (!candidate && !company) {
    res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    return;
  }

  const accountType = candidate ? "candidate" : "company";
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(passwordResetsTable).values({
    email: lowerEmail,
    token,
    accountType,
    expiresAt,
  });

  try {
    const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
    const resetUrl = `${origin}/reset-password?token=${token}`;
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: lowerEmail,
      subject: "Reset Your AVANA Recruit Password",
      html: brandedEmail(
        "Reset Your Password",
        `<p style="font-size: 14px; color: #374151; line-height: 1.6;">We received a request to reset your password for your AVANA Recruit account.</p>
         <p style="font-size: 14px; color: #374151; line-height: 1.6;">Click the button below to set a new password. This link will expire in 1 hour.</p>
         <div style="text-align: center; margin: 24px 0;">
           <a href="${resetUrl}" style="background: #4CAF50; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
         </div>`,
        "If you didn't request this, you can safely ignore this email."
      ),
    });
  } catch (err: any) {
    console.error("Failed to send password reset email:", err);
  }

  res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
});

router.post("/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ error: "Token and password are required" });
    return;
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.ok) {
    res.status(400).json({ error: pwCheck.error });
    return;
  }

  const [resetRecord] = await db
    .select()
    .from(passwordResetsTable)
    .where(
      and(
        eq(passwordResetsTable.token, token),
        isNull(passwordResetsTable.usedAt),
        gt(passwordResetsTable.expiresAt, new Date())
      )
    );

  if (!resetRecord) {
    res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
    return;
  }

  const lowerResetEmail = String(resetRecord.email).toLowerCase().trim();

  let targetId: number | null = null;
  let currentHash: string | null = null;
  if (resetRecord.accountType === "candidate") {
    const [row] = await db
      .select({ id: candidatesTable.id, password: candidatesTable.password })
      .from(candidatesTable)
      .where(eq(candidatesTable.email, lowerResetEmail));
    targetId = row?.id ?? null;
    currentHash = row?.password ?? null;
  } else {
    const [row] = await db
      .select({ id: companyUsers.id, password: companyUsers.password })
      .from(companyUsers)
      .where(eq(companyUsers.email, lowerResetEmail));
    targetId = row?.id ?? null;
    currentHash = row?.password ?? null;
  }

  const historyType = resetRecord.accountType === "candidate" ? "candidate" : "company_user";
  if (
    targetId &&
    (await isPasswordReused(historyType, targetId, password, [currentHash]))
  ) {
    res.status(400).json({ error: PASSWORD_REUSE_ERROR });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (resetRecord.accountType === "candidate") {
    await db
      .update(candidatesTable)
      .set({ password: hashedPassword })
      .where(eq(candidatesTable.email, lowerResetEmail));
  } else {
    await db
      .update(companyUsers)
      .set({ password: hashedPassword })
      .where(eq(companyUsers.email, lowerResetEmail));
  }

  if (targetId && currentHash) {
    await recordPasswordHistory(historyType, targetId, currentHash);
  }

  await db
    .update(passwordResetsTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetsTable.id, resetRecord.id));

  res.json({ success: true, message: "Password has been reset successfully." });
});

export default router;

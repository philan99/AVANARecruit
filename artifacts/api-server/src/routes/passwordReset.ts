import { Router, type IRouter } from "express";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db, passwordResetsTable, candidatesTable, companyProfiles } from "@workspace/db";
import { getResendClient } from "../lib/resend";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.post("/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const [candidate] = await db
    .select({ id: candidatesTable.id, email: candidatesTable.email })
    .from(candidatesTable)
    .where(eq(candidatesTable.email, email));

  const [company] = await db
    .select({ id: companyProfiles.id, email: companyProfiles.email })
    .from(companyProfiles)
    .where(eq(companyProfiles.email, email));

  if (!candidate && !company) {
    res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    return;
  }

  const accountType = candidate ? "candidate" : "company";
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(passwordResetsTable).values({
    email,
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
      to: email,
      subject: "Reset Your AVANA Recruitment Password",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a2035;">Reset Your Password</h2>
        <p>We received a request to reset your password for your AVANA Recruitment account.</p>
        <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">AVANA Recruitment</p>
      </div>`,
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

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
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

  const hashedPassword = await bcrypt.hash(password, 10);

  if (resetRecord.accountType === "candidate") {
    await db
      .update(candidatesTable)
      .set({ password: hashedPassword })
      .where(eq(candidatesTable.email, resetRecord.email));
  } else {
    await db
      .update(companyProfiles)
      .set({ password: hashedPassword })
      .where(eq(companyProfiles.email, resetRecord.email));
  }

  await db
    .update(passwordResetsTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetsTable.id, resetRecord.id));

  res.json({ success: true, message: "Password has been reset successfully." });
});

export default router;

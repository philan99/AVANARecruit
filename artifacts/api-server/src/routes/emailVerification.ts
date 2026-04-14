import { Router, type IRouter } from "express";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db, emailVerificationsTable, candidatesTable, companyProfiles } from "@workspace/db";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";
import crypto from "crypto";

const router: IRouter = Router();

async function sendVerificationEmail(email: string, accountType: string, origin: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(emailVerificationsTable).values({
    email,
    token,
    accountType,
    expiresAt,
  });

  const verifyUrl = `${origin}/verify-email?token=${token}`;
  const { client, fromEmail } = await getResendClient();
  await client.emails.send({
    from: fromEmail,
    to: email,
    subject: "Verify Your AVANA Recruitment Account",
    html: brandedEmail(
      "Verify Your Email Address",
      `<p style="font-size: 14px; color: #374151; line-height: 1.6;">Thank you for creating an AVANA Recruitment account. Please verify your email address to activate your account.</p>
       <p style="font-size: 14px; color: #374151; line-height: 1.6;">Click the button below to verify. This link will expire in 24 hours.</p>
       <div style="text-align: center; margin: 24px 0;">
         <a href="${verifyUrl}" style="background: #4CAF50; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Verify Email</a>
       </div>`,
      "If you didn't create this account, you can safely ignore this email."
    ),
  });

  return token;
}

router.post("/verify-email/send", async (req, res): Promise<void> => {
  const { email, accountType } = req.body;
  if (!email || !accountType) {
    res.status(400).json({ error: "Email and account type are required" });
    return;
  }

  try {
    const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
    await sendVerificationEmail(email, accountType, origin);
    res.json({ success: true, message: "Verification email sent." });
  } catch (err: any) {
    console.error("Failed to send verification email:", err);
    res.status(500).json({ error: "Failed to send verification email." });
  }
});

router.post("/verify-email/resend", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const [candidate] = await db
    .select({ id: candidatesTable.id, verified: candidatesTable.verified })
    .from(candidatesTable)
    .where(eq(candidatesTable.email, email));

  const [company] = await db
    .select({ id: companyProfiles.id, verified: companyProfiles.verified })
    .from(companyProfiles)
    .where(eq(companyProfiles.email, email));

  if (!candidate && !company) {
    res.json({ success: true, message: "If an account with that email exists, a verification email has been sent." });
    return;
  }

  const account = candidate || company;
  if (account?.verified) {
    res.json({ success: true, message: "This email is already verified. You can log in." });
    return;
  }

  const accountType = candidate ? "candidate" : "company";

  try {
    const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
    await sendVerificationEmail(email, accountType, origin);
    res.json({ success: true, message: "Verification email sent." });
  } catch (err: any) {
    console.error("Failed to resend verification email:", err);
    res.status(500).json({ error: "Failed to send verification email." });
  }
});

router.get("/verify-email/:token", async (req, res): Promise<void> => {
  const { token } = req.params;

  const [record] = await db
    .select()
    .from(emailVerificationsTable)
    .where(
      and(
        eq(emailVerificationsTable.token, token),
        isNull(emailVerificationsTable.usedAt),
        gt(emailVerificationsTable.expiresAt, new Date())
      )
    );

  if (!record) {
    res.status(400).json({ error: "Invalid or expired verification link." });
    return;
  }

  if (record.accountType === "candidate") {
    await db
      .update(candidatesTable)
      .set({ verified: true })
      .where(eq(candidatesTable.email, record.email));
  } else {
    await db
      .update(companyProfiles)
      .set({ verified: true })
      .where(eq(companyProfiles.email, record.email));
  }

  await db
    .update(emailVerificationsTable)
    .set({ usedAt: new Date() })
    .where(eq(emailVerificationsTable.id, record.id));

  res.json({ success: true, message: "Email verified successfully. You can now log in." });
});

export { sendVerificationEmail };
export default router;

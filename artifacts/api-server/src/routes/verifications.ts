import { Router } from "express";
import { randomBytes } from "crypto";
import { db, verificationsTable, candidatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getResendClient } from "../lib/resend";

const router = Router();

router.post("/verifications", async (req, res): Promise<void> => {
  try {
    const { candidateId, roleTitle, company, verifierName, verifierEmail, message } = req.body;

    if (!candidateId || !roleTitle || !company || !verifierName || !verifierEmail) {
      res.status(400).json({ error: "All required fields must be provided" });
      return;
    }

    const [candidateRecord] = await db
      .select({ name: candidatesTable.name })
      .from(candidatesTable)
      .where(eq(candidatesTable.id, candidateId));

    if (!candidateRecord) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    const candidateName = candidateRecord.name;
    const token = randomBytes(32).toString("hex");

    const [verification] = await db
      .insert(verificationsTable)
      .values({
        candidateId,
        candidateName,
        roleTitle,
        company,
        verifierName,
        verifierEmail: verifierEmail.trim().toLowerCase(),
        message: message || null,
        token,
      })
      .returning();

    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : process.env.REPLIT_DEPLOYMENT_URL || "https://example.com";

    const verifyUrl = `${baseUrl}/verify/${token}`;

    try {
      const { client, fromEmail } = await getResendClient();

      await client.emails.send({
        from: fromEmail,
        to: verifierEmail.trim().toLowerCase(),
        subject: `AVANA Recruitment – Verification Request for ${candidateName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a2035; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #4CAF50; margin: 0; font-size: 20px;">Employment Verification Request</h1>
            </div>
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 14px; color: #374151; line-height: 1.6;">
                Dear ${verifierName},
              </p>
              <p style="font-size: 14px; color: #374151; line-height: 1.6;">
                <strong>${candidateName}</strong> has listed you as a reference for their role as <strong>${roleTitle}</strong> at <strong>${company}</strong>.
              </p>
              ${message ? `
              <div style="background: #ffffff; border-left: 3px solid #4CAF50; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0; font-weight: 600;">Message from ${candidateName}:</p>
                <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.5;">${message}</p>
              </div>
              ` : ""}
              <p style="font-size: 14px; color: #374151; line-height: 1.6;">
                We would greatly appreciate if you could take a moment to verify their employment by clicking the button below.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${verifyUrl}" style="background: #4CAF50; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                  Verify Employment
                </a>
              </div>
              <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-top: 24px;">
                This is an automated request from AVANA Recruitment. If you did not expect this email, you can safely ignore it.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send verification email", emailErr);
    }

    const { token: _t, verifierEmail: _e, ...safeVerification } = verification;
    res.status(201).json(safeVerification);
  } catch (err) {
    console.error("Failed to create verification", err);
    res.status(500).json({ error: "Failed to send verification request" });
  }
});

router.get("/verifications/token/:token", async (req, res): Promise<void> => {
  try {
    const { token } = req.params;

    const [verification] = await db
      .select()
      .from(verificationsTable)
      .where(eq(verificationsTable.token, token));

    if (!verification) {
      res.status(404).json({ error: "Verification not found" });
      return;
    }

    res.json(verification);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch verification" });
  }
});

router.post("/verifications/token/:token/respond", async (req, res): Promise<void> => {
  try {
    const { token } = req.params;
    const { status, response } = req.body;

    if (!status || !["verified", "declined"].includes(status)) {
      res.status(400).json({ error: "Status must be 'verified' or 'declined'" });
      return;
    }

    const [verification] = await db
      .select()
      .from(verificationsTable)
      .where(eq(verificationsTable.token, token));

    if (!verification) {
      res.status(404).json({ error: "Verification not found" });
      return;
    }

    if (verification.status !== "pending") {
      res.status(400).json({ error: "This verification has already been responded to" });
      return;
    }

    const [updated] = await db
      .update(verificationsTable)
      .set({
        status,
        verifierResponse: response || null,
        verifiedAt: new Date(),
      })
      .where(eq(verificationsTable.token, token))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update verification" });
  }
});

router.get("/candidates/:id/verifications", async (req, res): Promise<void> => {
  try {
    const candidateId = parseInt(req.params.id);

    const verifications = await db
      .select({
        id: verificationsTable.id,
        candidateId: verificationsTable.candidateId,
        candidateName: verificationsTable.candidateName,
        roleTitle: verificationsTable.roleTitle,
        company: verificationsTable.company,
        verifierName: verificationsTable.verifierName,
        status: verificationsTable.status,
        verifiedAt: verificationsTable.verifiedAt,
        createdAt: verificationsTable.createdAt,
      })
      .from(verificationsTable)
      .where(eq(verificationsTable.candidateId, candidateId))
      .orderBy(verificationsTable.createdAt);

    res.json(verifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
});

export default router;

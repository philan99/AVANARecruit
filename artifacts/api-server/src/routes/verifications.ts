import { Router } from "express";
import { randomBytes } from "crypto";
import { db, verificationsTable, candidatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";

const router = Router();

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return local + domain;
  const masked = local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  return masked + domain;
}

function formatMonthYear(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  // Strictly accept "YYYY-MM" or "YYYY-MM-DD"; otherwise drop silently.
  const m = v.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  if (!year || year < 1900 || year > 2100) return null;
  if (!month || month < 1 || month > 12) return null;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${monthNames[month - 1]} ${year}`;
}

function buildDateRange(startDate: unknown, endDate: unknown, current: unknown): string | null {
  const isCurrent = current === true;
  const start = formatMonthYear(startDate);
  const end = isCurrent ? "Present" : formatMonthYear(endDate);
  if (!start && !end) return null;
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

router.post("/verifications", async (req, res): Promise<void> => {
  try {
    const { candidateId, roleTitle, company, verifierName, verifierEmail, message, startDate, endDate, current } = req.body;

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

    const origin = req.get("origin") || req.get("referer")?.replace(/\/$/, "")
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://example.com");
    const verifyUrl = `${origin}/verify/${token}`;

    const dateRange = buildDateRange(startDate, endDate, current);

    try {
      const { client, fromEmail } = await getResendClient();

      await client.emails.send({
        from: fromEmail,
        to: verifierEmail.trim().toLowerCase(),
        subject: `AVANA Recruit – Verification Request for ${candidateName}`,
        html: brandedEmail(
          "Employment Verification Request",
          `<p style="font-size: 14px; color: #374151; line-height: 1.6;">Dear ${verifierName},</p>
           <p style="font-size: 14px; color: #374151; line-height: 1.6;">
             <strong>${candidateName}</strong> has listed you as a reference for their role as <strong>${roleTitle}</strong> at <strong>${company}</strong>${dateRange ? ` (<strong>${dateRange}</strong>)` : ""}.
           </p>
           ${dateRange ? `
           <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
             <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0; font-weight: 600;">Role details</p>
             <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.5;">
               <strong>${roleTitle}</strong> at <strong>${company}</strong><br />
               <span style="color: #6b7280;">Dates:</span> ${dateRange}
             </p>
           </div>
           ` : ""}
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
           </div>`,
          "This is an automated request from AVANA Recruit. If you did not expect this email, you can safely ignore it."
        ),
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

    // Notify the candidate that their verification request has been answered.
    // Failures here must not break the verifier's response submission, so we
    // swallow errors after logging.
    try {
      const [candidate] = await db
        .select({ name: candidatesTable.name, email: candidatesTable.email })
        .from(candidatesTable)
        .where(eq(candidatesTable.id, verification.candidateId));

      if (candidate?.email) {
        const { client, fromEmail } = await getResendClient();
        const isVerified = status === "verified";
        const headlineColor = isVerified ? "#4CAF50" : "#dc2626";
        const headlineLabel = isVerified ? "Verified" : "Declined";
        const responseText = (response || "").trim();
        const greetingName = escapeHtml(candidate.name?.split(" ")[0] || candidate.name || "there");

        await client.emails.send({
          from: fromEmail,
          to: candidate.email,
          subject: `AVANA Recruit – Your verification request was ${isVerified ? "verified" : "declined"}`,
          html: brandedEmail(
            isVerified ? "Verification Confirmed" : "Verification Declined",
            `<p style="font-size: 14px; color: #374151; line-height: 1.6;">Hi ${greetingName},</p>
             <p style="font-size: 14px; color: #374151; line-height: 1.6;">
               <strong>${escapeHtml(verification.verifierName)}</strong> has responded to your employment verification request for your role as
               <strong>${escapeHtml(verification.roleTitle)}</strong> at <strong>${escapeHtml(verification.company)}</strong>.
             </p>
             <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 16px 0;">
               <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0; font-weight: 600;">Response</p>
               <p style="font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: ${headlineColor};">${headlineLabel}</p>
               ${responseText ? `
                 <p style="font-size: 13px; color: #6b7280; margin: 12px 0 6px 0; font-weight: 600;">Message from ${escapeHtml(verification.verifierName)}</p>
                 <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(responseText)}</p>
               ` : `
                 <p style="font-size: 13px; color: #9ca3af; margin: 0; font-style: italic;">No additional message was provided.</p>
               `}
             </div>
             <p style="font-size: 14px; color: #374151; line-height: 1.6;">
               You can view all of your verification responses in your AVANA Recruit profile at any time.
             </p>`,
            "This is an automated notification from AVANA Recruit. You are receiving it because you sent a verification request from your candidate profile."
          ),
        });
      }
    } catch (notifyErr) {
      console.error("Failed to send candidate verification response email", notifyErr);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update verification" });
  }
});

router.delete("/verifications/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { candidateId } = req.body;

    if (!candidateId) {
      res.status(400).json({ error: "candidateId is required" });
      return;
    }

    const [verification] = await db
      .select()
      .from(verificationsTable)
      .where(eq(verificationsTable.id, id));

    if (!verification) {
      res.status(404).json({ error: "Verification not found" });
      return;
    }

    if (verification.candidateId !== candidateId) {
      res.status(403).json({ error: "Not authorised to cancel this verification" });
      return;
    }

    if (verification.status !== "pending") {
      res.status(400).json({ error: "Only pending verifications can be cancelled" });
      return;
    }

    await db
      .delete(verificationsTable)
      .where(eq(verificationsTable.id, id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel verification" });
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
        verifierEmail: verificationsTable.verifierEmail,
        message: verificationsTable.message,
        status: verificationsTable.status,
        verifierResponse: verificationsTable.verifierResponse,
        verifiedAt: verificationsTable.verifiedAt,
        createdAt: verificationsTable.createdAt,
      })
      .from(verificationsTable)
      .where(eq(verificationsTable.candidateId, candidateId))
      .orderBy(verificationsTable.createdAt);

    const masked = verifications.map(v => ({
      ...v,
      verifierEmail: maskEmail(v.verifierEmail),
    }));

    res.json(masked);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
});

export default router;

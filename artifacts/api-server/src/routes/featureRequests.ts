import { Router } from "express";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";

const router = Router();

const ALLOWED_TYPES = new Set(["company", "candidate"]);
const ALLOWED_PRIORITY = new Set(["nice-to-have", "important", "critical"]);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

router.post("/feature-requests", async (req, res) => {
  try {
    const {
      requesterType,
      name,
      email,
      company,
      title,
      category,
      priority,
      problem,
      proposal,
    } = req.body || {};

    if (!requesterType || !ALLOWED_TYPES.has(requesterType)) {
      return res.status(400).json({ error: "Invalid requester type" });
    }
    if (!name?.trim() || !email?.trim() || !title?.trim() || !proposal?.trim()) {
      return res.status(400).json({ error: "Name, email, title and proposal are required" });
    }
    if (priority && !ALLOWED_PRIORITY.has(priority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }
    if (requesterType === "company" && !company?.trim()) {
      return res.status(400).json({ error: "Company name is required" });
    }

    try {
      const { client, fromEmail } = await getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: "enhancements@avanarecruit.ai",
        replyTo: email.trim(),
        subject: `[AVANA Feature Request] ${title.trim()}`,
        html: brandedEmail(
          "New Feature Request",
          `<table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 130px; vertical-align: top;"><strong>From:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${requesterType === "company" ? "Company" : "Candidate"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(name.trim())}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${escapeHtml(email.trim())}" style="color: #4CAF50;">${escapeHtml(email.trim())}</a></td>
              </tr>
              ${requesterType === "company" ? `<tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Company:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(company.trim())}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Title:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(title.trim())}</td>
              </tr>
              ${category ? `<tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Category:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(String(category).trim())}</td>
              </tr>` : ""}
              ${priority ? `<tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Priority:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(String(priority).trim())}</td>
              </tr>` : ""}
            </table>
            ${problem?.trim() ? `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;"><strong>Problem / Why:</strong></p>
              <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(problem.trim())}</div>
            </div>` : ""}
            <div style="margin-top: 16px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;"><strong>Proposed feature:</strong></p>
              <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(proposal.trim())}</div>
            </div>`,
          "Reply directly to this email to follow up with the requester."
        ),
      });
    } catch (emailError) {
      console.error("Failed to send feature request email:", emailError);
      return res.status(500).json({ error: "Failed to submit feature request" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Feature request error:", error);
    res.status(500).json({ error: "Failed to submit feature request" });
  }
});

export default router;

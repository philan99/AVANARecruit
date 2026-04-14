import { Router } from "express";
import { db, contactSubmissions } from "@workspace/db";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";

const router = Router();

router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message, contactType, company } = req.body;

    if (!contactType || !["company", "candidate"].includes(contactType)) {
      return res.status(400).json({ error: "Please select Company or Candidate" });
    }
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (contactType === "company" && !company?.trim()) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        contactType,
        company: contactType === "company" ? company.trim() : null,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      })
      .returning();

    try {
      const { client, fromEmail } = await getResendClient();

      await client.emails.send({
        from: fromEmail,
        to: fromEmail,
        replyTo: email.trim(),
        subject: `[AVANA Contact] ${subject.trim()}`,
        html: brandedEmail(
          "New Contact Form Submission",
          `<table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;"><strong>Type:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${contactType === "company" ? "Company" : "Candidate"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${name.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email.trim()}" style="color: #4CAF50;">${email.trim()}</a></td>
              </tr>
              ${contactType === "company" ? `<tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Company:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${company.trim()}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${subject.trim()}</td>
              </tr>
            </table>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;"><strong>Message:</strong></p>
              <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message.trim()}</div>
            </div>`,
          `Submission ID: ${submission.id} &bull; Reply directly to this email to respond to the sender.`
        ),
      });
    } catch (emailError) {
      console.error("Failed to send contact email notification:", emailError);
    }

    res.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to submit contact form" });
  }
});

export default router;

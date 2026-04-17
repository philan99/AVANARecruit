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
    subject: "Verify Your AVANA Recruit Account",
    html: brandedEmail(
      "Verify Your Email Address",
      `<p style="font-size: 14px; color: #374151; line-height: 1.6;">Thank you for creating an AVANA Recruit account. Please verify your email address to activate your account.</p>
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
    const [candidate] = await db
      .update(candidatesTable)
      .set({ verified: true })
      .where(eq(candidatesTable.email, record.email))
      .returning({
        name: candidatesTable.name,
        email: candidatesTable.email,
      });

    try {
      const { client, fromEmail } = await getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: "recruitment@avanarecruit.ai",
        subject: `New Verified Candidate – ${candidate.name || "Unknown"}`,
        html: brandedEmail(
          "New Verified Candidate",
          `<p style="font-size: 14px; color: #374151; line-height: 1.6;">A new candidate has just verified their account on the platform.</p>
           <table style="width: 100%; border-collapse: collapse;">
             <tr>
               <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;"><strong>Name:</strong></td>
               <td style="padding: 8px 0; font-size: 14px;">${candidate.name || "Not provided"}</td>
             </tr>
             <tr>
               <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Email:</strong></td>
               <td style="padding: 8px 0; font-size: 14px;">${candidate.email || "Not provided"}</td>
             </tr>
           </table>`
        ),
      });
    } catch (notifyErr) {
      req.log.error(notifyErr, "Failed to send verified-candidate notification");
    }

    try {
      const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
      const { client, fromEmail } = await getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: candidate.email!,
        subject: "Welcome to AVANA Recruit — What's Next",
        html: brandedEmail(
          `Welcome${candidate.name ? `, ${candidate.name.split(" ")[0]}` : ""}!`,
          `<p style="font-size: 14px; color: #374151; line-height: 1.6;">Your AVANA Recruit account is now verified and ready to use. When you sign in, we'll take you through a quick guided setup — it only takes about 5 minutes, and your progress saves automatically as you go.</p>

           <div style="background: #f5f9f5; border: 1px solid rgba(76,175,80,0.3); border-radius: 8px; padding: 16px; margin: 20px 0;">
             <p style="font-size: 14px; color: #1a2035; line-height: 1.6; margin: 0 0 6px 0;"><strong>✨ Upload your CV and AI will do the heavy lifting</strong></p>
             <p style="font-size: 13px; color: #374151; line-height: 1.6; margin: 0;">In the first step we'll ask you to upload your CV. Our AI then reads it and pre-fills your skills, experience, education, location and more — so you only need to review and tweak. Fields it's unsure about are flagged for you.</p>
           </div>

           <h3 style="font-size: 16px; color: #1a2035; margin: 24px 0 8px 0;">What's in the guided setup</h3>
           <ol style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 12px 0; padding-left: 20px;">
             <li><strong>Upload your CV</strong> — for AI pre-fill and so companies can see your full background.</li>
             <li><strong>The basics</strong> — current job title, location, years of experience, phone and a short professional summary.</li>
             <li><strong>Your skills</strong> — these make up 35% of your match score, the biggest single factor.</li>
             <li><strong>Education and qualifications</strong> — your highest qualification plus any certifications.</li>
             <li><strong>Work experience</strong> — your previous roles with dates and a short description.</li>
             <li><strong>What you're looking for</strong> — preferred job types, workplace style and industries.</li>
             <li><strong>Social links</strong> — LinkedIn, portfolio and other profiles (all optional).</li>
           </ol>

           <h3 style="font-size: 16px; color: #1a2035; margin: 24px 0 8px 0;">After you're set up</h3>
           <ul style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 12px 0; padding-left: 20px;">
             <li><strong>See your AI matches instantly</strong> — we rank live jobs by how well they fit your profile.</li>
             <li><strong>Add references and verifications</strong> — even one or two verified references can boost your match score by up to 30%.</li>
             <li><strong>Browse jobs and companies</strong> — explore opportunities and discover places you'd love to work.</li>
             <li><strong>Set up job alerts</strong> — be the first to know when matching roles go live.</li>
           </ul>

           <div style="text-align: center; margin: 32px 0 8px 0;">
             <a href="${origin}/" style="background: #4CAF50; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Sign In and Start Setup</a>
           </div>

           <p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin: 24px 0 0 0;">If you have any questions or need help getting started, just reply to this email or contact us at <a href="mailto:recruitment@avanarecruit.ai" style="color: #4CAF50; text-decoration: none;">recruitment@avanarecruit.ai</a>.</p>`,
          "We're excited to help you find your next opportunity."
        ),
      });
    } catch (err) {
      req.log.error(err, "Failed to send candidate welcome email");
    }
  } else {
    const [company] = await db
      .update(companyProfiles)
      .set({ verified: true })
      .where(eq(companyProfiles.email, record.email))
      .returning({
        name: companyProfiles.name,
        email: companyProfiles.email,
      });

    try {
      const { client, fromEmail } = await getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: "recruitment@avanarecruit.ai",
        subject: `New Verified Company – ${company.name || "Unknown"}`,
        html: brandedEmail(
          "New Verified Company",
          `<p style="font-size: 14px; color: #374151; line-height: 1.6;">A new company has just verified their account on the platform.</p>
           <table style="width: 100%; border-collapse: collapse;">
             <tr>
               <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;"><strong>Company:</strong></td>
               <td style="padding: 8px 0; font-size: 14px;">${company.name || "Not provided"}</td>
             </tr>
             <tr>
               <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Email:</strong></td>
               <td style="padding: 8px 0; font-size: 14px;">${company.email || "Not provided"}</td>
             </tr>
           </table>`
        ),
      });
    } catch (notifyErr) {
      req.log.error(notifyErr, "Failed to send verified-company notification");
    }

    try {
      const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
      const { client, fromEmail } = await getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: company.email!,
        subject: "Welcome to AVANA Recruit — What's Next",
        html: brandedEmail(
          `Welcome${company.name ? `, ${company.name}` : ""}!`,
          `<p style="font-size: 14px; color: #374151; line-height: 1.6;">Your AVANA Recruit company account is now verified and ready to use. Here's how to get up and running and start finding great candidates.</p>

           <h3 style="font-size: 16px; color: #1a2035; margin: 24px 0 8px 0;">1. Complete your company profile</h3>
           <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px 0;">Add your industry, location, website, company description and logo so candidates can learn about your business and what makes you a great place to work.</p>

           <h3 style="font-size: 16px; color: #1a2035; margin: 24px 0 8px 0;">2. Post your first job</h3>
           <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px 0;">Create a detailed job listing with the skills, experience, education and location you're looking for. The more detail you provide, the better our AI can match you with the right candidates.</p>

           <h3 style="font-size: 16px; color: #1a2035; margin: 24px 0 8px 0;">3. Review your AI-powered matches</h3>
           <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px 0;">As soon as your job is live, our matching engine ranks candidates by skills, experience, location, verifications and education. View match scores and breakdowns to focus on the strongest fits first.</p>

           <h3 style="font-size: 16px; color: #1a2035; margin: 24px 0 8px 0;">4. Browse candidates directly</h3>
           <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px 0;">Search the candidate pool, view full profiles and verifications, and bookmark the people you'd like to engage with.</p>

           <h3 style="font-size: 16px; color: #1a2035; margin: 24px 0 8px 0;">5. Manage your hiring pipeline</h3>
           <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px 0;">Move candidates through the stages — shortlisted, screened, interviewed, offered and hired — all from one Kanban-style view.</p>

           <h3 style="font-size: 16px; color: #1a2035; margin: 24px 0 8px 0;">6. Set up candidate alerts</h3>
           <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px 0;">Get notified when new candidates that match your job criteria join the platform, so you can engage them first.</p>

           <div style="text-align: center; margin: 32px 0 8px 0;">
             <a href="${origin}/" style="background: #4CAF50; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Sign In to Your Account</a>
           </div>

           <p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin: 24px 0 0 0;">If you have any questions or need help getting started, just reply to this email or contact us at <a href="mailto:recruitment@avanarecruit.ai" style="color: #4CAF50; text-decoration: none;">recruitment@avanarecruit.ai</a>.</p>`,
          "We're excited to help you find your next great hire."
        ),
      });
    } catch (err) {
      req.log.error(err, "Failed to send company welcome email");
    }
  }

  await db
    .update(emailVerificationsTable)
    .set({ usedAt: new Date() })
    .where(eq(emailVerificationsTable.id, record.id));

  res.json({ success: true, message: "Email verified successfully. You can now log in." });
});

export { sendVerificationEmail };
export default router;

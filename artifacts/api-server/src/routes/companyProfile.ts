import { Router, type IRouter } from "express";
import { db, companyProfiles, jobsTable } from "@workspace/db";
import { eq, sql, inArray } from "drizzle-orm";
import { CreateCompanyProfileBody } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";

const router: IRouter = Router();

router.get("/companies", async (req, res) => {
  try {
    const all = await db
      .select({
        id: companyProfiles.id,
        name: companyProfiles.name,
        industry: companyProfiles.industry,
        website: companyProfiles.website,
        location: companyProfiles.location,
        description: companyProfiles.description,
        logoUrl: companyProfiles.logoUrl,
        size: companyProfiles.size,
        founded: companyProfiles.founded,
      })
      .from(companyProfiles);
    res.json(all);
  } catch (err) {
    req.log.error(err, "Failed to list companies");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/companies/:id", async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    const [company] = await db
      .select({
        id: companyProfiles.id,
        name: companyProfiles.name,
        industry: companyProfiles.industry,
        website: companyProfiles.website,
        location: companyProfiles.location,
        description: companyProfiles.description,
        logoUrl: companyProfiles.logoUrl,
        size: companyProfiles.size,
        founded: companyProfiles.founded,
      })
      .from(companyProfiles)
      .where(eq(companyProfiles.id, companyId));
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    const jobs = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.companyProfileId, companyId));
    const openJobs = jobs.filter(j => j.status === "open");
    res.json({ ...company, jobs: openJobs, totalJobs: jobs.length });
  } catch (err) {
    req.log.error(err, "Failed to get company detail");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/companies/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [company] = await db.select().from(companyProfiles).where(eq(companyProfiles.email, email));
    if (!company) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!company.password) {
      return res.status(401).json({ error: "No password set for this account. Please contact an admin." });
    }

    const valid = await bcrypt.compare(password, company.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!company.verified) {
      return res.status(403).json({ error: "Please verify your email address before logging in.", unverified: true, email: company.email });
    }

    res.json({ success: true, companyId: company.id, companyName: company.name });
  } catch (err) {
    req.log.error(err, "Company login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/company-profile", async (req, res) => {
  try {
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : null;
    let profile;
    if (companyId) {
      [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, companyId));
    } else {
      [profile] = await db.select().from(companyProfiles).limit(1);
    }
    if (!profile) {
      return res.status(404).json({ error: "No company profile found" });
    }
    res.json(profile);
  } catch (err) {
    req.log.error(err, "Failed to get company profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/company-profile", async (req, res) => {
  try {
    const parsed = CreateCompanyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Company name is required" });
    }
    const body = parsed.data;

    const password = req.body.password;

    if (body.email) {
      const [existingEmail] = await db
        .select()
        .from(companyProfiles)
        .where(eq(companyProfiles.email, body.email));
      if (existingEmail) {
        return res.status(409).json({ error: "A company with this email already exists" });
      }
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [created] = await db
      .insert(companyProfiles)
      .values({
        ...body,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      })
      .returning();

    if (created.email && password) {
      try {
        const { sendVerificationEmail } = await import("./emailVerification");
        const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
        await sendVerificationEmail(created.email, "company", origin);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    }

    try {
      const { client, fromEmail } = await getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: "recruitment@avanarecruit.ai",
        subject: `New Company Registration – ${created.name || "Unknown"}`,
        html: brandedEmail(
          "New Company Registration",
          `<p style="font-size: 14px; color: #374151; line-height: 1.6;">A new company has registered on the platform.</p>
           <table style="width: 100%; border-collapse: collapse;">
             <tr>
               <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;"><strong>Company:</strong></td>
               <td style="padding: 8px 0; font-size: 14px;">${created.name || "Not provided"}</td>
             </tr>
             <tr>
               <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Email:</strong></td>
               <td style="padding: 8px 0; font-size: 14px;">${created.email || "Not provided"}</td>
             </tr>
             <tr>
               <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Industry:</strong></td>
               <td style="padding: 8px 0; font-size: 14px;">${created.industry || "Not provided"}</td>
             </tr>
             <tr>
               <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Location:</strong></td>
               <td style="padding: 8px 0; font-size: 14px;">${created.location || "Not provided"}</td>
             </tr>
           </table>`
        ),
      });
    } catch (notifyErr) {
      console.error("Failed to send new company notification:", notifyErr);
    }

    res.json(created);
  } catch (err) {
    req.log.error(err, "Failed to save company profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/company-profile/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const [existing] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Company not found" });
    }

    const { password: _pw, id: _id, createdAt: _ca, ...updateFields } = req.body;

    const [updated] = await db
      .update(companyProfiles)
      .set({
        ...updateFields,
        updatedAt: sql`now()`,
      })
      .where(eq(companyProfiles.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error(err, "Failed to update company profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/companies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const [existing] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Company not found" });
    }

    await db.delete(jobsTable).where(eq(jobsTable.companyProfileId, id));

    await db.delete(companyProfiles).where(eq(companyProfiles.id, id));

    res.sendStatus(204);
  } catch (err) {
    req.log.error(err, "Failed to delete company");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

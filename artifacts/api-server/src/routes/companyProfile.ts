import { Router, type IRouter } from "express";
import { db, companyProfiles, companyUsers, jobsTable } from "@workspace/db";
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
        linkedinUrl: companyProfiles.linkedinUrl,
        twitterUrl: companyProfiles.twitterUrl,
        facebookUrl: companyProfiles.facebookUrl,
        instagramUrl: companyProfiles.instagramUrl,
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
        linkedinUrl: companyProfiles.linkedinUrl,
        twitterUrl: companyProfiles.twitterUrl,
        facebookUrl: companyProfiles.facebookUrl,
        instagramUrl: companyProfiles.instagramUrl,
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

    const lowerEmail = String(email).toLowerCase().trim();

    const [user] = await db
      .select({
        id: companyUsers.id,
        companyProfileId: companyUsers.companyProfileId,
        email: companyUsers.email,
        password: companyUsers.password,
        verified: companyUsers.verified,
        role: companyUsers.role,
        name: companyUsers.name,
        companyName: companyProfiles.name,
      })
      .from(companyUsers)
      .innerJoin(companyProfiles, eq(companyProfiles.id, companyUsers.companyProfileId))
      .where(eq(companyUsers.email, lowerEmail));

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "No password set for this account. Please contact an admin." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.verified) {
      return res.status(403).json({ error: "Please verify your email address before logging in.", unverified: true, email: user.email });
    }

    await db.update(companyUsers).set({ lastLoginAt: sql`now()` }).where(eq(companyUsers.id, user.id));

    res.json({
      success: true,
      companyId: user.companyProfileId,
      companyName: user.companyName,
      companyUserId: user.id,
      companyUserRole: user.role,
      name: user.name,
    });
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
    const lowerEmail = body.email ? String(body.email).toLowerCase().trim() : null;

    if (lowerEmail) {
      const [existingUser] = await db
        .select({ id: companyUsers.id })
        .from(companyUsers)
        .where(eq(companyUsers.email, lowerEmail));
      if (existingUser) {
        return res.status(409).json({ error: "A company with this email already exists" });
      }
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const { email: _ignoreEmail, ...profileBody } = body as Record<string, unknown>;

    const created = await db.transaction(async (tx) => {
      const [profile] = await tx
        .insert(companyProfiles)
        .values(profileBody as typeof companyProfiles.$inferInsert)
        .returning();

      if (lowerEmail && hashedPassword) {
        await tx.insert(companyUsers).values({
          companyProfileId: profile.id,
          email: lowerEmail,
          password: hashedPassword,
          name: body.name,
          role: "owner",
          verified: false,
        });
      }

      return profile;
    });

    if (lowerEmail && password) {
      try {
        const { sendVerificationEmail } = await import("./emailVerification");
        const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
        await sendVerificationEmail(lowerEmail, "company", origin);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    }

    res.json({ ...created, email: lowerEmail });
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

    const { password: _pw, id: _id, createdAt: _ca, email: _em, verified: _v, ...updateFields } = req.body;

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

    const [owner] = await db
      .select({ email: companyUsers.email })
      .from(companyUsers)
      .where(eq(companyUsers.companyProfileId, id))
      .orderBy(companyUsers.id)
      .limit(1);
    const ownerEmail = owner?.email ?? "—";

    await db.delete(jobsTable).where(eq(jobsTable.companyProfileId, id));

    await db.delete(companyProfiles).where(eq(companyProfiles.id, id));

    try {
      const { client, fromEmail } = await getResendClient();
      const html = brandedEmail(
        "Company account deleted",
        `
          <p>A company account has been deleted from AVANA Recruit.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:6px 0;color:#64748b;">Company name</td><td style="padding:6px 0;font-weight:600;">${existing.name ?? "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Owner email</td><td style="padding:6px 0;font-weight:600;">${ownerEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Company ID</td><td style="padding:6px 0;font-weight:600;">${existing.id}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Deleted at</td><td style="padding:6px 0;font-weight:600;">${new Date().toISOString()}</td></tr>
          </table>
          <p>All associated jobs, bookmarks and alerts were removed.</p>
        `,
      );
      await client.emails.send({
        from: fromEmail,
        to: "recruitment@avanarecruit.ai",
        subject: `[AVANA Recruit] Company account deleted — ${existing.name ?? ownerEmail}`,
        html,
      });
    } catch (mailErr) {
      req.log.error(mailErr, "Failed to send company-deletion notification");
    }

    res.sendStatus(204);
  } catch (err) {
    req.log.error(err, "Failed to delete company");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

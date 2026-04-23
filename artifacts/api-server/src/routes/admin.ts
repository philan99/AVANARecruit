import { Router, type IRouter } from "express";
import { db, companyProfiles, companyUsers, candidatesTable, jobsTable, adminsTable, verificationsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";
import { explainMatch } from "../lib/matching";

const router: IRouter = Router();

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, email));
    if (admin) {
      const valid = await bcrypt.compare(password, admin.password);
      if (valid) {
        return res.json({ success: true, adminId: admin.id, adminName: admin.name });
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      return res.json({ success: true });
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch (err) {
    req.log.error(err, "Admin login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/companies", async (req, res) => {
  try {
    const companies = await db.select().from(companyProfiles);
    const users = await db
      .select({
        id: companyUsers.id,
        companyProfileId: companyUsers.companyProfileId,
        name: companyUsers.name,
        email: companyUsers.email,
        role: companyUsers.role,
        verified: companyUsers.verified,
        lastLoginAt: companyUsers.lastLoginAt,
        createdAt: companyUsers.createdAt,
      })
      .from(companyUsers);

    const usersByCompany = new Map<number, typeof users>();
    for (const u of users) {
      const arr = usersByCompany.get(u.companyProfileId) ?? [];
      arr.push(u);
      usersByCompany.set(u.companyProfileId, arr);
    }
    const ROLE_ORDER: Record<string, number> = { owner: 0, admin: 1, member: 2 };
    for (const arr of usersByCompany.values()) {
      arr.sort((a, b) => {
        const ra = ROLE_ORDER[a.role] ?? 99;
        const rb = ROLE_ORDER[b.role] ?? 99;
        if (ra !== rb) return ra - rb;
        return (a.email || "").localeCompare(b.email || "");
      });
    }

    res.json(
      companies.map((c) => ({
        ...c,
        users: usersByCompany.get(c.id) ?? [],
      })),
    );
  } catch (err) {
    req.log.error(err, "Failed to list companies");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/company-users/:userId/reset-password", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const { password } = req.body;
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .update(companyUsers)
      .set({ password: hashedPassword })
      .where(eq(companyUsers.id, userId))
      .returning({ id: companyUsers.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to reset team member password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/companies/:id", async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const [company] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, companyId));
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    const jobs = await db.select().from(jobsTable).where(eq(jobsTable.companyProfileId, companyId));
    const users = await db
      .select({
        id: companyUsers.id,
        name: companyUsers.name,
        email: companyUsers.email,
        role: companyUsers.role,
        verified: companyUsers.verified,
        lastLoginAt: companyUsers.lastLoginAt,
        createdAt: companyUsers.createdAt,
      })
      .from(companyUsers)
      .where(eq(companyUsers.companyProfileId, companyId));
    const ROLE_ORDER: Record<string, number> = { owner: 0, admin: 1, member: 2 };
    users.sort((a, b) => {
      const ra = ROLE_ORDER[a.role] ?? 99;
      const rb = ROLE_ORDER[b.role] ?? 99;
      if (ra !== rb) return ra - rb;
      return (a.email || "").localeCompare(b.email || "");
    });
    res.json({ ...company, jobs, users });
  } catch (err) {
    req.log.error(err, "Failed to fetch company detail");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/candidates", async (req, res) => {
  try {
    const candidates = await db.select().from(candidatesTable);
    const verificationCounts = await db
      .select({ candidateId: verificationsTable.candidateId, total: count() })
      .from(verificationsTable)
      .where(eq(verificationsTable.status, "verified"))
      .groupBy(verificationsTable.candidateId);
    const countMap = new Map(verificationCounts.map(v => [v.candidateId, Number(v.total)]));
    res.json(candidates.map(c => ({ ...c, verifiedCount: countMap.get(c.id) || 0 })));
  } catch (err) {
    req.log.error(err, "Failed to list candidates");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/companies/:id/reset-password", async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Reset the owner's password (in stage (a) there is exactly one owner per company).
    const result = await db
      .update(companyUsers)
      .set({ password: hashedPassword })
      .where(and(eq(companyUsers.companyProfileId, companyId), eq(companyUsers.role, "owner")))
      .returning({ id: companyUsers.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Company owner not found" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to reset company password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/candidates/:id/reset-password", async (req, res) => {
  try {
    const candidateId = parseInt(req.params.id, 10);
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .update(candidatesTable)
      .set({ password: hashedPassword })
      .where(eq(candidatesTable.id, candidateId))
      .returning({ id: candidatesTable.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to reset candidate password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/admins", async (req, res) => {
  try {
    const admins = await db.select({
      id: adminsTable.id,
      name: adminsTable.name,
      email: adminsTable.email,
      createdAt: adminsTable.createdAt,
      updatedAt: adminsTable.updatedAt,
    }).from(adminsTable);
    res.json(admins);
  } catch (err) {
    req.log.error(err, "Failed to list admins");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/admins", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await db.select({ id: adminsTable.id }).from(adminsTable).where(eq(adminsTable.email, email));
    if (existing.length > 0) {
      return res.status(409).json({ error: "An admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [admin] = await db.insert(adminsTable).values({
      name,
      email,
      password: hashedPassword,
    }).returning({
      id: adminsTable.id,
      name: adminsTable.name,
      email: adminsTable.email,
      createdAt: adminsTable.createdAt,
    });

    res.status(201).json(admin);

    try {
      const { client, fromEmail } = await getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: email,
        cc: "recruitment@avanarecruit.ai",
        subject: "Welcome to AVANA Recruit Admin Portal",
        html: brandedEmail(
          "Welcome to AVANA Recruit",
          `<p style="font-size: 14px; color: #374151; line-height: 1.6;">Hi ${name},</p>
           <p style="font-size: 14px; color: #374151; line-height: 1.6;">Your administrator account has been created on the AVANA Recruit platform. You now have access to the admin portal where you can manage companies, candidates, jobs, and platform settings.</p>
           <div style="background: #f3f4f6; border-radius: 6px; padding: 16px; margin: 16px 0;">
             <p style="font-size: 13px; color: #374151; margin: 0 0 8px 0;"><strong>Your login details:</strong></p>
             <p style="font-size: 13px; color: #374151; margin: 0;">Email: <strong>${email}</strong></p>
           </div>
           <p style="font-size: 14px; color: #374151; line-height: 1.6;">Please sign in using the credentials provided to you and change your password after your first login.</p>`,
          "This is an automated message from AVANA Recruit. If you did not expect this, please contact support."
        ),
      });
    } catch (emailErr) {
      req.log.error(emailErr, "Failed to send admin welcome email");
    }
  } catch (err) {
    req.log.error(err, "Failed to create admin");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/admins/:id", async (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { name, email } = req.body;

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    updates.updatedAt = new Date();

    const [updated] = await db.update(adminsTable)
      .set(updates)
      .where(eq(adminsTable.id, adminId))
      .returning({
        id: adminsTable.id,
        name: adminsTable.name,
        email: adminsTable.email,
        createdAt: adminsTable.createdAt,
        updatedAt: adminsTable.updatedAt,
      });

    if (!updated) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(updated);
  } catch (err) {
    req.log.error(err, "Failed to update admin");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/admins/:id/reset-password", async (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.update(adminsTable)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(adminsTable.id, adminId))
      .returning({ id: adminsTable.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to reset admin password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/admins/:id", async (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);

    const allAdmins = await db.select({ id: adminsTable.id }).from(adminsTable);
    if (allAdmins.length <= 1) {
      return res.status(400).json({ error: "Cannot delete the last admin" });
    }

    const result = await db.delete(adminsTable)
      .where(eq(adminsTable.id, adminId))
      .returning({ id: adminsTable.id });

    if (result.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to delete admin");
    res.status(500).json({ error: "Internal server error" });
  }
});

const DEMO_CANDIDATE_EMAIL = "demo-candidate@avana.test";

router.get("/admin/match-diagnostic", async (req, res) => {
  const candidateId = parseInt(String(req.query.candidateId ?? ""), 10);
  const jobId = parseInt(String(req.query.jobId ?? ""), 10);
  if (!Number.isFinite(candidateId) || !Number.isFinite(jobId)) {
    res.status(400).json({ error: "candidateId and jobId are required" });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, candidateId));
  if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }

  const [verifiedRow] = await db
    .select({ count: count() })
    .from(verificationsTable)
    .where(and(eq(verificationsTable.candidateId, candidateId), eq(verificationsTable.status, "verified")));
  const verifiedCount = verifiedRow?.count || 0;

  const explanation = explainMatch(job, candidate, verifiedCount);

  res.json({
    candidate: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      currentTitle: candidate.currentTitle,
      experienceYears: candidate.experienceYears,
      education: candidate.education,
      location: candidate.location,
      isDemo: candidate.isDemo,
    },
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      workplace: job.workplace,
      industry: job.industry,
      experienceLevel: job.experienceLevel,
      educationLevel: job.educationLevel,
    },
    explanation,
  });
});

router.post("/admin/demo-candidate/reset", async (req, res) => {
  try {
    const initialOnboarding = { currentStep: 1, completedSteps: [], skippedSteps: [], completedAt: null };
    const blankCandidateFields = {
      name: "Demo Candidate",
      phone: null,
      currentTitle: "",
      summary: "",
      skills: [] as string[],
      qualifications: [] as string[],
      experienceYears: 0,
      education: "",
      educationDetails: null,
      location: "",
      profileImage: null,
      cvFile: null,
      cvFileName: null,
      experience: [] as any[],
      preferredJobTypes: [] as string[],
      preferredWorkplaces: [] as string[],
      preferredIndustries: [] as string[],
      linkedinUrl: null,
      facebookUrl: null,
      twitterUrl: null,
      portfolioUrl: null,
      verified: true,
      isDemo: true,
      status: "active" as const,
      onboardingState: initialOnboarding,
    };

    const [existing] = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.email, DEMO_CANDIDATE_EMAIL));

    let row;
    if (existing) {
      [row] = await db
        .update(candidatesTable)
        .set(blankCandidateFields)
        .where(eq(candidatesTable.id, existing.id))
        .returning();
    } else {
      [row] = await db
        .insert(candidatesTable)
        .values({ ...blankCandidateFields, email: DEMO_CANDIDATE_EMAIL })
        .returning();
    }

    res.json({ id: row.id, email: row.email, name: row.name, isDemo: row.isDemo });
  } catch (err) {
    req.log.error(err, "Failed to reset demo candidate");
    res.status(500).json({ error: "Failed to reset demo candidate" });
  }
});

export default router;

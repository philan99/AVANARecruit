import { Router, type IRouter } from "express";
import { eq, and, ilike, or, sql, count, inArray } from "drizzle-orm";
import { db, candidatesTable, matchesTable, jobsTable, companyProfiles, companyUsers } from "@workspace/db";
import bcrypt from "bcryptjs";
import {
  ListCandidatesQueryParams,
  CreateCandidateBody,
  GetCandidateParams,
  GetCandidateResponse,
  UpdateCandidateParams,
  UpdateCandidateBody,
  UpdateCandidateResponse,
  ListCandidatesResponse,
} from "@workspace/api-zod";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";
import { computeMatch } from "../lib/matching";
import { validatePassword } from "../lib/password-policy";

const router: IRouter = Router();

router.get("/candidates", async (req, res): Promise<void> => {
  const params = ListCandidatesQueryParams.safeParse(req.query);

  const conditions = [eq(candidatesTable.isDemo, false)];
  if (params.success && params.data.status) {
    conditions.push(eq(candidatesTable.status, params.data.status));
  }
  if (params.success && params.data.search) {
    const search = `%${params.data.search}%`;
    conditions.push(
      or(
        ilike(candidatesTable.name, search),
        ilike(candidatesTable.email, search),
        ilike(candidatesTable.currentTitle, search)
      )!
    );
  }

  const matchCountSubquery = db
    .select({ candidateId: matchesTable.candidateId, cnt: count().as("cnt") })
    .from(matchesTable)
    .groupBy(matchesTable.candidateId)
    .as("match_counts");

  let query = db
    .select({
      id: candidatesTable.id,
      name: candidatesTable.name,
      email: candidatesTable.email,
      phone: candidatesTable.phone,
      currentTitle: candidatesTable.currentTitle,
      summary: candidatesTable.summary,
      skills: candidatesTable.skills,
      qualifications: candidatesTable.qualifications,
      experienceYears: candidatesTable.experienceYears,
      education: candidatesTable.education,
      educationDetails: candidatesTable.educationDetails,
      location: candidatesTable.location,
      profileImage: candidatesTable.profileImage,
      cvFile: candidatesTable.cvFile,
      cvFileName: candidatesTable.cvFileName,
      experience: candidatesTable.experience,
      preferredJobTypes: candidatesTable.preferredJobTypes,
      preferredWorkplaces: candidatesTable.preferredWorkplaces,
      preferredIndustries: candidatesTable.preferredIndustries,
      status: candidatesTable.status,
      linkedinUrl: candidatesTable.linkedinUrl,
      facebookUrl: candidatesTable.facebookUrl,
      twitterUrl: candidatesTable.twitterUrl,
      portfolioUrl: candidatesTable.portfolioUrl,
      onboardingState: candidatesTable.onboardingState,
      matchCount: sql<number>`COALESCE(${matchCountSubquery.cnt}, 0)::int`.as("match_count"),
      createdAt: candidatesTable.createdAt,
      updatedAt: candidatesTable.updatedAt,
    })
    .from(candidatesTable)
    .leftJoin(matchCountSubquery, eq(candidatesTable.id, matchCountSubquery.candidateId))
    .orderBy(candidatesTable.createdAt)
    .$dynamic();

  if (conditions.length > 0) {
    for (const condition of conditions) {
      query = query.where(condition);
    }
  }

  const candidates = await query;
  res.json(candidates);
});

router.post("/candidates/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [candidate] = await db
      .select({
        id: candidatesTable.id,
        name: candidatesTable.name,
        email: candidatesTable.email,
        password: candidatesTable.password,
        verified: candidatesTable.verified,
      })
      .from(candidatesTable)
      .where(eq(candidatesTable.email, email));

    if (!candidate || !candidate.password) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, candidate.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!candidate.verified) {
      res.status(403).json({ error: "Please verify your email address before logging in.", unverified: true, email: candidate.email });
      return;
    }

    res.json({ success: true, candidateId: candidate.id, name: candidate.name });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/candidates", async (req, res): Promise<void> => {
  const { password, ...rest } = req.body;
  const parsed = CreateCandidateBody.safeParse(rest);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (password && typeof password === "string") {
    const phoneRaw = typeof parsed.data.phone === "string" ? parsed.data.phone.trim() : "";
    const phoneDigits = phoneRaw.replace(/[^\d]/g, "");
    if (!phoneRaw || phoneDigits.length < 6) {
      res.status(400).json({ error: "A valid mobile number is required to create an account." });
      return;
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      res.status(400).json({ error: pwCheck.error });
      return;
    }
  }

  const insertData: any = { ...parsed.data };
  if (password && typeof password === "string") {
    insertData.password = await bcrypt.hash(password, 10);
  }

  const [candidate] = await db.insert(candidatesTable).values(insertData).returning();

  if (candidate.email && password) {
    try {
      const { sendVerificationEmail } = await import("./emailVerification");
      const origin = req.get("origin") || req.get("referer")?.replace(/\/[^/]*$/, "") || "https://avana.replit.app";
      await sendVerificationEmail(candidate.email, "candidate", origin);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }
  }

  const result = { ...candidate, matchCount: 0 };
  res.status(201).json(result);

  sendCandidateAlerts(candidate).catch((err) => console.error("Candidate alert error:", err));
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const params = GetCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const matchCountSubquery = db
    .select({ candidateId: matchesTable.candidateId, cnt: count().as("cnt") })
    .from(matchesTable)
    .groupBy(matchesTable.candidateId)
    .as("match_counts");

  const [candidate] = await db
    .select({
      id: candidatesTable.id,
      name: candidatesTable.name,
      email: candidatesTable.email,
      phone: candidatesTable.phone,
      currentTitle: candidatesTable.currentTitle,
      summary: candidatesTable.summary,
      skills: candidatesTable.skills,
      qualifications: candidatesTable.qualifications,
      experienceYears: candidatesTable.experienceYears,
      education: candidatesTable.education,
      educationDetails: candidatesTable.educationDetails,
      location: candidatesTable.location,
      profileImage: candidatesTable.profileImage,
      cvFile: candidatesTable.cvFile,
      cvFileName: candidatesTable.cvFileName,
      experience: candidatesTable.experience,
      preferredJobTypes: candidatesTable.preferredJobTypes,
      preferredWorkplaces: candidatesTable.preferredWorkplaces,
      preferredIndustries: candidatesTable.preferredIndustries,
      status: candidatesTable.status,
      linkedinUrl: candidatesTable.linkedinUrl,
      facebookUrl: candidatesTable.facebookUrl,
      twitterUrl: candidatesTable.twitterUrl,
      portfolioUrl: candidatesTable.portfolioUrl,
      onboardingState: candidatesTable.onboardingState,
      isDemo: candidatesTable.isDemo,
      matchCount: sql<number>`COALESCE(${matchCountSubquery.cnt}, 0)::int`.as("match_count"),
      createdAt: candidatesTable.createdAt,
      updatedAt: candidatesTable.updatedAt,
    })
    .from(candidatesTable)
    .leftJoin(matchCountSubquery, eq(candidatesTable.id, matchCountSubquery.candidateId))
    .where(eq(candidatesTable.id, params.data.id));

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.json(candidate);
});

router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const params = UpdateCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Snapshot the candidate before the update so we can detect a
  // passive -> active transition (a valid alert trigger).
  const [prevCandidate] = await db
    .select({ status: candidatesTable.status })
    .from(candidatesTable)
    .where(eq(candidatesTable.id, params.data.id));

  const { profileImage, cvFile, cvFileName, experience, educationDetails, qualifications, preferredJobTypes, preferredWorkplaces, preferredIndustries, linkedinUrl, facebookUrl, twitterUrl, portfolioUrl, onboardingState, ...rest } = req.body;
  const parsed = UpdateCandidateBody.safeParse({ ...rest, linkedinUrl, facebookUrl, twitterUrl, portfolioUrl });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { ...parsed.data };
  if (profileImage !== undefined) {
    updateData.profileImage = profileImage;
  }
  if (cvFile !== undefined) {
    updateData.cvFile = cvFile;
  }
  if (cvFileName !== undefined) {
    updateData.cvFileName = cvFileName;
  }
  if (experience !== undefined) {
    updateData.experience = experience;
  }
  if (educationDetails !== undefined) {
    updateData.educationDetails = educationDetails;
  }
  if (qualifications !== undefined) {
    updateData.qualifications = qualifications;
  }
  if (preferredJobTypes !== undefined) {
    updateData.preferredJobTypes = preferredJobTypes;
  }
  if (preferredWorkplaces !== undefined) {
    updateData.preferredWorkplaces = preferredWorkplaces;
  }
  if (preferredIndustries !== undefined) {
    updateData.preferredIndustries = preferredIndustries;
  }
  if (onboardingState !== undefined) {
    updateData.onboardingState = onboardingState;
  }

  const [candidate] = await db
    .update(candidatesTable)
    .set(updateData)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const result = { ...candidate, matchCount: 0 };
  res.json(result);

  // Trigger candidate alerts when the candidate flips from passive -> active.
  if (prevCandidate?.status === "passive" && candidate.status === "active") {
    sendCandidateAlerts(candidate).catch((err) =>
      console.error("Candidate alert error (passive→active):", err),
    );
  }
});

router.delete("/candidates/:id", async (req, res): Promise<void> => {
  const params = GetCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db
    .delete(candidatesTable)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  try {
    const { client, fromEmail } = await getResendClient();
    const html = brandedEmail(
      "Candidate account deleted",
      `
        <p>A candidate account has been deleted from AVANA Recruit.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#64748b;">Name</td><td style="padding:6px 0;font-weight:600;">${candidate.name ?? "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;font-weight:600;">${candidate.email ?? "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Candidate ID</td><td style="padding:6px 0;font-weight:600;">${candidate.id}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Deleted at</td><td style="padding:6px 0;font-weight:600;">${new Date().toISOString()}</td></tr>
        </table>
        <p>All associated matches, alerts and bookmarks were removed.</p>
      `,
    );
    await client.emails.send({
      from: fromEmail,
      to: "recruitment@avanarecruit.ai",
      subject: `[AVANA Recruit] Candidate account deleted — ${candidate.name ?? candidate.email}`,
      html,
    });
  } catch (mailErr) {
    req.log.error(mailErr, "Failed to send candidate-deletion notification");
  }

  res.sendStatus(204);
});

/**
 * MatchedJob: a job that has already cleared its candidate-alert threshold
 * for `candidate` and now needs to be routed to the responsible recruiter.
 */
export type MatchedJob = {
  id: number;
  title: string;
  company: string;
  companyProfileId: number | null;
  createdByUserId: number | null;
  score: number;
};

/**
 * Bucket the matched jobs per recipient (poster, owner-fallback) and send
 * one consolidated email per recipient. Shared between every alert trigger
 * (new registration, passive→active transition, run-matching threshold cross).
 */
export async function dispatchCandidateAlerts(candidate: any, matchedJobs: MatchedJob[]) {
  if (matchedJobs.length === 0) return;

  const companyIds = Array.from(
    new Set(matchedJobs.map((j) => j.companyProfileId).filter((id): id is number => id != null)),
  );
  if (companyIds.length === 0) return;

  const allCompanyUsers = await db
    .select({
      id: companyUsers.id,
      email: companyUsers.email,
      name: companyUsers.name,
      companyProfileId: companyUsers.companyProfileId,
      role: companyUsers.role,
    })
    .from(companyUsers)
    .where(inArray(companyUsers.companyProfileId, companyIds));

  const userById = new Map(allCompanyUsers.map((u) => [u.id, u]));
  const ownerByCompanyId = new Map<number, (typeof allCompanyUsers)[number]>();
  for (const u of allCompanyUsers) {
    if (u.role === "owner") ownerByCompanyId.set(u.companyProfileId!, u);
  }

  const companyRows = await db
    .select({ id: companyProfiles.id, name: companyProfiles.name })
    .from(companyProfiles)
    .where(inArray(companyProfiles.id, companyIds));
  const companyNameById = new Map(companyRows.map((c) => [c.id, c.name]));

  type Bucket = {
    email: string;
    name: string | null;
    companyName: string;
    jobs: { title: string; score: number }[];
  };
  const buckets = new Map<number, Bucket>();

  for (const job of matchedJobs) {
    if (job.companyProfileId == null) continue;
    const poster = job.createdByUserId ? userById.get(job.createdByUserId) : undefined;
    const recipient =
      poster && poster.companyProfileId === job.companyProfileId
        ? poster
        : ownerByCompanyId.get(job.companyProfileId);
    if (!recipient || !recipient.email) continue;

    let bucket = buckets.get(recipient.id);
    if (!bucket) {
      bucket = {
        email: recipient.email,
        name: recipient.name ?? null,
        companyName: companyNameById.get(job.companyProfileId) ?? job.company,
        jobs: [],
      };
      buckets.set(recipient.id, bucket);
    }
    bucket.jobs.push({ title: job.title, score: job.score });
  }

  if (buckets.size === 0) return;

  const { client: resend, fromEmail } = await getResendClient();
  let sentCount = 0;

  for (const bucket of buckets.values()) {
    bucket.jobs.sort((a, b) => b.score - a.score);

    const jobRows = bucket.jobs
      .map(
        (j, i) =>
          `<tr${i % 2 === 1 ? ' style="background:#f9f9f9;"' : ""}>
            <td style="padding:8px 12px;">${j.title}</td>
            <td style="padding:8px 12px; font-weight:700; color:#4CAF50;">${j.score}%</td>
          </tr>`,
      )
      .join("");

    const greeting = bucket.name ? `Hi ${bucket.name},` : `Hi ${bucket.companyName},`;

    try {
      await resend.emails.send({
        from: fromEmail,
        to: bucket.email,
        subject: `Candidate Alert: ${candidate.name} — matches ${bucket.jobs.length} of your roles`,
        html: brandedEmail(
          "Candidate Match Alert",
          `<p>${greeting}</p>
          <p>Either a new candidate has registered or an existing candidate who has improved their match score has now met your candidate match threshold for one or more of the roles you have posted at <strong>${bucket.companyName}</strong>:</p>
          <table style="width:100%; border-collapse:collapse; margin:16px 0;">
            <tr><td style="padding:8px 12px; font-weight:600; color:#666; width:120px;">Name</td><td style="padding:8px 12px;">${candidate.name}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px 12px; font-weight:600; color:#666;">Title</td><td style="padding:8px 12px;">${candidate.currentTitle}</td></tr>
            <tr><td style="padding:8px 12px; font-weight:600; color:#666;">Location</td><td style="padding:8px 12px;">${candidate.location}</td></tr>
          </table>
          <p style="font-weight:600; margin-top:20px;">Matching Roles:</p>
          <table style="width:100%; border-collapse:collapse; margin:8px 0;">
            <tr style="background:#f0f0f0;">
              <th style="padding:8px 12px; text-align:left; font-size:13px;">Job Title</th>
              <th style="padding:8px 12px; text-align:left; font-size:13px;">Match Score</th>
            </tr>
            ${jobRows}
          </table>
          <p>Log in to your AVANA Recruit account to view the full candidate profile.</p>`,
          "You received this because you have candidate alerts enabled on AVANA Recruit.",
        ),
      });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send candidate alert to ${bucket.email}:`, err);
    }
  }

  if (sentCount > 0) {
    console.log(`Sent ${sentCount} candidate alert(s) for "${candidate.name}"`);
  }
}

/**
 * Compute matches for `candidate` against every open, alert-enabled job and
 * dispatch alerts for jobs that clear the per-job threshold. Used for new
 * candidate registration and passive→active status transitions.
 */
async function sendCandidateAlerts(candidate: any) {
  if (candidate?.isDemo || candidate?.is_demo) return;
  const alertJobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      company: jobsTable.company,
      companyProfileId: jobsTable.companyProfileId,
      createdByUserId: jobsTable.createdByUserId,
      location: jobsTable.location,
      description: jobsTable.description,
      requirements: jobsTable.requirements,
      skills: jobsTable.skills,
      experienceLevel: jobsTable.experienceLevel,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      jobType: jobsTable.jobType,
      industry: jobsTable.industry,
      educationLevel: jobsTable.educationLevel,
      workplace: jobsTable.workplace,
      candidateAlertMinScore: jobsTable.candidateAlertMinScore,
    })
    .from(jobsTable)
    .where(and(eq(jobsTable.status, "open"), eq(jobsTable.candidateAlertEnabled, true)));

  if (alertJobs.length === 0) return;

  const matched: MatchedJob[] = [];
  for (const job of alertJobs) {
    const result = computeMatch(job, candidate);
    const score = Math.round(result.overallScore);
    if (score < job.candidateAlertMinScore) continue;
    matched.push({
      id: job.id,
      title: job.title,
      company: job.company,
      companyProfileId: job.companyProfileId,
      createdByUserId: job.createdByUserId,
      score,
    });
  }

  await dispatchCandidateAlerts(candidate, matched);
}

export default router;

import { Router, type IRouter } from "express";
import { eq, ilike, or, sql, count } from "drizzle-orm";
import { db, candidatesTable, matchesTable, candidateAlertsTable, jobsTable, companyProfiles } from "@workspace/db";
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

const router: IRouter = Router();

router.get("/candidates", async (req, res): Promise<void> => {
  const params = ListCandidatesQueryParams.safeParse(req.query);

  const conditions = [];
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
    const html = brandedEmail({
      title: "Candidate account deleted",
      bodyHtml: `
        <p>A candidate account has been deleted from AVANA Recruit.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#64748b;">Name</td><td style="padding:6px 0;font-weight:600;">${candidate.name ?? "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;font-weight:600;">${candidate.email ?? "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Candidate ID</td><td style="padding:6px 0;font-weight:600;">${candidate.id}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Deleted at</td><td style="padding:6px 0;font-weight:600;">${new Date().toISOString()}</td></tr>
        </table>
        <p>All associated matches, alerts and bookmarks were removed.</p>
      `,
    });
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

async function sendCandidateAlerts(candidate: any) {
  const alertsWithCompanies = await db
    .select({
      alertId: candidateAlertsTable.id,
      companyProfileId: candidateAlertsTable.companyProfileId,
      minScore: candidateAlertsTable.minScore,
      keywords: candidateAlertsTable.keywords,
      locations: candidateAlertsTable.locations,
      companyName: companyProfiles.name,
      companyEmail: companyProfiles.email,
    })
    .from(candidateAlertsTable)
    .innerJoin(companyProfiles, eq(candidateAlertsTable.companyProfileId, companyProfiles.id))
    .where(eq(candidateAlertsTable.enabled, true));

  if (alertsWithCompanies.length === 0) return;

  const allJobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.status, "active"));

  if (allJobs.length === 0) return;

  const resend = await getResendClient();
  let sentCount = 0;

  for (const alert of alertsWithCompanies) {
    if (!alert.companyEmail) continue;

    const companyJobs = allJobs.filter((j) => j.companyProfileId === alert.companyProfileId);
    if (companyJobs.length === 0) continue;

    const matchingJobs: { title: string; score: number }[] = [];

    for (const job of companyJobs) {
      const result = computeMatch(job, candidate);
      const score = Math.round(result.overallScore);

      if (score < alert.minScore) continue;

      if (alert.keywords && alert.keywords.length > 0) {
        const candidateText = `${candidate.currentTitle} ${candidate.summary} ${(candidate.skills || []).join(" ")}`.toLowerCase();
        const hasKeyword = alert.keywords.some((kw: string) => candidateText.includes(kw.toLowerCase()));
        if (!hasKeyword) continue;
      }

      if (alert.locations && alert.locations.length > 0) {
        const candidateLoc = (candidate.location || "").toLowerCase();
        const matchesLocation = alert.locations.some((loc: string) => candidateLoc.includes(loc.toLowerCase()));
        if (!matchesLocation) continue;
      }

      matchingJobs.push({ title: job.title, score });
    }

    if (matchingJobs.length === 0) continue;

    matchingJobs.sort((a, b) => b.score - a.score);

    const jobRows = matchingJobs
      .map(
        (j, i) =>
          `<tr${i % 2 === 1 ? ' style="background:#f9f9f9;"' : ""}>
            <td style="padding:8px 12px;">${j.title}</td>
            <td style="padding:8px 12px; font-weight:700; color:#4CAF50;">${j.score}%</td>
          </tr>`
      )
      .join("");

    try {
      await resend.emails.send({
        from: "AVANA Recruit <notifications@avanaservices.com>",
        to: alert.companyEmail,
        subject: `New Candidate Alert: ${candidate.name} — matches ${matchingJobs.length} of your roles`,
        html: brandedEmail(
          "New Candidate Match Alert",
          `<p>Hi ${alert.companyName},</p>
          <p>A new candidate has registered who matches one or more of your open roles:</p>
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
          "You received this because you have candidate alerts enabled on AVANA Recruit."
        ),
      });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send candidate alert to ${alert.companyEmail}:`, err);
    }
  }

  if (sentCount > 0) {
    console.log(`Sent ${sentCount} candidate alert(s) for "${candidate.name}"`);
  }
}

export default router;

import { Router, type IRouter } from "express";
import { eq, desc, sql, avg, count, and } from "drizzle-orm";
import { db, jobsTable, candidatesTable, matchesTable, companyProfiles, companyUsers, verificationsTable } from "@workspace/db";
import { getResendClient } from "../lib/resend";
import { brandedEmail } from "../lib/emailTemplate";
import {
  RunJobMatchingParams,
  RunJobMatchingResponse,
  GetJobMatchesParams,
  GetJobMatchesResponse,
  GetCandidateMatchesParams,
  GetCandidateMatchesResponse,
  UpdateMatchStatusParams,
  UpdateMatchStatusBody,
  UpdateMatchStatusResponse,
  GetDashboardStatsQueryParams,
  GetDashboardStatsResponse,
  GetRecentMatchesQueryParams,
  GetRecentMatchesResponse,
  GetTopCandidatesQueryParams,
  GetTopCandidatesResponse,
  GetSkillDemandResponse,
} from "@workspace/api-zod";
import { computeMatch } from "../lib/matching";
import { dispatchCandidateAlerts, type MatchedJob } from "./candidates";

const router: IRouter = Router();

router.post("/jobs/:id/run-matching", async (req, res): Promise<void> => {
  const params = RunJobMatchingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const activeCandidates = await db
    .select()
    .from(candidatesTable)
    .where(and(eq(candidatesTable.status, "active"), eq(candidatesTable.isDemo, false)));

  const existingMatches = await db.select().from(matchesTable).where(eq(matchesTable.jobId, job.id));
  const existingMap = new Map(existingMatches.map(m => [m.candidateId, m]));
  const activeIds = new Set(activeCandidates.map(c => c.id));

  const verifiedCounts = await db
    .select({ candidateId: verificationsTable.candidateId, count: count() })
    .from(verificationsTable)
    .where(eq(verificationsTable.status, "verified"))
    .groupBy(verificationsTable.candidateId);
  const verifiedMap = new Map(verifiedCounts.map(v => [v.candidateId, v.count]));

  const matchResults = [];
  for (const candidate of activeCandidates) {
    const result = computeMatch(job, candidate, verifiedMap.get(candidate.id) || 0);
    const existing = existingMap.get(candidate.id);
    if (existing) {
      const [updated] = await db
        .update(matchesTable)
        .set({
          overallScore: result.overallScore,
          skillScore: result.skillScore,
          experienceScore: result.experienceScore,
          educationScore: result.educationScore,
          locationScore: result.locationScore,
          verificationScore: result.verificationScore,
          assessment: result.assessment,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
        })
        .where(eq(matchesTable.id, existing.id))
        .returning();
      matchResults.push(updated);
    } else {
      const [match] = await db
        .insert(matchesTable)
        .values({
          jobId: job.id,
          candidateId: candidate.id,
          overallScore: result.overallScore,
          skillScore: result.skillScore,
          experienceScore: result.experienceScore,
          educationScore: result.educationScore,
          locationScore: result.locationScore,
          verificationScore: result.verificationScore,
          assessment: result.assessment,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
        })
        .returning();
      matchResults.push(match);
    }
  }

  for (const existing of existingMatches) {
    if (!activeIds.has(existing.candidateId)) {
      await db.delete(matchesTable).where(eq(matchesTable.id, existing.id));
    }
  }

  matchResults.sort((a, b) => b.overallScore - a.overallScore);
  res.json(RunJobMatchingResponse.parse(matchResults));
});

router.get("/jobs/:id/matches", async (req, res): Promise<void> => {
  const params = GetJobMatchesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const matches = await db
    .select({
      id: matchesTable.id,
      jobId: matchesTable.jobId,
      candidateId: matchesTable.candidateId,
      overallScore: matchesTable.overallScore,
      skillScore: matchesTable.skillScore,
      experienceScore: matchesTable.experienceScore,
      educationScore: matchesTable.educationScore,
      locationScore: matchesTable.locationScore,
      verificationScore: matchesTable.verificationScore,
      assessment: matchesTable.assessment,
      matchedSkills: matchesTable.matchedSkills,
      missingSkills: matchesTable.missingSkills,
      status: matchesTable.status,
      applied: matchesTable.applied,
      createdAt: matchesTable.createdAt,
      candidateName: candidatesTable.name,
      candidateTitle: candidatesTable.currentTitle,
      candidateEmail: candidatesTable.email,
    })
    .from(matchesTable)
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .where(eq(matchesTable.jobId, params.data.id))
    .orderBy(desc(matchesTable.overallScore));

  res.json(matches);
});

router.post("/candidates/:candidateId/match-job/:jobId", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.candidateId, 10);
  const jobId = parseInt(req.params.jobId, 10);
  if (isNaN(candidateId) || isNaN(jobId)) {
    res.status(400).json({ error: "Invalid IDs" });
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

  const result = computeMatch(job, candidate, verifiedCount);

  const existing = await db.select().from(matchesTable)
    .where(sql`${matchesTable.candidateId} = ${candidateId} AND ${matchesTable.jobId} = ${jobId}`);

  if (existing.length > 0) {
    const [updated] = await db
      .update(matchesTable)
      .set({
        overallScore: result.overallScore,
        skillScore: result.skillScore,
        experienceScore: result.experienceScore,
        educationScore: result.educationScore,
        locationScore: result.locationScore,
        verificationScore: result.verificationScore,
        assessment: result.assessment,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
      })
      .where(eq(matchesTable.id, existing[0].id))
      .returning();
    res.json(updated);
    return;
  }

  const [match] = await db
    .insert(matchesTable)
    .values({
      jobId: job.id,
      candidateId: candidate.id,
      overallScore: result.overallScore,
      skillScore: result.skillScore,
      experienceScore: result.experienceScore,
      educationScore: result.educationScore,
      locationScore: result.locationScore,
      verificationScore: result.verificationScore,
      assessment: result.assessment,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
    })
    .returning();
  res.json(match);
});

// Preview matches without persisting. Used for the demo candidate so admins
// can see what jobs the wizard's profile would match against, without
// affecting live data, alerts, or company dashboards.
router.get("/candidates/:id/preview-matches", async (req, res): Promise<void> => {
  const params = GetCandidateMatchesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const openJobs = await db.select().from(jobsTable).where(eq(jobsTable.status, "open"));

  const [verifiedRow] = await db
    .select({ count: count() })
    .from(verificationsTable)
    .where(and(eq(verificationsTable.candidateId, candidate.id), eq(verificationsTable.status, "verified")));
  const verifiedCount = verifiedRow?.count || 0;

  const previews = openJobs.map(job => {
    const result = computeMatch(job, candidate, verifiedCount);
    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      workplace: job.workplace,
      overallScore: result.overallScore,
      skillScore: result.skillScore,
      experienceScore: result.experienceScore,
      educationScore: result.educationScore,
      locationScore: result.locationScore,
      verificationScore: result.verificationScore,
      assessment: result.assessment,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
    };
  });

  previews.sort((a, b) => b.overallScore - a.overallScore);
  res.json({ candidateId: candidate.id, isDemo: candidate.isDemo, jobsConsidered: openJobs.length, previews });
});

router.post("/candidates/:id/run-matching", async (req, res): Promise<void> => {
  const params = GetCandidateMatchesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  // Demo candidates are used for QA only — never persist matches against
  // real jobs or surface them to companies.
  if (candidate.isDemo) {
    res.json({ jobsMatched: 0, matches: [], demo: true });
    return;
  }

  const openJobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.status, "open"));

  const existingMatches = await db.select().from(matchesTable).where(eq(matchesTable.candidateId, candidate.id));
  const existingMap = new Map(existingMatches.map(m => [m.jobId, m]));
  const openJobIds = new Set(openJobs.map(j => j.id));

  const [verifiedRow] = await db
    .select({ count: count() })
    .from(verificationsTable)
    .where(and(eq(verificationsTable.candidateId, candidate.id), eq(verificationsTable.status, "verified")));
  const verifiedCount = verifiedRow?.count || 0;

  const matchResults = [];
  // Track jobs whose new score crossed up through the per-job alert threshold
  // so we can fire candidate alerts for them after the response is sent.
  const crossedAlerts: MatchedJob[] = [];
  for (const job of openJobs) {
    const result = computeMatch(job, candidate, verifiedCount);
    const existing = existingMap.get(job.id);
    const newScore = Math.round(result.overallScore);
    const previousScore = existing ? Math.round(existing.overallScore) : null;
    if (existing) {
      const [updated] = await db
        .update(matchesTable)
        .set({
          overallScore: result.overallScore,
          skillScore: result.skillScore,
          experienceScore: result.experienceScore,
          educationScore: result.educationScore,
          locationScore: result.locationScore,
          verificationScore: result.verificationScore,
          assessment: result.assessment,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
        })
        .where(eq(matchesTable.id, existing.id))
        .returning();
      matchResults.push(updated);
    } else {
      const [match] = await db
        .insert(matchesTable)
        .values({
          jobId: job.id,
          candidateId: candidate.id,
          overallScore: result.overallScore,
          skillScore: result.skillScore,
          experienceScore: result.experienceScore,
          educationScore: result.educationScore,
          locationScore: result.locationScore,
          verificationScore: result.verificationScore,
          assessment: result.assessment,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
        })
        .returning();
      matchResults.push(match);
    }

    // Alert iff this job has alerts on AND the score has just crossed the
    // threshold from below (or there was no prior score). Avoids re-spamming
    // the recruiter every time the candidate re-runs matching.
    if (
      job.candidateAlertEnabled &&
      newScore >= job.candidateAlertMinScore &&
      (previousScore === null || previousScore < job.candidateAlertMinScore)
    ) {
      crossedAlerts.push({
        id: job.id,
        title: job.title,
        company: job.company,
        companyProfileId: job.companyProfileId,
        createdByUserId: job.createdByUserId,
        score: newScore,
      });
    }
  }

  for (const existing of existingMatches) {
    if (!openJobIds.has(existing.jobId)) {
      await db.delete(matchesTable).where(eq(matchesTable.id, existing.id));
    }
  }

  matchResults.sort((a, b) => b.overallScore - a.overallScore);
  res.json(matchResults);

  if (crossedAlerts.length > 0) {
    dispatchCandidateAlerts(candidate, crossedAlerts).catch((err) =>
      console.error("Candidate alert error (run-matching crossed):", err),
    );
  }
});

router.get("/candidates/:id/matches", async (req, res): Promise<void> => {
  const params = GetCandidateMatchesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : null;

  const conditions = [eq(matchesTable.candidateId, params.data.id)];
  if (companyId) {
    conditions.push(eq(jobsTable.companyProfileId, companyId));
  }

  const matches = await db
    .select({
      id: matchesTable.id,
      jobId: matchesTable.jobId,
      candidateId: matchesTable.candidateId,
      overallScore: matchesTable.overallScore,
      skillScore: matchesTable.skillScore,
      experienceScore: matchesTable.experienceScore,
      educationScore: matchesTable.educationScore,
      locationScore: matchesTable.locationScore,
      verificationScore: matchesTable.verificationScore,
      assessment: matchesTable.assessment,
      matchedSkills: matchesTable.matchedSkills,
      missingSkills: matchesTable.missingSkills,
      status: matchesTable.status,
      applied: matchesTable.applied,
      createdAt: matchesTable.createdAt,
      jobTitle: jobsTable.title,
      jobCompany: jobsTable.company,
    })
    .from(matchesTable)
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .where(and(...conditions))
    .orderBy(desc(matchesTable.overallScore));

  res.json(GetCandidateMatchesResponse.parse(matches));
});

router.patch("/matches/:id", async (req, res): Promise<void> => {
  const params = UpdateMatchStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMatchStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [match] = await db
    .update(matchesTable)
    .set({ status: parsed.data.status })
    .where(eq(matchesTable.id, params.data.id))
    .returning();

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json(UpdateMatchStatusResponse.parse(match));
});

router.post("/candidates/:id/contact", async (req, res): Promise<void> => {
  const candidateId = parseInt(req.params.id, 10);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid candidate ID" });
    return;
  }

  const { subject, body, companyProfileId } = req.body;
  if (!subject || !body || !companyProfileId) {
    res.status(400).json({ error: "subject, body, and companyProfileId are required" });
    return;
  }

  const [candidate] = await db
    .select({ name: candidatesTable.name, email: candidatesTable.email })
    .from(candidatesTable)
    .where(eq(candidatesTable.id, candidateId));

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  if (!candidate.email) {
    res.status(400).json({ error: "Candidate has no email address on file" });
    return;
  }

  const [company] = await db
    .select({ name: companyProfiles.name, email: companyUsers.email })
    .from(companyProfiles)
    .leftJoin(
      companyUsers,
      and(eq(companyUsers.companyProfileId, companyProfiles.id), eq(companyUsers.role, "owner")),
    )
    .where(eq(companyProfiles.id, companyProfileId));

  try {
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: candidate.email,
      subject,
      replyTo: company?.email || undefined,
      html: brandedEmail(
        `Message from ${company?.name || "a Company"}`,
        `<div style="font-size: 14px; color: #374151; line-height: 1.6;">${body.replace(/\n/g, "<br>")}</div>`,
        `This email was sent via AVANA Recruit on behalf of ${company?.name || "a company"}.`
      ),
    });
    res.json({ success: true, message: "Email sent successfully" });
  } catch (err: any) {
    console.error("Failed to send contact email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

router.post("/matches/:id/contact", async (req, res): Promise<void> => {
  const matchId = parseInt(req.params.id, 10);
  if (isNaN(matchId)) {
    res.status(400).json({ error: "Invalid match ID" });
    return;
  }

  const { subject, body, companyProfileId } = req.body;
  if (!subject || !body || !companyProfileId) {
    res.status(400).json({ error: "subject, body, and companyProfileId are required" });
    return;
  }

  const [match] = await db
    .select({
      id: matchesTable.id,
      candidateId: matchesTable.candidateId,
      candidateName: candidatesTable.name,
      candidateEmail: candidatesTable.email,
      jobTitle: jobsTable.title,
    })
    .from(matchesTable)
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .where(eq(matchesTable.id, matchId));

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  if (!match.candidateEmail) {
    res.status(400).json({ error: "Candidate has no email address on file" });
    return;
  }

  const [company] = await db
    .select({ name: companyProfiles.name, email: companyUsers.email })
    .from(companyProfiles)
    .leftJoin(
      companyUsers,
      and(eq(companyUsers.companyProfileId, companyProfiles.id), eq(companyUsers.role, "owner")),
    )
    .where(eq(companyProfiles.id, companyProfileId));

  try {
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: match.candidateEmail,
      subject,
      replyTo: company?.email || undefined,
      html: brandedEmail(
        `Message from ${company?.name || "a Company"}`,
        `<div style="font-size: 14px; color: #374151; line-height: 1.6;">${body.replace(/\n/g, "<br>")}</div>`,
        `This email was sent via AVANA Recruit on behalf of ${company?.name || "a company"}.`
      ),
    });
    res.json({ success: true, message: "Email sent successfully" });
  } catch (err: any) {
    console.error("Failed to send contact email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

router.post("/matches/:id/apply", async (req, res): Promise<void> => {
  const matchId = parseInt(req.params.id, 10);
  if (isNaN(matchId)) {
    res.status(400).json({ error: "Invalid match ID" });
    return;
  }

  const { subject, body, candidateId } = req.body;
  if (!subject || !body || !candidateId) {
    res.status(400).json({ error: "subject, body, and candidateId are required" });
    return;
  }

  const [match] = await db
    .select({
      id: matchesTable.id,
      jobId: matchesTable.jobId,
      candidateName: candidatesTable.name,
      candidateEmail: candidatesTable.email,
      jobTitle: jobsTable.title,
      companyProfileId: jobsTable.companyProfileId,
    })
    .from(matchesTable)
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .where(and(eq(matchesTable.id, matchId), eq(matchesTable.candidateId, candidateId)));

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const [company] = await db
    .select({ name: companyProfiles.name, email: companyUsers.email })
    .from(companyProfiles)
    .leftJoin(
      companyUsers,
      and(eq(companyUsers.companyProfileId, companyProfiles.id), eq(companyUsers.role, "owner")),
    )
    .where(eq(companyProfiles.id, match.companyProfileId));

  if (!company?.email) {
    res.status(400).json({ error: "Company has no email address on file" });
    return;
  }

  try {
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: company.email,
      cc: ["recruitment@avanarecruit.ai"],
      subject,
      replyTo: match.candidateEmail || undefined,
      html: brandedEmail(
        `Job Application from ${match.candidateName}`,
        `<div style="font-size: 14px; color: #374151; line-height: 1.6;">${body.replace(/\n/g, "<br>")}</div>`,
        `This application was sent via AVANA Recruit on behalf of ${match.candidateName}.`
      ),
    });
    await db.update(matchesTable).set({ applied: true }).where(eq(matchesTable.id, matchId));
    res.json({ success: true, message: "Application sent successfully" });
  } catch (err: any) {
    console.error("Failed to send application email:", err);
    res.status(500).json({ error: "Failed to send application" });
  }
});

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const params = GetDashboardStatsQueryParams.safeParse(req.query);
  const companyProfileId = params.success ? params.data.companyProfileId : undefined;

  let jobQuery = db.select({
    totalJobs: count(),
    openJobs: count(sql`CASE WHEN ${jobsTable.status} = 'open' THEN 1 END`),
  }).from(jobsTable).$dynamic();

  if (companyProfileId) {
    jobQuery = jobQuery.where(eq(jobsTable.companyProfileId, companyProfileId));
  }

  const [jobStats] = await jobQuery;

  const [candidateStats] = await db.select({
    totalCandidates: count(),
    activeCandidates: count(sql`CASE WHEN ${candidatesTable.status} = 'active' THEN 1 END`),
    passiveCandidates: count(sql`CASE WHEN ${candidatesTable.status} = 'passive' THEN 1 END`),
  }).from(candidatesTable);

  let matchQuery = db.select({
    totalMatches: count(),
    avgMatchScore: avg(matchesTable.overallScore),
    shortlistedCount: count(sql`CASE WHEN ${matchesTable.status} = 'shortlisted' THEN 1 END`),
    hiredCount: count(sql`CASE WHEN ${matchesTable.status} = 'hired' THEN 1 END`),
  }).from(matchesTable).$dynamic();

  if (companyProfileId) {
    matchQuery = matchQuery
      .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
      .where(eq(jobsTable.companyProfileId, companyProfileId));
  }

  const [matchStats] = await matchQuery;

  const stats = {
    totalJobs: jobStats.totalJobs,
    openJobs: jobStats.openJobs,
    totalCandidates: candidateStats.totalCandidates,
    activeCandidates: candidateStats.activeCandidates,
    passiveCandidates: candidateStats.passiveCandidates,
    totalMatches: matchStats.totalMatches,
    avgMatchScore: Number(matchStats.avgMatchScore ?? 0),
    shortlistedCount: matchStats.shortlistedCount,
    hiredCount: matchStats.hiredCount,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/dashboard/recent-matches", async (req, res): Promise<void> => {
  const params = GetRecentMatchesQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 10) : 10;
  const companyProfileId = req.query.companyProfileId ? parseInt(req.query.companyProfileId as string, 10) : null;

  let query = db
    .select({
      id: matchesTable.id,
      candidateId: matchesTable.candidateId,
      jobTitle: jobsTable.title,
      candidateName: candidatesTable.name,
      overallScore: matchesTable.overallScore,
      status: matchesTable.status,
      createdAt: matchesTable.createdAt,
    })
    .from(matchesTable)
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .$dynamic();

  query = query.where(
    companyProfileId
      ? and(eq(jobsTable.companyProfileId, companyProfileId), eq(candidatesTable.isDemo, false))
      : eq(candidatesTable.isDemo, false)
  );

  const matches = await query
    .orderBy(desc(matchesTable.createdAt))
    .limit(limit);

  res.json(GetRecentMatchesResponse.parse(matches));
});

router.get("/dashboard/top-candidates", async (req, res): Promise<void> => {
  const params = GetTopCandidatesQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 5) : 5;
  const companyProfileId = req.query.companyProfileId ? parseInt(req.query.companyProfileId as string, 10) : null;

  let query = db
    .select({
      candidateId: candidatesTable.id,
      candidateName: candidatesTable.name,
      candidateTitle: candidatesTable.currentTitle,
      avgScore: avg(matchesTable.overallScore),
      matchCount: count(),
    })
    .from(matchesTable)
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .$dynamic();

  query = query.where(
    companyProfileId
      ? and(eq(jobsTable.companyProfileId, companyProfileId), eq(candidatesTable.isDemo, false))
      : eq(candidatesTable.isDemo, false)
  );

  const topCandidates = await query
    .groupBy(candidatesTable.id, candidatesTable.name, candidatesTable.currentTitle)
    .orderBy(desc(avg(matchesTable.overallScore)))
    .limit(limit);

  const results = topCandidates.map(tc => ({
    candidateId: tc.candidateId,
    candidateName: tc.candidateName,
    candidateTitle: tc.candidateTitle,
    avgScore: Number(tc.avgScore ?? 0),
    matchCount: tc.matchCount,
    topSkills: [] as string[],
  }));

  for (const result of results) {
    const [candidate] = await db
      .select({ skills: candidatesTable.skills })
      .from(candidatesTable)
      .where(eq(candidatesTable.id, result.candidateId));
    if (candidate) {
      result.topSkills = candidate.skills.slice(0, 5);
    }
  }

  res.json(GetTopCandidatesResponse.parse(results));
});

router.get("/dashboard/applied-jobs", async (req, res): Promise<void> => {
  const candidateId = req.query.candidateId ? parseInt(req.query.candidateId as string, 10) : null;
  if (!candidateId) {
    res.status(400).json({ error: "candidateId is required" });
    return;
  }
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

  const appliedJobs = await db
    .select({
      id: matchesTable.id,
      jobId: matchesTable.jobId,
      jobTitle: jobsTable.title,
      jobCompany: jobsTable.company,
      overallScore: matchesTable.overallScore,
      status: matchesTable.status,
      createdAt: matchesTable.createdAt,
    })
    .from(matchesTable)
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .where(and(eq(matchesTable.candidateId, candidateId), eq(matchesTable.applied, true)))
    .orderBy(desc(matchesTable.createdAt))
    .limit(limit);

  res.json(appliedJobs);
});

router.get("/dashboard/applicants", async (req, res): Promise<void> => {
  const companyProfileId = req.query.companyProfileId ? parseInt(req.query.companyProfileId as string, 10) : null;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

  let query = db
    .select({
      id: matchesTable.id,
      candidateId: matchesTable.candidateId,
      candidateName: candidatesTable.name,
      candidateTitle: candidatesTable.currentTitle,
      jobId: matchesTable.jobId,
      jobTitle: jobsTable.title,
      overallScore: matchesTable.overallScore,
      status: matchesTable.status,
      createdAt: matchesTable.createdAt,
    })
    .from(matchesTable)
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .where(
      companyProfileId
        ? and(eq(matchesTable.applied, true), eq(jobsTable.companyProfileId, companyProfileId), eq(candidatesTable.isDemo, false))
        : and(eq(matchesTable.applied, true), eq(candidatesTable.isDemo, false))
    )
    .orderBy(desc(matchesTable.createdAt))
    .limit(limit);

  const applicants = await query;
  res.json(applicants);
});

router.get("/dashboard/skill-demand", async (req, res): Promise<void> => {
  const companyProfileId = req.query.companyProfileId ? parseInt(req.query.companyProfileId as string, 10) : null;

  let jobQuery = db.select({ skills: jobsTable.skills }).from(jobsTable).$dynamic();
  if (companyProfileId) {
    jobQuery = jobQuery.where(eq(jobsTable.companyProfileId, companyProfileId));
  }
  const jobs = await jobQuery;
  const candidates = await db
    .select({ skills: candidatesTable.skills })
    .from(candidatesTable)
    .where(eq(candidatesTable.isDemo, false));

  const skillJobCount: Record<string, number> = {};
  const skillCandidateCount: Record<string, number> = {};

  for (const job of jobs) {
    for (const skill of job.skills) {
      const normalized = skill.toLowerCase().trim();
      skillJobCount[normalized] = (skillJobCount[normalized] ?? 0) + 1;
    }
  }

  for (const candidate of candidates) {
    for (const skill of candidate.skills) {
      const normalized = skill.toLowerCase().trim();
      skillCandidateCount[normalized] = (skillCandidateCount[normalized] ?? 0) + 1;
    }
  }

  const allSkills = new Set([...Object.keys(skillJobCount), ...Object.keys(skillCandidateCount)]);
  const demand = Array.from(allSkills).map(skill => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    jobCount: skillJobCount[skill] ?? 0,
    candidateCount: skillCandidateCount[skill] ?? 0,
  }));

  demand.sort((a, b) => b.jobCount - a.jobCount);

  res.json(GetSkillDemandResponse.parse(demand.slice(0, 15)));
});

export default router;

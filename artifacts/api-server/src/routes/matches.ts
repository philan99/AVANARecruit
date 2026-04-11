import { Router, type IRouter } from "express";
import { eq, desc, sql, avg, count } from "drizzle-orm";
import { db, jobsTable, candidatesTable, matchesTable } from "@workspace/db";
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
  GetDashboardStatsResponse,
  GetRecentMatchesQueryParams,
  GetRecentMatchesResponse,
  GetTopCandidatesQueryParams,
  GetTopCandidatesResponse,
  GetSkillDemandResponse,
} from "@workspace/api-zod";
import { computeMatch } from "../lib/matching";

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
    .where(eq(candidatesTable.status, "active"));

  await db.delete(matchesTable).where(eq(matchesTable.jobId, job.id));

  const matchResults = [];
  for (const candidate of activeCandidates) {
    const result = computeMatch(job, candidate);
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
        assessment: result.assessment,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
      })
      .returning();
    matchResults.push(match);
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
      assessment: matchesTable.assessment,
      matchedSkills: matchesTable.matchedSkills,
      missingSkills: matchesTable.missingSkills,
      status: matchesTable.status,
      createdAt: matchesTable.createdAt,
      candidateName: candidatesTable.name,
      candidateTitle: candidatesTable.currentTitle,
      candidateEmail: candidatesTable.email,
    })
    .from(matchesTable)
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .where(eq(matchesTable.jobId, params.data.id))
    .orderBy(desc(matchesTable.overallScore));

  res.json(GetJobMatchesResponse.parse(matches));
});

router.get("/candidates/:id/matches", async (req, res): Promise<void> => {
  const params = GetCandidateMatchesParams.safeParse(req.params);
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
      assessment: matchesTable.assessment,
      matchedSkills: matchesTable.matchedSkills,
      missingSkills: matchesTable.missingSkills,
      status: matchesTable.status,
      createdAt: matchesTable.createdAt,
      jobTitle: jobsTable.title,
      jobCompany: jobsTable.company,
    })
    .from(matchesTable)
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .where(eq(matchesTable.candidateId, params.data.id))
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

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [jobStats] = await db.select({
    totalJobs: count(),
    openJobs: count(sql`CASE WHEN ${jobsTable.status} = 'open' THEN 1 END`),
  }).from(jobsTable);

  const [candidateStats] = await db.select({
    totalCandidates: count(),
    activeCandidates: count(sql`CASE WHEN ${candidatesTable.status} = 'active' THEN 1 END`),
  }).from(candidatesTable);

  const [matchStats] = await db.select({
    totalMatches: count(),
    avgMatchScore: avg(matchesTable.overallScore),
    shortlistedCount: count(sql`CASE WHEN ${matchesTable.status} = 'shortlisted' THEN 1 END`),
    hiredCount: count(sql`CASE WHEN ${matchesTable.status} = 'hired' THEN 1 END`),
  }).from(matchesTable);

  const stats = {
    totalJobs: jobStats.totalJobs,
    openJobs: jobStats.openJobs,
    totalCandidates: candidateStats.totalCandidates,
    activeCandidates: candidateStats.activeCandidates,
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

  const matches = await db
    .select({
      id: matchesTable.id,
      jobTitle: jobsTable.title,
      candidateName: candidatesTable.name,
      overallScore: matchesTable.overallScore,
      status: matchesTable.status,
      createdAt: matchesTable.createdAt,
    })
    .from(matchesTable)
    .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .orderBy(desc(matchesTable.createdAt))
    .limit(limit);

  res.json(GetRecentMatchesResponse.parse(matches));
});

router.get("/dashboard/top-candidates", async (req, res): Promise<void> => {
  const params = GetTopCandidatesQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 5) : 5;

  const topCandidates = await db
    .select({
      candidateId: candidatesTable.id,
      candidateName: candidatesTable.name,
      candidateTitle: candidatesTable.currentTitle,
      avgScore: avg(matchesTable.overallScore),
      matchCount: count(),
    })
    .from(matchesTable)
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
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

router.get("/dashboard/skill-demand", async (_req, res): Promise<void> => {
  const jobs = await db.select({ skills: jobsTable.skills }).from(jobsTable);
  const candidates = await db.select({ skills: candidatesTable.skills }).from(candidatesTable);

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

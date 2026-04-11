import { Router, type IRouter } from "express";
import { eq, ilike, or, sql, count } from "drizzle-orm";
import { db, jobsTable, matchesTable } from "@workspace/db";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  GetJobResponse,
  UpdateJobParams,
  UpdateJobBody,
  UpdateJobResponse,
  ListJobsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const params = ListJobsQueryParams.safeParse(req.query);

  const conditions = [];
  if (params.success && params.data.status) {
    conditions.push(eq(jobsTable.status, params.data.status));
  }
  if (params.success && params.data.search) {
    const search = `%${params.data.search}%`;
    conditions.push(
      or(
        ilike(jobsTable.title, search),
        ilike(jobsTable.company, search),
        ilike(jobsTable.location, search)
      )!
    );
  }
  if (params.success && params.data.companyProfileId) {
    conditions.push(eq(jobsTable.companyProfileId, params.data.companyProfileId));
  }

  const matchCountSubquery = db
    .select({ jobId: matchesTable.jobId, cnt: count().as("cnt") })
    .from(matchesTable)
    .groupBy(matchesTable.jobId)
    .as("match_counts");

  let query = db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      company: jobsTable.company,
      companyProfileId: jobsTable.companyProfileId,
      location: jobsTable.location,
      description: jobsTable.description,
      requirements: jobsTable.requirements,
      skills: jobsTable.skills,
      experienceLevel: jobsTable.experienceLevel,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      status: jobsTable.status,
      matchCount: sql<number>`COALESCE(${matchCountSubquery.cnt}, 0)::int`.as("match_count"),
      createdAt: jobsTable.createdAt,
      updatedAt: jobsTable.updatedAt,
    })
    .from(jobsTable)
    .leftJoin(matchCountSubquery, eq(jobsTable.id, matchCountSubquery.jobId))
    .orderBy(jobsTable.createdAt)
    .$dynamic();

  if (conditions.length > 0) {
    for (const condition of conditions) {
      query = query.where(condition);
    }
  }

  const jobs = await query;
  res.json(ListJobsResponse.parse(jobs));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db.insert(jobsTable).values(parsed.data).returning();

  const result = { ...job, matchCount: 0 };
  res.status(201).json(GetJobResponse.parse(result));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const matchCountSubquery = db
    .select({ jobId: matchesTable.jobId, cnt: count().as("cnt") })
    .from(matchesTable)
    .groupBy(matchesTable.jobId)
    .as("match_counts");

  const [job] = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      company: jobsTable.company,
      companyProfileId: jobsTable.companyProfileId,
      location: jobsTable.location,
      description: jobsTable.description,
      requirements: jobsTable.requirements,
      skills: jobsTable.skills,
      experienceLevel: jobsTable.experienceLevel,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      status: jobsTable.status,
      matchCount: sql<number>`COALESCE(${matchCountSubquery.cnt}, 0)::int`.as("match_count"),
      createdAt: jobsTable.createdAt,
      updatedAt: jobsTable.updatedAt,
    })
    .from(jobsTable)
    .leftJoin(matchCountSubquery, eq(jobsTable.id, matchCountSubquery.jobId))
    .where(eq(jobsTable.id, params.data.id));

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobResponse.parse(job));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db
    .update(jobsTable)
    .set(parsed.data)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const result = { ...job, matchCount: 0 };
  res.json(UpdateJobResponse.parse(result));
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .delete(jobsTable)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

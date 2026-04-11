import { Router, type IRouter } from "express";
import { eq, ilike, or, sql, count } from "drizzle-orm";
import { db, candidatesTable, matchesTable } from "@workspace/db";
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
      experienceYears: candidatesTable.experienceYears,
      education: candidatesTable.education,
      location: candidatesTable.location,
      status: candidatesTable.status,
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
  res.json(ListCandidatesResponse.parse(candidates));
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db.insert(candidatesTable).values(parsed.data).returning();

  const result = { ...candidate, matchCount: 0 };
  res.status(201).json(GetCandidateResponse.parse(result));
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
      experienceYears: candidatesTable.experienceYears,
      education: candidatesTable.education,
      location: candidatesTable.location,
      status: candidatesTable.status,
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

  res.json(GetCandidateResponse.parse(candidate));
});

router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const params = UpdateCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db
    .update(candidatesTable)
    .set(parsed.data)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const result = { ...candidate, matchCount: 0 };
  res.json(UpdateCandidateResponse.parse(result));
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

  res.sendStatus(204);
});

export default router;

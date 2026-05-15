import { createHash } from "crypto";
import { eq, and, inArray } from "drizzle-orm";
import { db, experienceRelevanceCacheTable, type Job, type Candidate } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { logger } from "./logger";

interface MatchResult {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  verificationScore: number;
  preferenceScore: number;
  assessment: string;
  matchedSkills: string[];
  missingSkills: string[];
  preferenceMatches: string[];
  preferenceMismatches: string[];
}

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim();
}

function computeSkillScore(jobSkills: string[], candidateSkills: string[]): { score: number; matched: string[]; missing: string[] } {
  const normalizedJobSkills = jobSkills.map(normalizeSkill);
  const normalizedCandidateSkills = candidateSkills.map(normalizeSkill);

  const matched: string[] = [];
  const missing: string[] = [];

  for (let i = 0; i < normalizedJobSkills.length; i++) {
    const jobSkill = normalizedJobSkills[i];
    const found = normalizedCandidateSkills.some(cs => {
      return cs === jobSkill ||
        cs.includes(jobSkill) ||
        jobSkill.includes(cs) ||
        levenshteinSimilarity(cs, jobSkill) > 0.8;
    });

    if (found) {
      matched.push(jobSkills[i]);
    } else {
      missing.push(jobSkills[i]);
    }
  }

  const score = normalizedJobSkills.length > 0
    ? (matched.length / normalizedJobSkills.length) * 100
    : 0;

  return { score, matched, missing };
}

function levenshteinSimilarity(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - matrix[a.length][b.length] / maxLen;
}

const experienceLevelMap: Record<string, number> = {
  junior: 1,
  mid: 3,
  senior: 5,
  lead: 8,
  executive: 12,
};

/**
 * Smooth years-vs-requirement curve. Replaces the old hard cliffs at the
 * threshold with a graceful ramp on either side:
 *   - At required years exactly: 90.
 *   - Each extra year above the requirement: +2 (capped at 100), so a
 *     candidate ~5 years above gets 100.
 *   - Each year below the requirement: a graduated penalty (steeper for
 *     bigger deficits) so 1y short ≈ 78, 2y short ≈ 65, 3y short ≈ 53,
 *     5y short ≈ 32, 7+y short floors at 15.
 *   - Junior over-qualification penalty is opt-in per job
 *     (job.acceptOverqualified === false). Default behaviour is to NOT
 *     penalise over-qualification.
 */
function scoreYearsAgainstRequirement(
  years: number,
  requiredYears: number,
  opts: { penaliseOverqualification?: boolean } = {},
): number {
  if (years >= requiredYears) {
    if (opts.penaliseOverqualification && requiredYears <= 1) {
      const over = years - requiredYears;
      if (over <= 3) return 100;
      if (over <= 6) return 85;
      return 70;
    }
    const surplus = years - requiredYears;
    return Math.min(100, 90 + surplus * 2);
  }
  const deficit = requiredYears - years;
  // Quadratic-ish penalty: small gaps barely matter, large gaps are harsh
  // but never zero (a self-taught candidate with strong skills shouldn't
  // be eliminated outright).
  const score = 90 - 12 * deficit - 1.5 * deficit * deficit;
  return Math.max(15, Math.round(score));
}

// Words to ignore when comparing job titles. The list is deliberately
// broad: it includes generic role nouns ("manager", "engineer",
// "developer", …) so that a "Marketing Manager" doesn't trivially match
// a "Project Manager" purely on the word "manager". The AI scorer
// downstream is responsible for the nuanced semantic match — token
// overlap is now used only as a fast pre-filter.
const EXPERIENCE_STOP_WORDS = new Set([
  // Conjunctions / determiners / generic English
  "the", "and", "for", "with", "our", "your", "their", "from", "into", "this",
  "that", "are", "was", "you", "all", "any", "but", "not", "off", "out", "of",
  "in", "on", "at", "to", "by", "as", "an", "or",
  // Seniority modifiers
  "senior", "junior", "jr", "sr", "lead", "principal", "head", "staff",
  "chief", "associate", "assistant", "trainee", "intern", "graduate",
  // Generic role nouns (would otherwise produce false positives)
  "manager", "engineer", "developer", "designer", "analyst", "consultant",
  "specialist", "officer", "executive", "coordinator", "administrator",
  "director", "supervisor", "representative", "agent", "advisor",
  "professional", "worker", "operator", "technician",
]);

function tokenizeForExperience(s: string): Set<string> {
  return new Set(
    (s ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9+#./ ]+/g, " ")
      .split(/\s+/)
      // Keep tokens of length ≥ 2 so QA/UX/BI/AI/ML/HR/PM count.
      .filter((t) => t.length >= 2 && !EXPERIENCE_STOP_WORDS.has(t)),
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Word-boundary substring match. "go" matches "go developer" but NOT
 * "google"; "aws" matches "aws lambda" but NOT "awsome".
 */
function containsWord(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const re = new RegExp(`(?:^|[^a-z0-9+#])${escapeRegExp(needle.toLowerCase())}(?:$|[^a-z0-9+#])`, "i");
  return re.test(haystack);
}

function entryDurationYears(entry: any): number {
  const startStr = entry?.startDate;
  if (!startStr) return 0;
  const start = new Date(startStr);
  if (Number.isNaN(start.getTime())) return 0;
  const end = entry?.current
    ? new Date()
    : entry?.endDate
      ? new Date(entry.endDate)
      : null;
  if (!end || Number.isNaN(end.getTime()) || end < start) return 0;
  const ms = end.getTime() - start.getTime();
  return ms / (365.25 * 24 * 3600 * 1000);
}

/**
 * Apply a recency multiplier to an entry's duration. Years from an entry
 * that ended in the last 10 years count at full weight; older years
 * decay linearly to 0.5× by 20 years ago. Currently-held roles always
 * count at full weight.
 */
function recencyWeight(entry: any): number {
  if (entry?.current) return 1;
  const endStr = entry?.endDate;
  if (!endStr) return 1;
  const end = new Date(endStr);
  if (Number.isNaN(end.getTime())) return 1;
  const yearsAgo = (Date.now() - end.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (yearsAgo <= 10) return 1;
  if (yearsAgo >= 20) return 0.5;
  return 1 - 0.05 * (yearsAgo - 10);
}

function entryEffectiveYears(entry: any): number {
  return entryDurationYears(entry) * recencyWeight(entry);
}

/**
 * Heuristic relevance for a single work-history entry against a job.
 * Returns a value in [0, 1] used as the multiplier on the entry's
 * recency-weighted duration when the AI cache is cold.
 *
 *   1.0 → strong title-token overlap (after stop-word filter)
 *   0.6 → no title overlap but description mentions ≥ 2 required skills
 *   0.4 → description mentions exactly one required skill
 *   0.0 → no overlap at all (transferable, but credited via the
 *         total-years floor downstream)
 */
function heuristicEntryRelevance(entry: any, job: Job): number {
  const jobTitleTokens = tokenizeForExperience(job.title ?? "");
  const titleTokens = tokenizeForExperience(entry?.jobTitle ?? "");
  for (const t of titleTokens) {
    if (jobTitleTokens.has(t)) return 1;
  }
  // Build a haystack from the candidate entry AND the job's free-text
  // requirements / description so a CV that quotes the JD's wording (or
  // vice versa) gets credit even without title overlap.
  const candidateText = ((entry?.description ?? "") + " " + (entry?.jobTitle ?? "")).toLowerCase();
  const jobText = ((job.requirements ?? "") + " " + (job.description ?? "")).toLowerCase();
  if (!candidateText.trim()) return 0;
  let skillHits = 0;
  for (const skill of job.skills ?? []) {
    const norm = (skill ?? "").toLowerCase().trim();
    if (norm.length < 2) continue;
    // The skill must appear on the candidate side (we're rating the
    // candidate's relevance, not the job's). Job-side scanning is used
    // as a tie-breaker below for skills the job emphasises in prose.
    if (containsWord(candidateText, norm)) {
      skillHits += 1;
      if (skillHits >= 2) return 0.6;
    }
  }
  if (skillHits === 1) return 0.4;
  // Last resort: scan the candidate entry for any non-trivial keyword
  // that the job description / requirements emphasises (≥ 2 hits → 0.4).
  // This catches domain matches like "renewables", "fintech", "claims"
  // that aren't in the structured skills list.
  if (jobText.trim()) {
    const jobKeywords = tokenizeForExperience(jobText);
    let prosehits = 0;
    for (const kw of jobKeywords) {
      if (kw.length < 4) continue;
      if (containsWord(candidateText, kw)) {
        prosehits += 1;
        if (prosehits >= 2) return 0.4;
      }
    }
  }
  return 0;
}

export interface PerEntryRelevance {
  jobTitle: string;
  durationYears: number;
  weightedYears: number; // duration × recency
  relevance: number; // 0..1
  reason?: string;
}

export interface ExperienceRelevanceResult {
  effectiveRelevantYears: number;
  perEntryScores: PerEntryRelevance[];
  source: "ai-cache" | "heuristic";
}

/**
 * Minimum per-entry relevance for a work-history entry to count toward
 * effective relevant years. Anything below this is treated as
 * non-contributing — i.e. only directly relevant or adjacent-role work
 * counts; weak "some transferable skills" entries are excluded so
 * scores reflect genuinely relevant tenure.
 *
 *   ≥ 0.85 → directly relevant
 *   ≥ 0.50 → adjacent role family (still counts)
 *   < 0.50 → some transferable / unrelated (excluded)
 */
export const RELEVANCE_THRESHOLD = 0.5;

function sumEffectiveYears(perEntryScores: PerEntryRelevance[]): number {
  return perEntryScores.reduce(
    (sum, e) => (e.relevance >= RELEVANCE_THRESHOLD ? sum + e.weightedYears * e.relevance : sum),
    0,
  );
}

/**
 * Compute effective relevant years from a candidate's work history. If a
 * cached AI relevance entry is available it is used; otherwise this
 * falls back to the heuristic. Returns null when the candidate has no
 * work history at all.
 */
function computeEffectiveRelevantYears(
  job: Job,
  candidate: Candidate,
  cacheMap?: RelevanceCacheMap,
  opts: { skipAutoWarm?: boolean } = {},
): ExperienceRelevanceResult | null {
  const experience = (candidate as any).experience;
  if (!Array.isArray(experience) || experience.length === 0) return null;

  const cached = cacheMap?.get(makeCacheKey(job.id, candidate.id));
  if (cached
    && cached.jobHash === hashJobForRelevance(job)
    && cached.candidateExperienceHash === hashCandidateExperience(candidate)
  ) {
    const perEntryScores = (cached.perEntryScores as PerEntryRelevance[]) ?? [];
    // Recompute from per-entry scores so the active RELEVANCE_THRESHOLD
    // is applied even to historical cache rows whose stored
    // effectiveRelevantYears was summed under an older threshold.
    return {
      effectiveRelevantYears: sumEffectiveYears(perEntryScores),
      perEntryScores,
      source: "ai-cache",
    };
  }

  // Cache miss (or stale hash): warm in the background so the next
  // request gets the AI-quality score. Routes that prefetch in batches
  // and use warmStaleRelevanceCacheAsync (concurrency-limited) can pass
  // skipAutoWarm to opt out, but the in-flight Set means we still
  // wouldn't double-fire even if both pathways triggered.
  if (!opts.skipAutoWarm && job.id && candidate.id) {
    warmRelevanceCacheAsync(job, candidate);
  }

  const perEntryScores: PerEntryRelevance[] = experience.map((entry: any) => {
    const duration = entryDurationYears(entry);
    const weighted = entryEffectiveYears(entry);
    const relevance = heuristicEntryRelevance(entry, job);
    return {
      jobTitle: String(entry?.jobTitle ?? ""),
      durationYears: Math.round(duration * 10) / 10,
      weightedYears: Math.round(weighted * 10) / 10,
      relevance,
    };
  });
  const effective = sumEffectiveYears(perEntryScores);
  return { effectiveRelevantYears: effective, perEntryScores, source: "heuristic" };
}

interface ExperienceScoreOptions {
  aiRelevanceMap?: RelevanceCacheMap;
}

function computeExperienceScore(
  job: Job,
  candidate: Candidate,
  opts: ExperienceScoreOptions = {},
): number {
  const requiredYears = experienceLevelMap[job.experienceLevel] ?? 3;
  const overqualOpts = {
    penaliseOverqualification: (job as any).acceptOverqualified === false,
  };

  const relevance = computeEffectiveRelevantYears(job, candidate, opts.aiRelevanceMap);
  if (relevance == null) {
    // No work-history entries on file — we have no signal to assess
    // relevance, so fall back to declared total years only. This is the
    // ONLY path where total years influence the score.
    return scoreYearsAgainstRequirement(
      candidate.experienceYears,
      requiredYears,
      overqualOpts,
    );
  }

  // Score is driven entirely by role-relevant years. Unrelated tenure
  // does not contribute — a 20-year career in another field scores the
  // same as no career at all if none of it is relevant to this job.
  return scoreYearsAgainstRequirement(
    relevance.effectiveRelevantYears,
    requiredYears,
    overqualOpts,
  );
}

// ---------------------------------------------------------------------------
// AI-scored experience relevance cache
// ---------------------------------------------------------------------------
//
// We treat the AI's "is this work entry relevant to this job?" judgement as
// the canonical signal, but we never block a match calculation waiting for
// it. The pipeline is:
//
//   1. Each (job, candidate) pair has at most one row in
//      `experience_relevance_cache`.
//   2. Routes that match in batches call `prefetchRelevanceCache(...)` once
//      and pass the resulting Map into `computeMatch` / `explainMatch`.
//   3. Inside the per-pair scorer, a cache hit (whose hashes match the
//      current job + candidate state) wins. A miss falls back to the
//      heuristic score AND triggers a fire-and-forget AI call that
//      writes the result back into the cache, so the next request is
//      AI-quality.
//   4. Hashing the job (title + skills + level) and the candidate's
//      experience array means edits on either side automatically
//      invalidate the cache.

export type RelevanceCacheKey = string;
export type RelevanceCacheMap = Map<RelevanceCacheKey, {
  jobHash: string;
  candidateExperienceHash: string;
  effectiveRelevantYears: number;
  perEntryScores: PerEntryRelevance[];
}>;

export function makeCacheKey(jobId: number, candidateId: number): RelevanceCacheKey {
  return `${jobId}:${candidateId}`;
}

function md5(s: string): string {
  return createHash("md5").update(s).digest("hex");
}

export function hashJobForRelevance(job: Job): string {
  const skills = (job.skills ?? []).map((s) => (s ?? "").toLowerCase().trim()).filter(Boolean).sort();
  const payload = JSON.stringify({
    title: (job.title ?? "").toLowerCase().trim(),
    skills,
    level: (job.experienceLevel ?? "").toLowerCase().trim(),
    // Include requirements because it's part of the AI prompt and a
    // recruiter editing it should invalidate cached relevance scores.
    requirements: (job.requirements ?? "").toLowerCase().trim(),
  });
  return md5(payload);
}

// In-flight de-duplication: while one warm is running for a given
// (job, candidate) pair, additional misses won't spawn duplicates.
const inFlightWarms = new Set<RelevanceCacheKey>();

export function hashCandidateExperience(candidate: Candidate): string {
  const experience = (candidate as any).experience;
  if (!Array.isArray(experience)) return md5("[]");
  const normalized = experience.map((e: any) => ({
    t: (e?.jobTitle ?? "").toLowerCase().trim(),
    c: (e?.company ?? "").toLowerCase().trim(),
    s: e?.startDate ?? "",
    e: e?.endDate ?? "",
    cur: !!e?.current,
    d: (e?.description ?? "").toLowerCase().trim(),
  }));
  return md5(JSON.stringify(normalized));
}

/**
 * Bulk-fetch cached relevance rows for a set of (job, candidate) pairs.
 * Routes call this once before iterating so the per-pair scorer never
 * touches the database.
 */
export async function prefetchRelevanceCache(args: {
  jobIds: number[];
  candidateIds: number[];
}): Promise<RelevanceCacheMap> {
  const map: RelevanceCacheMap = new Map();
  if (args.jobIds.length === 0 || args.candidateIds.length === 0) return map;
  const rows = await db
    .select()
    .from(experienceRelevanceCacheTable)
    .where(and(
      inArray(experienceRelevanceCacheTable.jobId, args.jobIds),
      inArray(experienceRelevanceCacheTable.candidateId, args.candidateIds),
    ));
  for (const r of rows) {
    map.set(makeCacheKey(r.jobId, r.candidateId), {
      jobHash: r.jobHash,
      candidateExperienceHash: r.candidateExperienceHash,
      effectiveRelevantYears: r.effectiveRelevantYears,
      perEntryScores: (r.perEntryScores as PerEntryRelevance[]) ?? [],
    });
  }
  return map;
}

/**
 * Score every work-history entry for a single (job, candidate) pair using
 * GPT, then write the result to the cache. Safe to call repeatedly: the
 * UPSERT means the latest AI judgement always wins.
 */
export async function scoreExperienceRelevanceAI(
  job: Job,
  candidate: Candidate,
): Promise<ExperienceRelevanceResult | null> {
  const experience = (candidate as any).experience;
  if (!Array.isArray(experience) || experience.length === 0) return null;

  const entriesPayload = experience.map((e: any, i: number) => ({
    index: i,
    jobTitle: e?.jobTitle ?? "",
    company: e?.company ?? "",
    startDate: e?.startDate ?? null,
    endDate: e?.current ? "present" : (e?.endDate ?? null),
    description: (e?.description ?? "").slice(0, 2000),
  }));

  const systemPrompt = "You are a recruiting analyst. Rate how relevant each of a candidate's past work-history entries is to a target job. Consider title overlap, transferable skills, adjacent role families (e.g. data engineer ↔ data scientist are highly relevant; sales ↔ engineering are not), and industry context (a software role in fintech is more relevant to another fintech role than to a healthcare role). Return ONLY a JSON object: { entries: [{ index: number, relevance: number, reason: string }] } where relevance is between 0 and 1 (1 = directly relevant, 0.6-0.8 = adjacent role family, 0.3-0.5 = some transferable skills, 0 = unrelated). Reason should be one short sentence.";

  const userPrompt = JSON.stringify({
    job: {
      title: job.title,
      industry: job.industry ?? null,
      skills: job.skills ?? [],
      experienceLevel: job.experienceLevel,
      requirements: (job.requirements ?? "").slice(0, 2000),
    },
    workHistory: entriesPayload,
  });

  let aiEntries: Array<{ index: number; relevance: number; reason: string }> = [];
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    if (Array.isArray(parsed.entries)) {
      aiEntries = parsed.entries
        .filter((e: any) => typeof e?.index === "number" && typeof e?.relevance === "number")
        .map((e: any) => ({
          index: e.index,
          relevance: Math.max(0, Math.min(1, e.relevance)),
          reason: typeof e.reason === "string" ? e.reason : "",
        }));
    }
  } catch (err) {
    logger.warn({ err, jobId: job.id, candidateId: candidate.id }, "AI relevance scoring failed");
    return null;
  }

  const aiByIndex = new Map(aiEntries.map((e) => [e.index, e]));
  const perEntryScores: PerEntryRelevance[] = experience.map((entry: any, i: number) => {
    const ai = aiByIndex.get(i);
    const relevance = ai ? ai.relevance : heuristicEntryRelevance(entry, job);
    const duration = entryDurationYears(entry);
    const weighted = entryEffectiveYears(entry);
    return {
      jobTitle: String(entry?.jobTitle ?? ""),
      durationYears: Math.round(duration * 10) / 10,
      weightedYears: Math.round(weighted * 10) / 10,
      relevance: Math.round(relevance * 100) / 100,
      reason: ai?.reason,
    };
  });
  const effective = sumEffectiveYears(perEntryScores);

  try {
    await db
      .insert(experienceRelevanceCacheTable)
      .values({
        jobId: job.id,
        candidateId: candidate.id,
        jobHash: hashJobForRelevance(job),
        candidateExperienceHash: hashCandidateExperience(candidate),
        effectiveRelevantYears: effective,
        perEntryScores: perEntryScores as any,
      })
      .onConflictDoUpdate({
        target: [experienceRelevanceCacheTable.jobId, experienceRelevanceCacheTable.candidateId],
        set: {
          jobHash: hashJobForRelevance(job),
          candidateExperienceHash: hashCandidateExperience(candidate),
          effectiveRelevantYears: effective,
          perEntryScores: perEntryScores as any,
          computedAt: new Date(),
        },
      });
  } catch (err) {
    logger.warn({ err, jobId: job.id, candidateId: candidate.id }, "Failed to persist relevance cache");
  }

  return { effectiveRelevantYears: effective, perEntryScores, source: "ai-cache" };
}

/**
 * Fire-and-forget AI scoring. Does NOT throw or return a Promise the
 * caller is expected to await: it runs in the background and warms the
 * cache for next time.
 */
export function warmRelevanceCacheAsync(job: Job, candidate: Candidate): void {
  const key = makeCacheKey(job.id, candidate.id);
  if (inFlightWarms.has(key)) return;
  inFlightWarms.add(key);
  void scoreExperienceRelevanceAI(job, candidate)
    .catch((err) => {
      logger.warn({ err, jobId: job.id, candidateId: candidate.id }, "Background AI relevance scoring rejected");
    })
    .finally(() => {
      inFlightWarms.delete(key);
    });
}

/**
 * For a batch of (job, candidate) pairs, identify which ones either have
 * no cache row or have a stale one (hashes don't match current state),
 * and warm them in the background. Concurrency-limited so we don't
 * stampede the OpenAI endpoint.
 */
export function warmStaleRelevanceCacheAsync(
  pairs: Array<{ job: Job; candidate: Candidate }>,
  cacheMap: RelevanceCacheMap,
  opts: { concurrency?: number; maxWarms?: number } = {},
): void {
  const concurrency = opts.concurrency ?? 3;
  const maxWarms = opts.maxWarms ?? 25;
  const stale: Array<{ job: Job; candidate: Candidate }> = [];
  for (const { job, candidate } of pairs) {
    const experience = (candidate as any).experience;
    if (!Array.isArray(experience) || experience.length === 0) continue;
    const cached = cacheMap.get(makeCacheKey(job.id, candidate.id));
    if (
      cached
      && cached.jobHash === hashJobForRelevance(job)
      && cached.candidateExperienceHash === hashCandidateExperience(candidate)
    ) {
      continue; // fresh cache hit
    }
    stale.push({ job, candidate });
    if (stale.length >= maxWarms) break;
  }
  if (stale.length === 0) return;

  void (async () => {
    let cursor = 0;
    const workers = Array.from({ length: Math.min(concurrency, stale.length) }, async () => {
      while (cursor < stale.length) {
        const i = cursor++;
        const item = stale[i];
        try {
          await scoreExperienceRelevanceAI(item.job, item.candidate);
        } catch (err) {
          logger.warn({ err, jobId: item.job.id, candidateId: item.candidate.id }, "Background relevance warm failed");
        }
      }
    });
    await Promise.all(workers);
  })();
}

// Ranking of the controlled education enum values used across the app.
// Higher number = higher attainment.
const EDUCATION_ENUM_RANK: Record<string, number> = {
  "gcse": 1,
  "a-level": 2,
  "btec": 2,
  "hnd/hnc": 3,
  "foundation degree": 4,
  "bachelor's degree": 5,
  "master's degree": 6,
  "phd": 7,
  "professional qualification": 4,
  "other": 0,
};

function rankFromEnum(value: string | null | undefined): number | null {
  if (!value) return null;
  const key = value.toLowerCase().trim();
  if (key in EDUCATION_ENUM_RANK) return EDUCATION_ENUM_RANK[key];
  return null;
}

function rankFromFreeText(text: string | null | undefined): number | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes("phd") || t.includes("doctorate")) return 7;
  if (t.includes("master")) return 6;
  if (t.includes("bachelor") || t.includes("degree")) return 5;
  if (t.includes("foundation")) return 4;
  if (t.includes("hnd") || t.includes("hnc")) return 3;
  if (t.includes("a-level") || t.includes("a level") || t.includes("btec")) return 2;
  if (t.includes("gcse") || t.includes("high school")) return 1;
  return null;
}

function computeEducationScore(
  jobEducationLevel: string | null | undefined,
  jobRequirements: string,
  candidateEducation: string,
): number {
  // Prefer the controlled enum on both sides; fall back to free-text scan.
  const required = rankFromEnum(jobEducationLevel) ?? rankFromFreeText(jobRequirements);
  const candidate = rankFromEnum(candidateEducation) ?? rankFromFreeText(candidateEducation);

  if (required === null) return 75; // Job has no education requirement → neutral pass.
  if (candidate === null) return 50; // Candidate hasn't stated → mild penalty.

  if (candidate >= required) return 100;
  const deficit = required - candidate;
  if (deficit === 1) return 75;
  if (deficit === 2) return 55;
  return Math.max(25, 100 - deficit * 18);
}

interface PreferenceResult {
  score: number;
  matches: string[];
  mismatches: string[];
}

const WORKPLACE_LABEL: Record<string, string> = {
  office: "Office",
  remote: "Remote",
  hybrid: "Hybrid",
};

const JOB_TYPE_LABEL: Record<string, string> = {
  permanent_full_time: "Permanent (Full Time)",
  contract: "Contract",
  fixed_term_contract: "Fixed Term Contract",
  part_time: "Part-time",
  temporary: "Temporary",
};

function computePreferenceScore(job: Job, candidate: Candidate): PreferenceResult {
  const matches: string[] = [];
  const mismatches: string[] = [];

  const facets: Array<{
    label: string;
    jobValue: string | null | undefined;
    candidatePrefs: string[] | null | undefined;
    weight: number;
    display?: Record<string, string>;
  }> = [
    {
      label: "Workplace",
      jobValue: job.workplace,
      candidatePrefs: candidate.preferredWorkplaces,
      weight: 1.2,
      display: WORKPLACE_LABEL,
    },
    {
      label: "Job type",
      jobValue: job.jobType,
      candidatePrefs: candidate.preferredJobTypes,
      weight: 1,
      display: JOB_TYPE_LABEL,
    },
    {
      label: "Industry",
      jobValue: job.industry,
      candidatePrefs: candidate.preferredIndustries,
      weight: 0.8,
    },
  ];

  let totalWeight = 0;
  let weightedScore = 0;

  for (const f of facets) {
    if (!f.jobValue) continue; // Job didn't state this facet → skip.
    const prefs = Array.isArray(f.candidatePrefs) ? f.candidatePrefs.filter(Boolean) : [];
    totalWeight += f.weight;
    const display = (v: string) => f.display?.[v] ?? v;
    if (prefs.length === 0) {
      // Candidate has no preference here → neutral, no penalty.
      weightedScore += f.weight * 85;
      continue;
    }
    const jobNorm = f.jobValue.toLowerCase().trim();
    const hit = prefs.some(p => p.toLowerCase().trim() === jobNorm);
    if (hit) {
      weightedScore += f.weight * 100;
      matches.push(`${f.label}: ${display(f.jobValue)}`);
    } else {
      weightedScore += f.weight * 25;
      mismatches.push(`${f.label}: ${display(f.jobValue)} (prefers ${prefs.map(display).join(", ")})`);
    }
  }

  if (totalWeight === 0) return { score: 80, matches, mismatches };
  return { score: weightedScore / totalWeight, matches, mismatches };
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.7613;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function computeLocationScoreLegacy(jobLocation: string, candidateLocation: string): number {
  const jobLoc = (jobLocation ?? "").toLowerCase().trim();
  const candLoc = (candidateLocation ?? "").toLowerCase().trim();
  if (!jobLoc || !candLoc) return 60;
  if (jobLoc === candLoc) return 100;
  if (jobLoc.includes("remote") || candLoc.includes("remote")) return 95;
  if (jobLoc.includes(candLoc) || candLoc.includes(jobLoc)) return 90;
  const jobParts = jobLoc.split(/[,\s]+/);
  const candParts = candLoc.split(/[,\s]+/);
  const hasCommon = jobParts.some(p => candParts.includes(p) && p.length > 2);
  if (hasCommon) return 75;
  return 40;
}

export interface LocationScoreDetail {
  score: number;
  distanceMiles: number | null;
  radiusMiles: number;
  source: "remote" | "distance" | "legacy-text";
}

export function computeLocationScoreDetailed(job: Job, candidate: Candidate): LocationScoreDetail {
  const radius = (candidate as any).maxRadiusMiles ?? 25;
  const workplace = (job.workplace ?? "").toLowerCase();
  if (workplace === "remote") {
    return { score: 100, distanceMiles: null, radiusMiles: radius, source: "remote" };
  }

  const jLat = (job as any).lat;
  const jLng = (job as any).lng;
  const cLat = (candidate as any).lat;
  const cLng = (candidate as any).lng;
  if (
    typeof jLat === "number" && typeof jLng === "number" &&
    typeof cLat === "number" && typeof cLng === "number"
  ) {
    const d = haversineMiles(cLat, cLng, jLat, jLng);
    // Soft curve: 100 at 0mi, ~50 at radius, 0 at 2*radius. Floor at 0.
    const raw = 100 - 50 * (d / Math.max(1, radius));
    const score = Math.max(0, Math.min(100, raw));
    return { score, distanceMiles: d, radiusMiles: radius, source: "distance" };
  }

  return {
    score: computeLocationScoreLegacy(job.location, candidate.location),
    distanceMiles: null,
    radiusMiles: radius,
    source: "legacy-text",
  };
}

function computeLocationScore(job: Job, candidate: Candidate): number {
  return computeLocationScoreDetailed(job, candidate).score;
}

function computeVerificationScore(verifiedCount: number): number {
  if (verifiedCount >= 5) return 100;
  if (verifiedCount >= 4) return 90;
  if (verifiedCount >= 3) return 80;
  if (verifiedCount >= 2) return 65;
  if (verifiedCount >= 1) return 50;
  return 0;
}

function generateAssessment(result: MatchResult, job: Job, candidate: Candidate, opts: { hasNoRelevantExperience?: boolean } = {}): string {
  const parts: string[] = [];

  if (result.overallScore >= 85) {
    parts.push(`${candidate.name} is an excellent match for the ${job.title} position at ${job.company}.`);
  } else if (result.overallScore >= 70) {
    parts.push(`${candidate.name} is a strong match for the ${job.title} position at ${job.company}.`);
  } else if (result.overallScore >= 50) {
    parts.push(`${candidate.name} is a moderate match for the ${job.title} position at ${job.company}.`);
  } else {
    parts.push(`${candidate.name} has limited alignment with the ${job.title} position at ${job.company}.`);
  }

  if (result.matchedSkills.length > 0) {
    parts.push(`Key matching skills: ${result.matchedSkills.slice(0, 5).join(", ")}.`);
  }

  if (result.missingSkills.length > 0) {
    parts.push(`Skills to develop: ${result.missingSkills.slice(0, 3).join(", ")}.`);
  }

  if (opts.hasNoRelevantExperience) {
    parts.push(`Work history shows no role-relevant experience for this position. Total years in unrelated roles do not contribute to the experience score.`);
  } else if (result.experienceScore >= 80) {
    parts.push(`Experience level aligns well with requirements.`);
  } else if (result.experienceScore >= 60) {
    parts.push(`Experience level is close to requirements.`);
  } else {
    parts.push(`Experience level gap may need consideration.`);
  }

  if (result.verificationScore >= 80) {
    parts.push(`Candidate has strong employment verification.`);
  } else if (result.verificationScore >= 50) {
    parts.push(`Candidate has some verified employment history.`);
  } else if (result.verificationScore > 0) {
    parts.push(`Limited employment verification on file.`);
  }

  if (result.preferenceMatches.length > 0) {
    parts.push(`Aligned preferences: ${result.preferenceMatches.join("; ")}.`);
  }
  if (result.preferenceMismatches.length > 0) {
    parts.push(`Preference gaps: ${result.preferenceMismatches.join("; ")}.`);
  }

  return parts.join(" ");
}

export const MATCH_WEIGHTS = {
  skills: 0.25,
  experience: 0.25,
  preferences: 0.15,
  verification: 0.15,
  location: 0.10,
  education: 0.10,
} as const;

export const EXPERIENCE_LEVEL_MAP = experienceLevelMap;

export interface MatchExplanation {
  overallScore: number;
  weights: typeof MATCH_WEIGHTS;
  elements: {
    skills: {
      score: number;
      jobSkills: string[];
      candidateSkills: string[];
      matched: string[];
      missing: string[];
    };
    experience: {
      score: number;
      jobExperienceLevel: string;
      requiredYears: number;
      candidateTotalYears: number;
      candidateRelevantYears: number | null;
      totalYearsScore: number;
      relevantYearsScore: number | null;
      relevanceSource: "ai-cache" | "heuristic" | "no-history";
      perEntryScores: PerEntryRelevance[];
    };
    education: {
      score: number;
      jobEducationLevel: string | null;
      jobRequirementsExcerpt: string;
      candidateEducation: string;
      requiredRank: number | null;
      candidateRank: number | null;
    };
    location: {
      score: number;
      jobLocation: string;
      candidateLocation: string;
      distanceMiles: number | null;
      radiusMiles: number;
      source: "remote" | "distance" | "legacy-text";
    };
    verification: {
      score: number;
      verifiedCount: number;
    };
    preferences: {
      score: number;
      facets: Array<{
        label: string;
        jobValue: string | null;
        candidatePreferences: string[];
        weight: number;
        outcome: "skipped" | "neutral" | "match" | "mismatch";
        contributionScore: number;
      }>;
      matches: string[];
      mismatches: string[];
    };
  };
  assessment: string;
}

export function explainMatch(
  job: Job,
  candidate: Candidate,
  verifiedCount: number = 0,
  opts: { aiRelevanceMap?: RelevanceCacheMap } = {},
): MatchExplanation {
  const skill = computeSkillScore(job.skills, candidate.skills);

  const requiredYears = experienceLevelMap[job.experienceLevel] ?? 3;
  const overqualOpts = { penaliseOverqualification: (job as any).acceptOverqualified === false };
  const totalYearsScore = scoreYearsAgainstRequirement(candidate.experienceYears, requiredYears, overqualOpts);
  const relevance = computeEffectiveRelevantYears(job, candidate, opts.aiRelevanceMap);
  const relevantYears = relevance ? relevance.effectiveRelevantYears : null;
  const relevantYearsScore = relevantYears != null ? scoreYearsAgainstRequirement(relevantYears, requiredYears, overqualOpts) : null;
  const experienceScore = computeExperienceScore(job, candidate, { aiRelevanceMap: opts.aiRelevanceMap });

  const educationScore = computeEducationScore(job.educationLevel, job.requirements, candidate.education);
  const locationDetail = computeLocationScoreDetailed(job, candidate);
  const locationScore = locationDetail.score;
  const verificationScore = computeVerificationScore(verifiedCount);
  const pref = computePreferenceScore(job, candidate);

  const overallScore = Math.round(
    skill.score * MATCH_WEIGHTS.skills +
    experienceScore * MATCH_WEIGHTS.experience +
    pref.score * MATCH_WEIGHTS.preferences +
    verificationScore * MATCH_WEIGHTS.verification +
    locationScore * MATCH_WEIGHTS.location +
    educationScore * MATCH_WEIGHTS.education,
  );

  const facetDefs: Array<{ label: string; jobValue: string | null; prefs: string[]; weight: number; display?: Record<string, string> }> = [
    { label: "Workplace", jobValue: job.workplace ?? null, prefs: candidate.preferredWorkplaces ?? [], weight: 1.2, display: WORKPLACE_LABEL },
    { label: "Job type", jobValue: job.jobType ?? null, prefs: candidate.preferredJobTypes ?? [], weight: 1, display: JOB_TYPE_LABEL },
    { label: "Industry", jobValue: job.industry ?? null, prefs: candidate.preferredIndustries ?? [], weight: 0.8 },
  ];

  const facets = facetDefs.map(f => {
    if (!f.jobValue) {
      return { label: f.label, jobValue: null, candidatePreferences: f.prefs, weight: f.weight, outcome: "skipped" as const, contributionScore: 0 };
    }
    if (f.prefs.length === 0) {
      return { label: f.label, jobValue: f.jobValue, candidatePreferences: [], weight: f.weight, outcome: "neutral" as const, contributionScore: 85 };
    }
    const jobNorm = f.jobValue.toLowerCase().trim();
    const hit = f.prefs.some(p => p.toLowerCase().trim() === jobNorm);
    return {
      label: f.label,
      jobValue: f.jobValue,
      candidatePreferences: f.prefs,
      weight: f.weight,
      outcome: hit ? ("match" as const) : ("mismatch" as const),
      contributionScore: hit ? 100 : 25,
    };
  });

  const partial: MatchResult = {
    overallScore,
    skillScore: Math.round(skill.score),
    experienceScore: Math.round(experienceScore),
    educationScore: Math.round(educationScore),
    locationScore: Math.round(locationScore),
    verificationScore: Math.round(verificationScore),
    preferenceScore: Math.round(pref.score),
    assessment: "",
    matchedSkills: skill.matched,
    missingSkills: skill.missing,
    preferenceMatches: pref.matches,
    preferenceMismatches: pref.mismatches,
  };
  const assessment = generateAssessment(partial, job, candidate, {
    hasNoRelevantExperience: relevantYears != null && relevantYears <= 0.1,
  });

  return {
    overallScore,
    weights: MATCH_WEIGHTS,
    elements: {
      skills: {
        score: Math.round(skill.score),
        jobSkills: job.skills ?? [],
        candidateSkills: candidate.skills ?? [],
        matched: skill.matched,
        missing: skill.missing,
      },
      experience: {
        score: Math.round(experienceScore),
        jobExperienceLevel: job.experienceLevel,
        requiredYears,
        candidateTotalYears: candidate.experienceYears,
        candidateRelevantYears: relevantYears == null ? null : Math.round(relevantYears * 10) / 10,
        totalYearsScore: Math.round(totalYearsScore),
        relevantYearsScore: relevantYearsScore == null ? null : Math.round(relevantYearsScore),
        relevanceSource: relevance ? relevance.source : "no-history",
        perEntryScores: relevance ? relevance.perEntryScores : [],
      },
      education: {
        score: Math.round(educationScore),
        jobEducationLevel: job.educationLevel ?? null,
        jobRequirementsExcerpt: (job.requirements ?? "").slice(0, 240),
        candidateEducation: candidate.education ?? "",
        requiredRank: rankFromEnum(job.educationLevel) ?? rankFromFreeText(job.requirements),
        candidateRank: rankFromEnum(candidate.education) ?? rankFromFreeText(candidate.education),
      },
      location: {
        score: Math.round(locationScore),
        jobLocation: job.location ?? "",
        candidateLocation: candidate.location ?? "",
        distanceMiles: locationDetail.distanceMiles == null ? null : Math.round(locationDetail.distanceMiles * 10) / 10,
        radiusMiles: locationDetail.radiusMiles,
        source: locationDetail.source,
      },
      verification: {
        score: Math.round(verificationScore),
        verifiedCount,
      },
      preferences: {
        score: Math.round(pref.score),
        facets,
        matches: pref.matches,
        mismatches: pref.mismatches,
      },
    },
    assessment,
  };
}

export function computeMatch(
  job: Job,
  candidate: Candidate,
  verifiedCount: number = 0,
  opts: { aiRelevanceMap?: RelevanceCacheMap } = {},
): MatchResult {
  const { score: skillScore, matched: matchedSkills, missing: missingSkills } = computeSkillScore(
    job.skills,
    candidate.skills
  );

  const experienceScore = computeExperienceScore(job, candidate, { aiRelevanceMap: opts.aiRelevanceMap });
  const relevanceForAssessment = computeEffectiveRelevantYears(job, candidate, opts.aiRelevanceMap);
  const relevantYearsForAssessment = relevanceForAssessment ? relevanceForAssessment.effectiveRelevantYears : null;
  const educationScore = computeEducationScore(job.educationLevel, job.requirements, candidate.education);
  const locationScore = computeLocationScore(job, candidate);
  const verificationScore = computeVerificationScore(verifiedCount);
  const { score: preferenceScore, matches: preferenceMatches, mismatches: preferenceMismatches } =
    computePreferenceScore(job, candidate);

  // Weights (sum = 1.00) — keep in sync with MATCH_WEIGHTS above:
  //   Skills        25%
  //   Experience    25%
  //   Preferences   15%   workplace + job type + industry alignment
  //   Verification  15%
  //   Location      10%
  //   Education     10%
  const overallScore = Math.round(
    skillScore * MATCH_WEIGHTS.skills +
    experienceScore * MATCH_WEIGHTS.experience +
    preferenceScore * MATCH_WEIGHTS.preferences +
    verificationScore * MATCH_WEIGHTS.verification +
    locationScore * MATCH_WEIGHTS.location +
    educationScore * MATCH_WEIGHTS.education
  );

  const result: MatchResult = {
    overallScore,
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceScore),
    educationScore: Math.round(educationScore),
    locationScore: Math.round(locationScore),
    verificationScore: Math.round(verificationScore),
    preferenceScore: Math.round(preferenceScore),
    assessment: "",
    matchedSkills,
    missingSkills,
    preferenceMatches,
    preferenceMismatches,
  };

  result.assessment = generateAssessment(result, job, candidate, {
    hasNoRelevantExperience: relevantYearsForAssessment != null && relevantYearsForAssessment <= 0.1,
  });
  return result;
}

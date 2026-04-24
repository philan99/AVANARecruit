import type { Job, Candidate } from "@workspace/db";

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

function scoreYearsAgainstRequirement(years: number, requiredYears: number): number {
  if (years >= requiredYears) {
    // Only penalise over-qualification for junior roles. For mid+ roles,
    // having more experience than required is always treated as a full match.
    const isJunior = requiredYears <= 1;
    if (!isJunior) return 100;
    const overQualification = years - requiredYears;
    if (overQualification <= 3) return 100;
    if (overQualification <= 6) return 85;
    return 70;
  }
  const deficit = requiredYears - years;
  if (deficit <= 1) return 80;
  if (deficit <= 2) return 60;
  return Math.max(20, 100 - deficit * 15);
}

const EXPERIENCE_STOP_WORDS = new Set([
  "the", "and", "for", "with", "our", "your", "their", "from", "into", "this",
  "that", "are", "was", "you", "all", "any", "but", "not", "off", "out",
  "senior", "junior", "lead", "principal", "head", "staff",
]);

function tokenizeForExperience(s: string): Set<string> {
  return new Set(
    (s ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !EXPERIENCE_STOP_WORDS.has(t)),
  );
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
 * Sum the years from work-history entries that look relevant to this job.
 * An entry counts as relevant when its job title shares a meaningful token
 * with the posted role's title, or when its description mentions any of the
 * required skills. Returns null if the candidate hasn't entered any work
 * history (so callers can fall back to total years).
 */
function computeRelevantYears(experience: any, job: Job): number | null {
  if (!Array.isArray(experience) || experience.length === 0) return null;
  const jobTitleTokens = tokenizeForExperience(job.title ?? "");
  const jobSkillsLower = (job.skills ?? [])
    .map((s) => (s ?? "").toLowerCase().trim())
    .filter((s) => s.length > 1);
  let total = 0;
  for (const entry of experience) {
    const titleTokens = tokenizeForExperience(entry?.jobTitle ?? "");
    let relevant = false;
    for (const t of titleTokens) {
      if (jobTitleTokens.has(t)) {
        relevant = true;
        break;
      }
    }
    if (!relevant) {
      const desc = (entry?.description ?? "").toLowerCase();
      if (desc) {
        for (const skill of jobSkillsLower) {
          if (desc.includes(skill)) {
            relevant = true;
            break;
          }
        }
      }
    }
    if (relevant) total += entryDurationYears(entry);
  }
  return total;
}

function computeExperienceScore(job: Job, candidate: Candidate): number {
  const requiredYears = experienceLevelMap[job.experienceLevel] ?? 3;
  const totalScore = scoreYearsAgainstRequirement(candidate.experienceYears, requiredYears);

  const relevantYears = computeRelevantYears((candidate as any).experience, job);
  if (relevantYears == null) {
    // No work-history entries to draw on — fall back to total years only.
    return totalScore;
  }

  const relevantScore = scoreYearsAgainstRequirement(relevantYears, requiredYears);
  // Weight role-relevant years more heavily than raw total tenure: a candidate
  // with the right kind of experience should outscore one with the same total
  // years in unrelated roles, but we don't want to zero-out transferable
  // experience either.
  return Math.round(relevantScore * 0.80 + totalScore * 0.20);
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

function generateAssessment(result: MatchResult, job: Job, candidate: Candidate): string {
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

  if (result.experienceScore >= 80) {
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
  skills: 0.30,
  experience: 0.20,
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

export function explainMatch(job: Job, candidate: Candidate, verifiedCount: number = 0): MatchExplanation {
  const skill = computeSkillScore(job.skills, candidate.skills);

  const requiredYears = experienceLevelMap[job.experienceLevel] ?? 3;
  const totalYearsScore = scoreYearsAgainstRequirement(candidate.experienceYears, requiredYears);
  const relevantYears = computeRelevantYears((candidate as any).experience, job);
  const relevantYearsScore = relevantYears != null ? scoreYearsAgainstRequirement(relevantYears, requiredYears) : null;
  const experienceScore = computeExperienceScore(job, candidate);

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
  const assessment = generateAssessment(partial, job, candidate);

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

export function computeMatch(job: Job, candidate: Candidate, verifiedCount: number = 0): MatchResult {
  const { score: skillScore, matched: matchedSkills, missing: missingSkills } = computeSkillScore(
    job.skills,
    candidate.skills
  );

  const experienceScore = computeExperienceScore(job, candidate);
  const educationScore = computeEducationScore(job.educationLevel, job.requirements, candidate.education);
  const locationScore = computeLocationScore(job, candidate);
  const verificationScore = computeVerificationScore(verifiedCount);
  const { score: preferenceScore, matches: preferenceMatches, mismatches: preferenceMismatches } =
    computePreferenceScore(job, candidate);

  // Weights (sum = 1.00):
  //   Skills        30%   strongest signal
  //   Experience    20%
  //   Preferences   15%   workplace + job type + industry alignment
  //   Verification  15%
  //   Location      10%
  //   Education     10%
  const overallScore = Math.round(
    skillScore * 0.30 +
    experienceScore * 0.20 +
    preferenceScore * 0.15 +
    verificationScore * 0.15 +
    locationScore * 0.10 +
    educationScore * 0.10
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

  result.assessment = generateAssessment(result, job, candidate);
  return result;
}

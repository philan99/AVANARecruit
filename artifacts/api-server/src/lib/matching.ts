import type { Job, Candidate } from "@workspace/db";

interface MatchResult {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  verificationScore: number;
  assessment: string;
  matchedSkills: string[];
  missingSkills: string[];
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

function computeExperienceScore(jobLevel: string, candidateYears: number): number {
  const requiredYears = experienceLevelMap[jobLevel] ?? 3;
  if (candidateYears >= requiredYears) {
    const overQualification = candidateYears - requiredYears;
    if (overQualification <= 3) return 100;
    if (overQualification <= 6) return 85;
    return 70;
  }
  const deficit = requiredYears - candidateYears;
  if (deficit <= 1) return 80;
  if (deficit <= 2) return 60;
  return Math.max(20, 100 - deficit * 15);
}

function computeEducationScore(requirements: string, education: string): number {
  const reqLower = requirements.toLowerCase();
  const eduLower = education.toLowerCase();

  const educationLevels = ["phd", "doctorate", "master", "bachelor", "associate", "diploma", "high school"];
  const educationWeights: Record<string, number> = {
    "phd": 100, "doctorate": 100, "master": 85, "bachelor": 70,
    "associate": 55, "diploma": 45, "high school": 30,
  };

  let requiredLevel = "";
  for (const level of educationLevels) {
    if (reqLower.includes(level)) {
      requiredLevel = level;
      break;
    }
  }

  let candidateLevel = "";
  for (const level of educationLevels) {
    if (eduLower.includes(level)) {
      candidateLevel = level;
      break;
    }
  }

  if (!requiredLevel) return 75;
  if (!candidateLevel) return 50;

  const reqWeight = educationWeights[requiredLevel] ?? 50;
  const candWeight = educationWeights[candidateLevel] ?? 50;

  if (candWeight >= reqWeight) return 100;
  return Math.max(30, Math.round((candWeight / reqWeight) * 100));
}

function computeLocationScore(jobLocation: string, candidateLocation: string): number {
  const jobLoc = jobLocation.toLowerCase().trim();
  const candLoc = candidateLocation.toLowerCase().trim();

  if (jobLoc === candLoc) return 100;
  if (jobLoc.includes("remote") || candLoc.includes("remote")) return 95;
  if (jobLoc.includes(candLoc) || candLoc.includes(jobLoc)) return 90;

  const jobParts = jobLoc.split(/[,\s]+/);
  const candParts = candLoc.split(/[,\s]+/);
  const hasCommon = jobParts.some(p => candParts.includes(p) && p.length > 2);
  if (hasCommon) return 75;

  return 40;
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

  return parts.join(" ");
}

export function computeMatch(job: Job, candidate: Candidate, verifiedCount: number = 0): MatchResult {
  const { score: skillScore, matched: matchedSkills, missing: missingSkills } = computeSkillScore(
    job.skills,
    candidate.skills
  );

  const experienceScore = computeExperienceScore(job.experienceLevel, candidate.experienceYears);
  const educationScore = computeEducationScore(job.requirements, candidate.education);
  const locationScore = computeLocationScore(job.location, candidate.location);
  const verificationScore = computeVerificationScore(verifiedCount);

  const overallScore = Math.round(
    skillScore * 0.35 +
    experienceScore * 0.20 +
    educationScore * 0.10 +
    locationScore * 0.15 +
    verificationScore * 0.20
  );

  const result: MatchResult = {
    overallScore,
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceScore),
    educationScore: Math.round(educationScore),
    locationScore: Math.round(locationScore),
    verificationScore: Math.round(verificationScore),
    assessment: "",
    matchedSkills,
    missingSkills,
  };

  result.assessment = generateAssessment(result, job, candidate);
  return result;
}

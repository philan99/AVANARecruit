import { Router, type IRouter } from "express";
import { eq, ilike, or, sql, count } from "drizzle-orm";
import { db, jobsTable, matchesTable, candidatesTable, jobAlertsTable } from "@workspace/db";
import { computeMatch } from "../lib/matching";
import { geocodeUkPostcode, geocodeUkTown, buildLocationDisplay } from "../lib/geocode";
import { getResendClient } from "../lib/resend";

async function applyLocationFields(d: Record<string, any>): Promise<{ ok: true } | { ok: false; error: string }> {
  const country = d.country || "United Kingdom";
  const hasTown = typeof d.town === "string" && d.town.trim() !== "";
  const hasLatLng = typeof d.lat === "number" && typeof d.lng === "number";
  const hasPostcode = typeof d.postcode === "string" && d.postcode.trim() !== "";

  if (hasTown && country === "United Kingdom") {
    if (!hasLatLng) {
      const geo = await geocodeUkTown(d.town);
      if (!geo.ok) return { ok: false, error: geo.error };
      d.town = geo.town;
      d.country = geo.country;
      d.lat = geo.lat;
      d.lng = geo.lng;
      if (!d.location || String(d.location).trim() === "") {
        d.location = buildLocationDisplay(geo.town, geo.county || geo.region) || geo.town;
      }
    } else if (!d.location || String(d.location).trim() === "") {
      d.location = d.town;
    }
    return { ok: true };
  }

  if (hasPostcode && country === "United Kingdom") {
    const geo = await geocodeUkPostcode(d.postcode);
    if (!geo.ok) return { ok: false, error: geo.error };
    d.postcode = geo.postcode;
    d.town = geo.town;
    d.country = geo.country;
    d.lat = geo.lat;
    d.lng = geo.lng;
    if (!d.location || String(d.location).trim() === "") {
      d.location = buildLocationDisplay(geo.town, geo.region) || geo.postcode;
    }
  }
  return { ok: true };
}

function maybeClearGeo(d: Record<string, any>) {
  const townExplicitlyCleared = d.town === null || d.town === "";
  const postcodeExplicitlyCleared = d.postcode === null || d.postcode === "";
  if (townExplicitlyCleared && (d.postcode === undefined || postcodeExplicitlyCleared)) {
    d.postcode = null;
    d.town = null;
    d.lat = null;
    d.lng = null;
  }
}
import { brandedEmail } from "../lib/emailTemplate";
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
  if (params.success && (params.data as { createdByUserId?: number }).createdByUserId) {
    conditions.push(eq(jobsTable.createdByUserId, (params.data as { createdByUserId: number }).createdByUserId));
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
      createdByUserId: jobsTable.createdByUserId,
      location: jobsTable.location,
      postcode: jobsTable.postcode,
      town: jobsTable.town,
      country: jobsTable.country,
      lat: jobsTable.lat,
      lng: jobsTable.lng,
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
      status: jobsTable.status,
      idealCandidateTraits: jobsTable.idealCandidateTraits,
      idealCandidateNote: jobsTable.idealCandidateNote,
      idealCandidateUseInScore: jobsTable.idealCandidateUseInScore,
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

  const insertData: any = { ...parsed.data };
  const locResult = await applyLocationFields(insertData);
  if (!locResult.ok) {
    res.status(400).json({ error: locResult.error });
    return;
  }

  const [job] = await db.insert(jobsTable).values(insertData).returning();

  const result = { ...job, matchCount: 0 };
  res.status(201).json(GetJobResponse.parse(result));

  sendJobAlerts(job).catch((err) => console.error("Job alert error:", err));
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
      createdByUserId: jobsTable.createdByUserId,
      location: jobsTable.location,
      postcode: jobsTable.postcode,
      town: jobsTable.town,
      country: jobsTable.country,
      lat: jobsTable.lat,
      lng: jobsTable.lng,
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
      status: jobsTable.status,
      idealCandidateTraits: jobsTable.idealCandidateTraits,
      idealCandidateNote: jobsTable.idealCandidateNote,
      idealCandidateUseInScore: jobsTable.idealCandidateUseInScore,
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

  const updateData: any = { ...parsed.data };
  const hasTownProvided = typeof updateData.town === "string" && updateData.town.trim() !== "";
  const hasPostcodeProvided = typeof updateData.postcode === "string" && updateData.postcode.trim() !== "";
  if (hasTownProvided || hasPostcodeProvided) {
    const locResult = await applyLocationFields(updateData);
    if (!locResult.ok) {
      res.status(400).json({ error: locResult.error });
      return;
    }
  } else {
    maybeClearGeo(updateData);
  }

  const [job] = await db
    .update(jobsTable)
    .set(updateData)
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

async function sendJobAlerts(job: any) {
  const alertsWithCandidates = await db
    .select({
      alertId: jobAlertsTable.id,
      candidateId: jobAlertsTable.candidateId,
      minScore: jobAlertsTable.minScore,
      keywords: jobAlertsTable.keywords,
      locations: jobAlertsTable.locations,
      jobTypes: jobAlertsTable.jobTypes,
      centerLat: jobAlertsTable.centerLat,
      centerLng: jobAlertsTable.centerLng,
      radiusMiles: jobAlertsTable.radiusMiles,
      candidateName: candidatesTable.name,
      candidateEmail: candidatesTable.email,
      candidateSkills: candidatesTable.skills,
      candidateExperience: candidatesTable.experienceYears,
      candidateEducation: candidatesTable.education,
      candidateLocation: candidatesTable.location,
      candidateTitle: candidatesTable.currentTitle,
      candidateSummary: candidatesTable.summary,
      candidateStatus: candidatesTable.status,
      candidateQualifications: candidatesTable.qualifications,
      candidatePreferredJobTypes: candidatesTable.preferredJobTypes,
      candidatePreferredWorkplaces: candidatesTable.preferredWorkplaces,
      candidatePreferredIndustries: candidatesTable.preferredIndustries,
    })
    .from(jobAlertsTable)
    .innerJoin(candidatesTable, eq(jobAlertsTable.candidateId, candidatesTable.id))
    .where(eq(jobAlertsTable.enabled, true));

  if (alertsWithCandidates.length === 0) return;

  const resend = await getResendClient();
  const platformUrl = (process.env.PUBLIC_WEB_URL || "https://avanarecruit.ai").replace(/\/$/, "");
  const jobUrl = `${platformUrl}/jobs/${job.id}`;
  let sentCount = 0;

  for (const alert of alertsWithCandidates) {
    if (alert.candidateStatus !== "active") continue;

    const candidate = {
      id: alert.candidateId,
      name: alert.candidateName,
      email: alert.candidateEmail,
      skills: alert.candidateSkills,
      experienceYears: alert.candidateExperience,
      education: alert.candidateEducation,
      location: alert.candidateLocation,
      currentTitle: alert.candidateTitle,
      summary: alert.candidateSummary,
      qualifications: alert.candidateQualifications,
      preferredJobTypes: alert.candidatePreferredJobTypes,
      preferredWorkplaces: alert.candidatePreferredWorkplaces,
      preferredIndustries: alert.candidatePreferredIndustries,
    };

    const result = computeMatch(job, candidate);
    const score = Math.round(result.overallScore);

    if (score < alert.minScore) continue;

    if (alert.keywords && alert.keywords.length > 0) {
      const jobText = `${job.title} ${job.description} ${(job.skills || []).join(" ")}`.toLowerCase();
      const hasKeyword = alert.keywords.some((kw: string) => jobText.includes(kw.toLowerCase()));
      if (!hasKeyword) continue;
    }

    if (alert.locations && alert.locations.length > 0) {
      const jobLoc = (job.location || "").toLowerCase();
      const matchesLocation = alert.locations.some((loc: string) => jobLoc.includes(loc.toLowerCase()));
      if (!matchesLocation && jobLoc !== "remote") continue;
    }

    if (
      alert.centerLat != null &&
      alert.centerLng != null &&
      alert.radiusMiles != null
    ) {
      const isRemote = (job.workplace || "").toLowerCase() === "remote"
        || (job.location || "").toLowerCase() === "remote";
      if (!isRemote) {
        if (job.lat == null || job.lng == null) continue;
        const toRad = (d: number) => (d * Math.PI) / 180;
        const R = 3958.8;
        const dLat = toRad(job.lat - alert.centerLat);
        const dLng = toRad(job.lng - alert.centerLng);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(alert.centerLat)) *
            Math.cos(toRad(job.lat)) *
            Math.sin(dLng / 2) ** 2;
        const distMiles = 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
        if (distMiles > alert.radiusMiles) continue;
      }
    }

    try {
      await resend.emails.send({
        from: "AVANA Recruit <notifications@avanaservices.com>",
        to: alert.candidateEmail,
        subject: `New Job Alert: ${job.title} at ${job.company} — ${score}% Match`,
        html: brandedEmail(
          "New Job Match Alert",
          `<p>Hi ${alert.candidateName},</p>
          <p>A new job has been posted that matches your profile:</p>
          <table style="width:100%; border-collapse:collapse; margin:16px 0;">
            <tr><td style="padding:8px 12px; font-weight:600; color:#666; width:120px;">Role</td><td style="padding:8px 12px;"><a href="${jobUrl}" style="color:#1a2035; font-weight:600; text-decoration:underline;">${job.title}</a></td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px 12px; font-weight:600; color:#666;">Company</td><td style="padding:8px 12px;">${job.company}</td></tr>
            <tr><td style="padding:8px 12px; font-weight:600; color:#666;">Location</td><td style="padding:8px 12px;">${job.location}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px 12px; font-weight:600; color:#666;">Match Score</td><td style="padding:8px 12px; font-weight:700; color:#4CAF50;">${score}%</td></tr>
          </table>
          <p style="text-align:center; margin:28px 0 8px;">
            <a href="${jobUrl}" style="display:inline-block; background:#4CAF50; color:#ffffff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:600;">View role &amp; apply</a>
          </p>
          <p style="font-size:12px; color:#64748b; text-align:center; margin:4px 0 16px;">
            Or paste this link into your browser: <a href="${jobUrl}" style="color:#1a2035;">${jobUrl}</a>
          </p>
          <p style="text-align:center; margin:0;">
            <a href="${platformUrl}" style="color:#1a2035; font-size:13px; text-decoration:underline;">Open AVANA Recruit dashboard</a>
          </p>`,
          "You received this because you have job alerts enabled on AVANA Recruit."
        ),
      });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send job alert to ${alert.candidateEmail}:`, err);
    }
  }

  if (sentCount > 0) {
    console.log(`Sent ${sentCount} job alert(s) for "${job.title}"`);
  }
}

export default router;

import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq, desc, sql, avg, count, and } from "drizzle-orm";
import { db, jobsTable, candidatesTable, matchesTable, companyProfiles, bookmarksTable, favouritesTable } from "@workspace/db";

const router = Router();

async function getCompanyContext(companyProfileId: number): Promise<string> {
  try {
    const [company] = await db
      .select({ name: companyProfiles.name, industry: companyProfiles.industry, location: companyProfiles.location })
      .from(companyProfiles)
      .where(eq(companyProfiles.id, companyProfileId));

    const [jobStats] = await db
      .select({
        totalJobs: count(),
        openJobs: count(sql`CASE WHEN ${jobsTable.status} = 'open' THEN 1 END`),
      })
      .from(jobsTable)
      .where(eq(jobsTable.companyProfileId, companyProfileId));

    const [matchStats] = await db
      .select({
        totalMatches: count(),
        avgScore: avg(matchesTable.overallScore),
        shortlisted: count(sql`CASE WHEN ${matchesTable.status} = 'shortlisted' THEN 1 END`),
        hired: count(sql`CASE WHEN ${matchesTable.status} = 'hired' THEN 1 END`),
      })
      .from(matchesTable)
      .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
      .where(eq(jobsTable.companyProfileId, companyProfileId));

    const [applicantStats] = await db
      .select({ total: count() })
      .from(matchesTable)
      .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
      .where(and(eq(jobsTable.companyProfileId, companyProfileId), eq(matchesTable.applied, true)));

    const [bookmarkStats] = await db
      .select({ total: count() })
      .from(bookmarksTable)
      .where(eq(bookmarksTable.companyProfileId, companyProfileId));

    const topCandidates = await db
      .select({
        name: candidatesTable.name,
        title: candidatesTable.currentTitle,
        score: avg(matchesTable.overallScore),
      })
      .from(matchesTable)
      .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
      .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
      .where(eq(jobsTable.companyProfileId, companyProfileId))
      .groupBy(candidatesTable.id, candidatesTable.name, candidatesTable.currentTitle)
      .orderBy(desc(avg(matchesTable.overallScore)))
      .limit(5);

    const recentJobs = await db
      .select({ title: jobsTable.title, status: jobsTable.status })
      .from(jobsTable)
      .where(eq(jobsTable.companyProfileId, companyProfileId))
      .orderBy(desc(jobsTable.createdAt))
      .limit(5);

    const topCandidatesList = topCandidates
      .map((c) => `  - ${c.name} (${c.title || "No title"}): avg match ${Number(c.score ?? 0).toFixed(0)}%`)
      .join("\n");

    const recentJobsList = recentJobs
      .map((j) => `  - ${j.title} (${j.status})`)
      .join("\n");

    return `
--- LIVE DATA FOR THIS COMPANY ---
Company: ${company?.name || "Unknown"} | Industry: ${company?.industry || "N/A"} | Location: ${company?.location || "N/A"}
Jobs: ${jobStats.totalJobs} total, ${jobStats.openJobs} open
Matches: ${matchStats.totalMatches} total | Avg match score: ${Number(matchStats.avgScore ?? 0).toFixed(1)}%
Applicants: ${applicantStats.total} | Shortlisted: ${matchStats.shortlisted} | Hired: ${matchStats.hired}
Bookmarked candidates: ${bookmarkStats.total}
${recentJobs.length > 0 ? `Recent jobs:\n${recentJobsList}` : "No jobs posted yet."}
${topCandidates.length > 0 ? `Top matched candidates:\n${topCandidatesList}` : "No matches yet."}
--- END LIVE DATA ---

Use this data to answer questions about their recruitment activity. Never reveal candidate emails or phone numbers.`;
  } catch (err) {
    console.error("Error fetching company context:", err);
    return "";
  }
}

async function getCandidateContext(candidateId: number): Promise<string> {
  try {
    const [candidate] = await db
      .select({
        name: candidatesTable.name,
        title: candidatesTable.currentTitle,
        skills: candidatesTable.skills,
        location: candidatesTable.location,
        experienceYears: candidatesTable.experienceYears,
        status: candidatesTable.status,
      })
      .from(candidatesTable)
      .where(eq(candidatesTable.id, candidateId));

    if (!candidate) return "";

    const [matchStats] = await db
      .select({
        totalMatches: count(),
        avgScore: avg(matchesTable.overallScore),
        shortlisted: count(sql`CASE WHEN ${matchesTable.status} = 'shortlisted' THEN 1 END`),
      })
      .from(matchesTable)
      .where(eq(matchesTable.candidateId, candidateId));

    const [applicationStats] = await db
      .select({ total: count() })
      .from(matchesTable)
      .where(and(eq(matchesTable.candidateId, candidateId), eq(matchesTable.applied, true)));

    const [favouriteStats] = await db
      .select({ total: count() })
      .from(favouritesTable)
      .where(eq(favouritesTable.candidateId, candidateId));

    const topMatches = await db
      .select({
        jobTitle: jobsTable.title,
        company: jobsTable.company,
        score: matchesTable.overallScore,
        status: matchesTable.status,
        applied: matchesTable.applied,
      })
      .from(matchesTable)
      .innerJoin(jobsTable, eq(matchesTable.jobId, jobsTable.id))
      .where(eq(matchesTable.candidateId, candidateId))
      .orderBy(desc(matchesTable.overallScore))
      .limit(5);

    const topMatchesList = topMatches
      .map((m) => `  - ${m.jobTitle} at ${m.company}: ${m.score}% match${m.applied ? " (applied)" : ""}${m.status === "shortlisted" ? " ★ shortlisted" : ""}`)
      .join("\n");

    return `
--- LIVE DATA FOR THIS CANDIDATE ---
Name: ${candidate.name} | Title: ${candidate.title || "Not set"} | Location: ${candidate.location || "N/A"}
Experience: ${candidate.experienceYears ?? 0} years | Status: ${candidate.status}
Skills: ${candidate.skills?.slice(0, 10).join(", ") || "None listed"}
Job matches: ${matchStats.totalMatches} | Avg match score: ${Number(matchStats.avgScore ?? 0).toFixed(1)}%
Applications sent: ${applicationStats.total} | Shortlisted: ${matchStats.shortlisted}
Saved jobs: ${favouriteStats.total}
${topMatches.length > 0 ? `Top job matches:\n${topMatchesList}` : "No matches yet."}
--- END LIVE DATA ---

Use this data to answer questions about their job search, profile, and matches. Help them understand their match scores and suggest improvements.`;
  } catch (err) {
    console.error("Error fetching candidate context:", err);
    return "";
  }
}

function getSystemPrompt(role: string | null): string {
  const base = `You are AVANA, a helpful recruitment assistant for the AVANA Recruitment platform — an AI-powered job matching platform that connects companies with candidates based on skills, experience, education, and location. Be friendly, concise, and professional. Use British English. Keep answers short (2-4 sentences) unless the user asks for detail.

IMPORTANT: You can link users to pages on the platform using markdown links. When mentioning a page, include a navigation link using this exact format: [Link Text](/path). Only use the paths listed below for the user's role. Always suggest relevant pages when helpful.`;

  if (role === "company") {
    return `${base}

Available pages for company users:
- [Dashboard](/) — overview with KPIs and analytics
- [Jobs](/jobs) — manage job listings
- [Post a New Job](/jobs/new) — create a new job listing
- [Candidates](/candidates) — browse candidate profiles
- [Matches](/matches) — view AI match results
- [Company Profile](/company-profile) — edit company details
- [Contact Us](/contact-us) — get in touch with AVANA

You are assisting a company user. They can:
- Post and manage job listings
- Browse and search candidate profiles
- View AI-generated match scores between their jobs and candidates
- Bookmark candidates they're interested in
- Contact candidates through the platform
- View their company dashboard with recruitment analytics

Help them with questions about posting jobs, finding the right candidates, understanding match scores, using filters, managing their recruitment pipeline, and any other platform features. If they ask about something outside recruitment or the platform, politely redirect them.`;
  }

  if (role === "candidate") {
    return `${base}

Available pages for candidate users:
- [Dashboard](/) — overview with match scores and activity
- [My Profile](/profile) — edit your profile, skills, and CV
- [My Matches](/my-matches) — view jobs matched to your profile
- [Shortlisted](/shortlisted) — see which companies shortlisted you
- [Browse Jobs](/browse-jobs) — search and filter open positions
- [Browse Companies](/browse-companies) — explore companies on the platform
- [Verifications](/verifications) — manage employment verifications
- [Contact Us](/contact-us) — get in touch with AVANA

You are assisting a candidate user. They can:
- Create and manage their profile (skills, experience, education, CV upload)
- Browse open job positions with filters (location, job type, industry, etc.)
- View AI-generated match scores for jobs that suit their profile
- Apply to jobs through the platform
- Save favourite jobs for later
- See if they've been shortlisted by companies
- Request employment verifications

Help them with questions about optimising their profile, finding suitable jobs, understanding match scores, the application process, and any other platform features. If they ask about something outside job searching or the platform, politely redirect them.`;
  }

  return `${base}

Available pages for visitors:
- [Contact Us](/contact-us) — get in touch with AVANA
- [Terms](/terms) — terms and conditions
- [Privacy Policy](/privacy-policy) — privacy policy

You are speaking with a visitor who is not logged in. They may be interested in learning about the platform. Help them understand:
- What AVANA Recruitment does (AI-powered job matching)
- How the platform works for companies and candidates
- The benefits of using the platform
- How to sign up or sign in
- Pricing information (if asked, direct them to the Pricing page)
- General recruitment questions

Encourage them to create an account to get started. If they ask about specific account features, explain them briefly and suggest signing up.`;
}

router.post("/chat", async (req, res): Promise<void> => {
  try {
    const { messages, role, companyId, candidateId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    let systemPrompt = getSystemPrompt(role || null);

    if (role === "company" && companyId) {
      const context = await getCompanyContext(parseInt(companyId, 10));
      if (context) systemPrompt += "\n" + context;
    } else if (role === "candidate" && candidateId) {
      const context = await getCandidateContext(parseInt(candidateId, 10));
      if (context) systemPrompt += "\n" + context;
    }

    const recentMessages = messages.slice(-10);

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...recentMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      max_completion_tokens: 512,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process chat message" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "An error occurred" })}\n\n`);
      res.end();
    }
  }
});

export default router;

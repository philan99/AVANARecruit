import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { formatIndustry } from "@/lib/industries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Briefcase,
} from "lucide-react";

interface CompanyProfile {
  id: number;
  name: string;
  email: string | null;
  industry: string | null;
  website: string | null;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  size: string | null;
  founded: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  currentTitle: string;
  summary: string;
  skills: string[];
  qualifications: string[] | null;
  experienceYears: number;
  education: string;
  location: string;
  preferredJobTypes: string[] | null;
  preferredWorkplaces: string[] | null;
  preferredIndustries: string[] | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string[];
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  jobType: string | null;
  workplace: string | null;
  industry: string | null;
  educationLevel: string | null;
  status: string;
  matchCount: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [, navigate] = useLocation();
  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, candidatesRes, jobsRes] = await Promise.all([
          fetch(`${basePath}/admin/companies`),
          fetch(`${basePath}/admin/candidates`),
          fetch(`${basePath}/jobs`),
        ]);
        if (companiesRes.ok) setCompanies(await companiesRes.json());
        if (candidatesRes.ok) setCandidates(await candidatesRes.json());
        if (jobsRes.ok) setJobs(await jobsRes.json());
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [basePath]);

  const insights = useMemo(() => {
    const openJobs = jobs.filter(j => j.status === "open").length;
    const closedJobs = jobs.filter(j => j.status !== "open").length;
    const totalMatches = jobs.reduce((sum, j) => sum + j.matchCount, 0);
    const avgMatchesPerJob = jobs.length > 0 ? Math.round(totalMatches / jobs.length) : 0;

    const activeCandidates = candidates.filter(c => c.status === "active").length;
    const passiveCandidates = candidates.filter(c => c.status === "passive").length;
    const notLooking = candidates.filter(c => c.status === "not_looking").length;

    const avgExperience = candidates.length > 0
      ? Math.round((candidates.reduce((sum, c) => sum + c.experienceYears, 0) / candidates.length) * 10) / 10
      : 0;

    const skillFreq: Record<string, number> = {};
    candidates.forEach(c => c.skills.forEach(s => { skillFreq[s] = (skillFreq[s] || 0) + 1; }));
    const topCandidateSkills = Object.entries(skillFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const jobSkillFreq: Record<string, number> = {};
    jobs.forEach(j => j.skills.forEach(s => { jobSkillFreq[s] = (jobSkillFreq[s] || 0) + 1; }));
    const topJobSkills = Object.entries(jobSkillFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const industryFreq: Record<string, number> = {};
    companies.forEach(c => {
      const ind = c.industry || "Unspecified";
      industryFreq[ind] = (industryFreq[ind] || 0) + 1;
    });
    const topIndustries = Object.entries(industryFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const locationFreq: Record<string, number> = {};
    jobs.forEach(j => {
      const loc = j.location || "Unspecified";
      locationFreq[loc] = (locationFreq[loc] || 0) + 1;
    });
    const topJobLocations = Object.entries(locationFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const levelFreq: Record<string, number> = {};
    jobs.forEach(j => {
      const lvl = j.experienceLevel || "unspecified";
      levelFreq[lvl] = (levelFreq[lvl] || 0) + 1;
    });

    const jobsWithSalary = jobs.filter(j => j.salaryMin && j.salaryMax);
    const avgSalary = jobsWithSalary.length > 0
      ? Math.round(jobsWithSalary.reduce((sum, j) => sum + ((j.salaryMin! + j.salaryMax!) / 2), 0) / jobsWithSalary.length)
      : 0;

    const jobTypeFreq: Record<string, number> = {};
    jobs.forEach(j => {
      if (j.jobType) {
        jobTypeFreq[j.jobType] = (jobTypeFreq[j.jobType] || 0) + 1;
      }
    });
    const topJobTypes = Object.entries(jobTypeFreq).sort((a, b) => b[1] - a[1]);

    const workplaceFreq: Record<string, number> = {};
    jobs.forEach(j => {
      if (j.workplace) {
        workplaceFreq[j.workplace] = (workplaceFreq[j.workplace] || 0) + 1;
      }
    });
    const topWorkplaces = Object.entries(workplaceFreq).sort((a, b) => b[1] - a[1]);

    const jobIndustryFreq: Record<string, number> = {};
    jobs.forEach(j => {
      if (j.industry) {
        jobIndustryFreq[j.industry] = (jobIndustryFreq[j.industry] || 0) + 1;
      }
    });
    const topJobIndustries = Object.entries(jobIndustryFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const eduFreq: Record<string, number> = {};
    jobs.forEach(j => {
      if (j.educationLevel) {
        eduFreq[j.educationLevel] = (eduFreq[j.educationLevel] || 0) + 1;
      }
    });
    const topEducationLevels = Object.entries(eduFreq).sort((a, b) => b[1] - a[1]);

    const prefJobTypeFreq: Record<string, number> = {};
    candidates.forEach(c => {
      (c.preferredJobTypes || []).forEach(t => {
        prefJobTypeFreq[t] = (prefJobTypeFreq[t] || 0) + 1;
      });
    });
    const topPrefJobTypes = Object.entries(prefJobTypeFreq).sort((a, b) => b[1] - a[1]);

    const prefWorkplaceFreq: Record<string, number> = {};
    candidates.forEach(c => {
      (c.preferredWorkplaces || []).forEach(w => {
        prefWorkplaceFreq[w] = (prefWorkplaceFreq[w] || 0) + 1;
      });
    });
    const topPrefWorkplaces = Object.entries(prefWorkplaceFreq).sort((a, b) => b[1] - a[1]);

    const prefIndustryFreq: Record<string, number> = {};
    candidates.forEach(c => {
      (c.preferredIndustries || []).forEach(i => {
        prefIndustryFreq[i] = (prefIndustryFreq[i] || 0) + 1;
      });
    });
    const topPrefIndustries = Object.entries(prefIndustryFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const qualFreq: Record<string, number> = {};
    candidates.forEach(c => {
      (c.qualifications || []).forEach(q => {
        qualFreq[q] = (qualFreq[q] || 0) + 1;
      });
    });
    const topQualifications = Object.entries(qualFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return {
      openJobs, closedJobs, totalMatches, avgMatchesPerJob,
      activeCandidates, passiveCandidates, notLooking, avgExperience,
      topCandidateSkills, topJobSkills, topIndustries, topJobLocations, levelFreq,
      avgSalary, jobsWithSalary: jobsWithSalary.length,
      topJobTypes, topWorkplaces, topJobIndustries, topEducationLevels,
      topPrefJobTypes, topPrefWorkplaces, topPrefIndustries, topQualifications,
    };
  }, [companies, candidates, jobs]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading admin data...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Platform overview and insights.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/companies">
            <Card className="bg-card cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{companies.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered on platform</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/jobs">
            <Card className="bg-card cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{jobs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {insights.openJobs} open · {insights.closedJobs} closed
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/candidates">
            <Card className="bg-card cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Candidate Status</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{candidates.length}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-xs font-medium">{insights.activeCandidates}</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 ml-1" />
                  <span className="text-xs font-medium">{insights.passiveCandidates}</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400 ml-1" />
                  <span className="text-xs font-medium">{insights.notLooking}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">Active</span>
                  <span className="text-[10px] text-muted-foreground ml-1">Passive</span>
                  <span className="text-[10px] text-muted-foreground ml-1">Not looking</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/matches")}>
            <CardContent className="pt-4 pb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Matches</p>
              <p className="text-2xl font-bold mt-1 text-primary">{insights.totalMatches}</p>
              <p className="text-[10px] text-muted-foreground">{insights.avgMatchesPerJob} avg per job</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Experience</p>
              <p className="text-2xl font-bold mt-1">{insights.avgExperience} yrs</p>
              <p className="text-[10px] text-muted-foreground">across all candidates</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Salary</p>
              <p className="text-2xl font-bold mt-1">
                {insights.avgSalary > 0 ? `£${insights.avgSalary.toLocaleString()}` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">{insights.jobsWithSalary} jobs with salary data</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Recent Companies</CardTitle>
              <CardDescription>Sorted by created date (newest first)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companies.length > 0 ? [...companies].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12).map((company) => (
                  <Link key={company.id} href={`/companies/${company.id}`}><div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {company.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{company.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatIndustry(company.industry) || "No industry"} {company.location ? `· ${company.location}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </span>
                  </div></Link>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No companies registered yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Recent Jobs</CardTitle>
              <CardDescription>Sorted by created date (newest first)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobs.length > 0 ? [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12).map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}><div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {job.company} · {job.location}
                      </p>
                    </div>
                    <Badge
                      variant={job.status === "open" ? "default" : "secondary"}
                      className="text-[9px] uppercase shrink-0 ml-2"
                    >
                      {job.status}
                    </Badge>
                  </div></Link>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No jobs posted yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Recent Candidates</CardTitle>
              <CardDescription>Sorted by created date (newest first)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {candidates.length > 0 ? [...candidates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12).map((candidate) => (
                  <Link key={candidate.id} href={`/candidates/${candidate.id}`}><div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{candidate.currentTitle}</p>
                      </div>
                    </div>
                    <Badge variant={candidate.status === "active" ? "default" : "secondary"} className="text-[9px] uppercase shrink-0 ml-2">
                      {candidate.status}
                    </Badge>
                  </div></Link>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No candidates registered yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}

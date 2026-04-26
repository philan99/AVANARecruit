import React, { useState, useEffect, useMemo } from "react";
import { useGetDashboardStats, useGetRecentMatches, useGetSkillDemand, useGetTopCandidates, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, Network, Target, ArrowUpRight, Building2, Plus, Monitor, GraduationCap, TrendingUp, UserCheck, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, RadialBarChart, RadialBar, LabelList } from "recharts";
import { Link, useLocation } from "wouter";

function InsightBar({ label, value, max, color, onClick }: { label: string; value: number; max: number; color: string; onClick?: () => void }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`flex items-center gap-3 ${onClick ? "cursor-pointer hover:bg-secondary/40 rounded-md p-1 -m-1 transition-colors" : ""}`} onClick={onClick}>
      <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-secondary/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono font-semibold w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

function formatLabel(val: string) {
  return val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function topN(arr: [string, number][], n = 8): [string, number][] {
  return arr.sort((a, b) => b[1] - a[1]).slice(0, n);
}

const JOB_TYPE_COLORS = ["#06b6d4", "#0891b2", "#22d3ee", "#67e8f9", "#0e7490", "#155e75", "#a5f3fc", "#164e63"];
const WORKPLACE_COLORS = ["#14b8a6", "#0d9488", "#2dd4bf", "#5eead4"];

const EXPERIENCE_ORDER = ["entry", "mid", "senior", "lead", "executive"];
const EXPERIENCE_LABEL: Record<string, string> = {
  entry: "Entry-Level",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
  executive: "Executive",
};

interface RawJob {
  id: number;
  jobType: string | null;
  workplace: string | null;
  industry: string | null;
  experienceLevel: string | null;
  educationLevel: string | null;
  companyProfileId: number | null;
}

function DashboardLogo({ profile }: { profile?: { name: string; logoUrl?: string | null } | null }) {
  if (profile?.logoUrl) {
    return (
      <img
        src={profile.logoUrl}
        alt={`${profile.name} logo`}
        className="w-12 h-12 rounded-lg object-cover border border-border"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
      <Building2 className="w-5 h-5 text-muted-foreground/50" />
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: profile } = useCompanyProfile();
  const companyProfileId = profile?.id;

  const autoRefresh = {
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    staleTime: 0,
  };

  const statsParams = companyProfileId ? { companyProfileId } : {};
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats(statsParams, {
    query: { queryKey: getGetDashboardStatsQueryKey(statsParams), enabled: !!companyProfileId, ...autoRefresh },
  });
  const recentMatchesParams = companyProfileId ? { limit: 5, companyProfileId } : { limit: 5 };
  const { data: recentMatches } = useGetRecentMatches(recentMatchesParams, { query: { queryKey: ["recent-matches", companyProfileId], enabled: !!companyProfileId, ...autoRefresh } });
  const topCandidatesParams = companyProfileId ? { limit: 5, companyProfileId } : { limit: 5 };
  const { data: topCandidates } = useGetTopCandidates(topCandidatesParams, { query: { queryKey: ["top-candidates", companyProfileId], enabled: !!companyProfileId, ...autoRefresh } });
  const skillDemandParams = companyProfileId ? { companyProfileId } : undefined;
  const { data: skillDemand } = useGetSkillDemand(skillDemandParams, { query: { queryKey: ["skill-demand", companyProfileId], enabled: !!companyProfileId, ...autoRefresh } });

  interface Applicant {
    id: number;
    candidateId: number;
    candidateName: string;
    candidateTitle: string | null;
    jobId: number;
    jobTitle: string;
    overallScore: number;
    status: string;
    createdAt: string;
  }

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const [companyJobs, setCompanyJobs] = useState<RawJob[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    if (!companyProfileId) return;
    async function fetchInsightData() {
      try {
        const [jobsRes, applicantsRes, bookmarksRes] = await Promise.all([
          fetch(`${basePath}/jobs?companyProfileId=${companyProfileId}`),
          fetch(`${basePath}/dashboard/applicants?companyProfileId=${companyProfileId}&limit=10`),
          fetch(`${basePath}/companies/${companyProfileId}/bookmarks`),
        ]);
        if (jobsRes.ok) setCompanyJobs(await jobsRes.json());
        if (applicantsRes.ok) setApplicants(await applicantsRes.json());
        if (bookmarksRes.ok) {
          const bookmarks = await bookmarksRes.json();
          setBookmarkCount(bookmarks.length);
        }
      } catch (err) {
        console.error("Failed to fetch insight data", err);
      }
    }
    fetchInsightData();
  }, [basePath, companyProfileId]);

  const insights = useMemo(() => {
    const freq = (arr: (string | null | undefined)[]) => {
      const m: Record<string, number> = {};
      arr.forEach(v => { if (v) m[v] = (m[v] || 0) + 1; });
      return topN(Object.entries(m));
    };

    const experienceCounts: Record<string, number> = {};
    companyJobs.forEach(j => {
      const lvl = (j.experienceLevel || "").toLowerCase();
      if (lvl) experienceCounts[lvl] = (experienceCounts[lvl] || 0) + 1;
    });
    const experienceLevels: [string, number][] = EXPERIENCE_ORDER
      .filter(k => experienceCounts[k])
      .map(k => [k, experienceCounts[k]]);

    return {
      jobTypes: freq(companyJobs.map(j => j.jobType)),
      workplaces: freq(companyJobs.map(j => j.workplace)),
      experienceLevels,
      educationReqs: freq(companyJobs.map(j => j.educationLevel)),
    };
  }, [companyJobs]);

  if (!profile || statsLoading) {
    return <div className="p-8 flex justify-center text-muted-foreground font-mono text-sm">Loading telemetry...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <DashboardLogo profile={profile} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile?.name || "Dashboard"}</h1>
            <p className="text-muted-foreground mt-1">Overview of your active recruitment pipeline.</p>
          </div>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Post Job
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/jobs?status=open" className="h-full">
          <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Jobs</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.openJobs || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of {stats?.totalJobs || 0} total</p>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full" onClick={() => navigate("/candidates")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">All Candidates</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalCandidates || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active &amp; passive</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full" onClick={() => navigate("/matches")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
            <Network className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.totalMatches || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.shortlistedCount || 0} shortlisted</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full" onClick={() => navigate("/candidates?bookmarks=1")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bookmarked</CardTitle>
            <Bookmark className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookmarkCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Saved candidates</p>
          </CardContent>
        </Card>

        <Card className="bg-card h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Match Score</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${(stats?.avgMatchScore ?? 0) > 75 ? 'text-green-500' : (stats?.avgMatchScore ?? 0) >= 50 ? 'text-orange-500' : 'text-muted-foreground'}`}>{stats?.avgMatchScore ? `${Math.round(stats.avgMatchScore)}%` : '0%'}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all active jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Applicants — full width */}
      <Card className="bg-card flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Applicants
            </span>
            <Link href="/matches?applied=true" className="text-xs font-normal text-muted-foreground hover:text-primary flex items-center">
              View all <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </CardTitle>
          <CardDescription>Candidates who have applied for your jobs</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            {applicants.length > 0 ? applicants.map((applicant) => (
              <div key={applicant.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer" onClick={() => navigate(`/candidates/${applicant.candidateId}`)}>
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{applicant.candidateName}</p>
                  <p className="text-xs text-muted-foreground truncate">{applicant.candidateTitle || "No title"}</p>
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">Applied for: {applicant.jobTitle}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    applicant.status === "shortlisted" ? "bg-green-500/10 text-green-500" :
                    applicant.status === "hired" ? "bg-blue-500/10 text-blue-500" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </span>
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {Math.round(applicant.overallScore)}%
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground text-center py-4">No applicants yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Recent Matches + Top Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <Card className="bg-card flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Recent Matches</span>
              <Link href="/matches" className="text-xs font-normal text-muted-foreground hover:text-primary flex items-center">
                View all <ArrowUpRight className="w-3 h-3 ml-1" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentMatches?.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer" onClick={() => navigate(`/candidates/${match.candidateId}`)}>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">{match.candidateName}</p>
                    <p className="text-xs text-muted-foreground truncate">{match.jobTitle}</p>
                  </div>
                  <div className="flex items-center ml-4 shrink-0">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      {Math.round(match.overallScore)}%
                    </span>
                  </div>
                </div>
              ))}
              {!recentMatches?.length && (
                <div className="text-sm text-muted-foreground text-center py-4">No recent matches found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Candidates */}
        <Card className="bg-card flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Top Candidates</span>
              <Link href="/candidates" className="text-xs font-normal text-muted-foreground hover:text-primary flex items-center">
                View all <ArrowUpRight className="w-3 h-3 ml-1" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {topCandidates?.map((candidate) => (
                <div key={candidate.candidateId} className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer" onClick={() => navigate(`/candidates/${candidate.candidateId}`)}>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">{candidate.candidateName}</p>
                    <p className="text-xs text-muted-foreground truncate">{candidate.candidateTitle}</p>
                  </div>
                  <div className="flex items-center ml-4 shrink-0">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      {candidate.matchCount}
                    </span>
                  </div>
                </div>
              ))}
              {!topCandidates?.length && (
                <div className="text-sm text-muted-foreground text-center py-4">No top candidates found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Types — Donut chart */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Your Jobs by Type
            </CardTitle>
            <CardDescription>Employment types across your job postings</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.jobTypes.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={insights.jobTypes.map(([type, count]) => ({ name: formatLabel(type), value: count, key: type }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                      onClick={(d: any) => d?.payload?.key && navigate(`/jobs?jobType=${encodeURIComponent(d.payload.key)}`)}
                      cursor="pointer"
                    >
                      {insights.jobTypes.map((_, i) => (
                        <Cell key={i} fill={JOB_TYPE_COLORS[i % JOB_TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No job type data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Workplaces — Radial bar chart */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Your Jobs by Workplace
            </CardTitle>
            <CardDescription>Office, remote, and hybrid distribution in your postings</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.workplaces.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    data={insights.workplaces.map(([wp, count], i) => ({
                      name: formatLabel(wp),
                      value: count,
                      key: wp,
                      fill: WORKPLACE_COLORS[i % WORKPLACE_COLORS.length],
                    }))}
                    innerRadius="25%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="value"
                      background={{ fill: 'hsl(var(--secondary))' }}
                      cornerRadius={6}
                      onClick={(d: any) => d?.key && navigate(`/jobs?workplace=${encodeURIComponent(d.key)}`)}
                      cursor="pointer"
                    />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No workplace data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Experience Levels — Horizontal bar chart */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Jobs by Experience Level
            </CardTitle>
            <CardDescription>Seniority mix across your job postings</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.experienceLevels.length > 0 ? (
              <div style={{ height: Math.max(180, insights.experienceLevels.length * 38) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={insights.experienceLevels.map(([lvl, count]) => ({ name: EXPERIENCE_LABEL[lvl] || formatLabel(lvl), value: count, key: lvl }))}
                    margin={{ top: 4, right: 28, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={100} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ fill: 'hsl(var(--secondary)/0.4)' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#f59e0b"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={26}
                      onClick={(d: any) => d?.key && navigate(`/jobs?experienceLevel=${encodeURIComponent(d.key)}`)}
                      cursor="pointer"
                    >
                      <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No experience-level data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Education — Vertical bar chart */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Your Education Requirements
            </CardTitle>
            <CardDescription>Education levels required by your job postings</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.educationReqs.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={insights.educationReqs.map(([edu, count]) => ({ name: edu, value: count, key: edu }))}
                    margin={{ top: 16, right: 8, left: -20, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ fill: 'hsl(var(--secondary)/0.4)' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                      onClick={(d: any) => d?.key && navigate(`/jobs?education=${encodeURIComponent(d.key)}`)}
                      cursor="pointer"
                    >
                      <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No education data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill Demand Chart */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Skill Demand</CardTitle>
          <CardDescription>Frequency of skills in job requirements vs candidate profiles</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {skillDemand && skillDemand.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDemand} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="skill" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="jobCount" name="Required in Jobs" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="candidateCount" name="Found in Candidates" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Not enough data to render chart</div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

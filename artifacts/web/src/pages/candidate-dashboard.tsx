import { useState, useEffect, useCallback } from "react";
import { useRole } from "@/contexts/role-context";
import { useGetCandidate, useGetCandidateMatches, useListJobs, getGetCandidateQueryKey, getGetCandidateMatchesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Target,
  MapPin,
  Building,
  ArrowUpRight,
  Star,
  TrendingUp,
  Search,
  UserCircle,
  Zap,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

export default function CandidateDashboard() {
  const { candidateProfileId } = useRole();
  const [, navigate] = useLocation();

  const { data: candidate } = useGetCandidate(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateQueryKey(candidateProfileId!) },
  });

  const onboardingState = (candidate as any)?.onboardingState as { currentStep?: number; completedAt?: string | null; skippedSteps?: number[] } | null | undefined;
  const onboardingIncomplete = candidate && (!onboardingState || !onboardingState.completedAt);
  const onboardingNeverStarted = candidate && (!onboardingState || (((onboardingState.currentStep ?? 1) <= 1) && !(onboardingState.skippedSteps?.length)));

  useEffect(() => {
    if (onboardingNeverStarted) {
      navigate("/onboarding");
    }
  }, [onboardingNeverStarted, navigate]);

  const { data: matches } = useGetCandidateMatches(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateMatchesQueryKey(candidateProfileId!) },
  });

  const { data: openJobs } = useListJobs({ status: "open" }, {
    query: { queryKey: ["open-jobs"] },
  });

  interface AppliedJob {
    id: number;
    jobId: number;
    jobTitle: string;
    jobCompany: string;
    overallScore: number;
    status: string;
    createdAt: string;
  }

  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [favouriteJobIds, setFavouriteJobIds] = useState<Set<number>>(new Set());
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const fetchFavourites = useCallback(async () => {
    if (!candidateProfileId) return;
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/favourites`);
      if (res.ok) {
        const data = await res.json();
        setFavouriteJobIds(new Set(data.map((f: any) => f.jobId)));
      }
    } catch {}
  }, [candidateProfileId, apiBase]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  useEffect(() => {
    if (!candidateProfileId) return;
    async function fetchAppliedJobs() {
      try {
        const res = await fetch(`${apiBase}/dashboard/applied-jobs?candidateId=${candidateProfileId}&limit=10`);
        if (res.ok) setAppliedJobs(await res.json());
      } catch {}
    }
    fetchAppliedJobs();
  }, [candidateProfileId, apiBase]);

  const favouritesCount = favouriteJobIds.size;

  if (!candidateProfileId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <UserCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Avana Talent</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create or select your candidate profile to unlock personalized job matches, score breakdowns, and career insights.
          </p>
          <Link href="/profile">
            <Button size="lg">
              <UserCircle className="w-4 h-4 mr-2" />
              Set Up My Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedMatches = [...(matches || [])].sort((a, b) => b.overallScore - a.overallScore);
  const topMatches = sortedMatches.slice(0, 5);
  const avgScore = matches?.length ? Math.round(matches.reduce((s, m) => s + m.overallScore, 0) / matches.length) : 0;
  const shortlistedCount = matches?.filter(m => m.status === "shortlisted" || m.status === "hired").length || 0;
  const highMatches = matches?.filter(m => m.overallScore >= 75).length || 0;

  const skillDemandData = (() => {
    if (!matches?.length) return [];
    const skillCounts = new Map<string, { matched: number; missing: number }>();
    for (const m of matches) {
      for (const s of (m as any).matchedSkills || []) {
        const entry = skillCounts.get(s) || { matched: 0, missing: 0 };
        entry.matched++;
        skillCounts.set(s, entry);
      }
      for (const s of (m as any).missingSkills || []) {
        const entry = skillCounts.get(s) || { matched: 0, missing: 0 };
        entry.missing++;
        skillCounts.set(s, entry);
      }
    }
    return Array.from(skillCounts.entries())
      .map(([skill, counts]) => ({ skill, ...counts, total: counts.matched + counts.missing }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  })();

  const avgSkillScore = matches?.length
    ? Math.round(matches.reduce((s, m) => s + m.skillScore, 0) / matches.length)
    : 0;
  const avgExpScore = matches?.length
    ? Math.round(matches.reduce((s, m) => s + m.experienceScore, 0) / matches.length)
    : 0;
  const avgEduScore = matches?.length
    ? Math.round(matches.reduce((s, m) => s + m.educationScore, 0) / matches.length)
    : 0;
  const avgLocScore = matches?.length
    ? Math.round(matches.reduce((s, m) => s + m.locationScore, 0) / matches.length)
    : 0;
  const avgVerScore = matches?.length
    ? Math.round(matches.reduce((s, m) => s + (m.verificationScore ?? 0), 0) / matches.length)
    : 0;

  const radarData = [
    { metric: "Skills", score: avgSkillScore },
    { metric: "Experience", score: avgExpScore },
    { metric: "Education", score: avgEduScore },
    { metric: "Location", score: avgLocScore },
    { metric: "Verified", score: avgVerScore },
  ];

  const scoreDistribution = [
    { range: "90-100%", rangeKey: "90-100", count: matches?.filter(m => m.overallScore >= 90).length || 0 },
    { range: "75-89%", rangeKey: "75-89", count: matches?.filter(m => m.overallScore >= 75 && m.overallScore < 90).length || 0 },
    { range: "50-74%", rangeKey: "50-74", count: matches?.filter(m => m.overallScore >= 50 && m.overallScore < 75).length || 0 },
    { range: "<50%", rangeKey: "0-49", count: matches?.filter(m => m.overallScore < 50).length || 0 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {onboardingIncomplete && !onboardingNeverStarted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#4CAF50" }}>
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "#1a2035" }}>Finish your profile to get better matches</p>
              <p className="text-sm text-slate-600">You're on step {onboardingState?.currentStep ?? 1} of 7. It only takes a couple of minutes.</p>
            </div>
          </div>
          <Button onClick={() => navigate("/onboarding")} className="font-semibold shrink-0" style={{ backgroundColor: "#4CAF50" }}>
            Resume setup
          </Button>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {candidate?.name?.split(" ")[0] || "Candidate"}
          </h1>
          <p className="text-muted-foreground mt-1">Your personalized career matching overview.</p>
        </div>
        <Link href="/profile">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer">
            {(candidate as any)?.profileImage ? (
              <img
                src={`${import.meta.env.BASE_URL}api/storage${(candidate as any).profileImage}`.replace(/\/\//g, "/")}
                alt={candidate?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {candidate?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">{candidate?.name}</p>
              <Badge
                className={`text-[10px] uppercase ${
                  (candidate?.status || "active") === "active"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : (candidate?.status) === "passive"
                    ? "bg-orange-400 text-white hover:bg-orange-500"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }`}
              >
                {candidate?.status === "not_looking" ? "Not Looking" : candidate?.status || "active"}
              </Badge>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/browse-jobs?favourites=1">
          <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Favourites</CardTitle>
              <Heart className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{favouritesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Saved jobs</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/browse-jobs">
          <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Positions</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{openJobs?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Available opportunities</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/my-matches">
          <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Job Matches</CardTitle>
              <Target className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{matches?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{highMatches} strong matches (75%+)</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/shortlisted")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{shortlistedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Companies interested</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Match Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${avgScore > 75 ? 'text-green-500' : avgScore >= 50 ? 'text-orange-500' : 'text-muted-foreground'}`}>{avgScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all matches</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Jobs Applied For
            </span>
            <Link href="/my-matches?applied=true" className="text-xs font-normal text-muted-foreground hover:text-primary flex items-center">
              View all <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </CardTitle>
          <CardDescription>Jobs you've applied to and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appliedJobs.length > 0 ? appliedJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.jobId}`}>
                <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer">
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{job.jobTitle}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center mt-0.5">
                      <Building className="w-3 h-3 mr-1 shrink-0" />
                      {job.jobCompany}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      job.status === "shortlisted" ? "bg-green-500/10 text-green-500" :
                      job.status === "hired" ? "bg-blue-500/10 text-blue-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                      job.overallScore >= 75
                        ? "text-green-700 bg-green-100"
                        : job.overallScore >= 50
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground bg-secondary"
                    }`}>
                      {Math.round(job.overallScore)}%
                    </span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                You haven't applied for any jobs yet. Browse matches to find opportunities.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Top Job Matches</span>
              <Link href="/my-matches" className="text-xs font-normal text-muted-foreground hover:text-primary flex items-center">
                View all <ArrowUpRight className="w-3 h-3 ml-1" />
              </Link>
            </CardTitle>
            <CardDescription>Your best-fitting opportunities based on AI matching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMatches.length > 0 ? topMatches.map((match) => (
                <Link key={match.id} href={`/jobs/${match.jobId}`}>
                  <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer">
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                        <Heart className={`w-3.5 h-3.5 shrink-0 ${favouriteJobIds.has(match.jobId) ? "fill-red-500 text-red-500" : "text-muted-foreground/30"}`} />
                        {match.jobTitle}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate flex items-center">
                          <Building className="w-3 h-3 mr-1 shrink-0" />
                          {match.jobCompany}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center ml-4 shrink-0 gap-2">
                      {match.status !== "pending" && (
                        <Badge variant={match.status === "shortlisted" || match.status === "hired" ? "default" : "secondary"} className="text-[9px] uppercase">
                          {match.status}
                        </Badge>
                      )}
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                        match.overallScore >= 75
                          ? "text-green-700 bg-green-100"
                          : match.overallScore >= 50
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground bg-secondary"
                      }`}>
                        {Math.round(match.overallScore)}%
                      </span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  No matches yet. Companies will match with your profile soon.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {matches && matches.length > 0 ? (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Score Distribution</CardTitle>
              <CardDescription>How your matches break down by score</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="range" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={60} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar
                    dataKey="count"
                    name="Matches"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={30}
                    cursor="pointer"
                    onClick={(data: any) => {
                      if (data?.rangeKey) navigate(`/my-matches`);
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card flex flex-col items-center justify-center">
            <CardContent className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Score Insights</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                Score distribution will appear here once you have matches.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {skillDemandData.length > 0 ? (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Skills in Demand</CardTitle>
              <CardDescription>Your top skills across matched jobs</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDemandData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="skill" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={90} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="matched" name="Matched" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="missing" name="Gap" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} maxBarSize={20} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card flex flex-col items-center justify-center">
            <CardContent className="text-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Skills Insights</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                Once you have job matches, you'll see which of your skills are in demand.
              </p>
            </CardContent>
          </Card>
        )}

        {matches && matches.length > 0 ? (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Match Strengths</CardTitle>
              <CardDescription>Average scores across all your matches</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Radar
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card flex flex-col items-center justify-center">
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No Match Data Yet</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                Companies will run AI matching against your profile. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        {matches && matches.length > 0 ? (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Score Distribution</CardTitle>
              <CardDescription>How your matches break down by score</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="range" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={60} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar
                    dataKey="count"
                    name="Matches"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={30}
                    cursor="pointer"
                    onClick={(data: any) => {
                      if (data?.rangeKey) navigate(`/my-matches`);
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card flex flex-col items-center justify-center">
            <CardContent className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Score Insights</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                Score distribution will appear here once you have matches.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Recent Opportunities</span>
            <Link href="/browse-jobs" className="text-xs font-normal text-muted-foreground hover:text-primary flex items-center">
              Browse all <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </CardTitle>
          <CardDescription>Latest open positions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {openJobs && openJobs.length > 0 ? openJobs.slice(0, 5).map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer">
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                      <Heart className={`w-3.5 h-3.5 shrink-0 ${favouriteJobIds.has(job.id) ? "fill-red-500 text-red-500" : "text-muted-foreground/30"}`} />
                      {job.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate flex items-center">
                        <Building className="w-3 h-3 mr-1 shrink-0" />
                        {job.company}
                      </p>
                      <p className="text-xs text-muted-foreground truncate flex items-center">
                        <MapPin className="w-3 h-3 mr-1 shrink-0" />
                        {job.location}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase shrink-0 ml-2">
                    {job.experienceLevel}
                  </Badge>
                </div>
              </Link>
            )) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                No open positions at the moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetDashboardStats, useGetRecentMatches, useGetSkillDemand, useGetTopCandidates, useCreateCompanyProfile, getGetCompanyProfileQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, Network, Target, ArrowUpRight, Upload, Camera, Building2, Plus, Monitor, GraduationCap, Factory, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

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

interface RawJob {
  id: number;
  jobType: string | null;
  workplace: string | null;
  industry: string | null;
  educationLevel: string | null;
  companyProfileId: number | null;
}

interface RawCandidate {
  id: number;
  preferredJobTypes: string[];
  preferredWorkplaces: string[];
  preferredIndustries: string[];
  qualifications: string[];
  education: string;
}

function DashboardLogo({ profile }: { profile?: { name: string; logoUrl?: string | null } | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveProfile = useCreateCompanyProfile();
  const basePath = `${import.meta.env.BASE_URL}api/storage`.replace(/\/\//g, "/");

  const { uploadFile, isUploading } = useUpload({
    basePath,
    onSuccess: (response) => {
      const logoUrl = `${import.meta.env.BASE_URL}api/storage${response.objectPath}`.replace(/\/\//g, "/");
      saveProfile.mutate(
        { data: { name: profile?.name || "My Company", logoUrl } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCompanyProfileQueryKey() });
            toast({ title: "Logo updated", description: "Company logo has been saved." });
          },
        }
      );
    },
    onError: (err) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  function handleClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 5MB.", variant: "destructive" });
      return;
    }
    await uploadFile(file);
    e.target.value = "";
  }

  const hasLogo = !!profile?.logoUrl;

  return (
    <div className="relative group">
      {hasLogo ? (
        <button onClick={handleClick} disabled={isUploading} className="relative cursor-pointer">
          <img
            src={profile.logoUrl!}
            alt={`${profile.name} logo`}
            className="w-12 h-12 rounded-lg object-cover border border-border"
          />
          <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {isUploading ? (
              <Upload className="w-4 h-4 text-white animate-pulse" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </div>
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex items-center justify-center transition-colors cursor-pointer"
          title="Upload company logo"
        >
          {isUploading ? (
            <Upload className="w-5 h-5 text-muted-foreground animate-pulse" />
          ) : (
            <Building2 className="w-5 h-5 text-muted-foreground/50" />
          )}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: profile } = useCompanyProfile();
  const companyProfileId = profile?.id;

  const statsParams = companyProfileId ? { companyProfileId } : {};
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats(statsParams, {
    query: { queryKey: getGetDashboardStatsQueryKey(statsParams), enabled: !!companyProfileId },
  });
  const recentMatchesParams = companyProfileId ? { limit: 5, companyProfileId } : { limit: 5 };
  const { data: recentMatches } = useGetRecentMatches(recentMatchesParams, { query: { queryKey: ["recent-matches", companyProfileId], enabled: !!companyProfileId } });
  const topCandidatesParams = companyProfileId ? { limit: 5, companyProfileId } : { limit: 5 };
  const { data: topCandidates } = useGetTopCandidates(topCandidatesParams, { query: { queryKey: ["top-candidates", companyProfileId], enabled: !!companyProfileId } });
  const skillDemandParams = companyProfileId ? { companyProfileId } : undefined;
  const { data: skillDemand } = useGetSkillDemand(skillDemandParams, { query: { queryKey: ["skill-demand", companyProfileId], enabled: !!companyProfileId } });

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const [companyJobs, setCompanyJobs] = useState<RawJob[]>([]);
  const [allCandidates, setAllCandidates] = useState<RawCandidate[]>([]);

  useEffect(() => {
    if (!companyProfileId) return;
    async function fetchInsightData() {
      try {
        const [jobsRes, candidatesRes] = await Promise.all([
          fetch(`${basePath}/jobs?companyProfileId=${companyProfileId}`),
          fetch(`${basePath}/candidates`),
        ]);
        if (jobsRes.ok) setCompanyJobs(await jobsRes.json());
        if (candidatesRes.ok) setAllCandidates(await candidatesRes.json());
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
    const freqFlat = (arr: string[][]) => {
      const m: Record<string, number> = {};
      arr.forEach(a => (a || []).forEach(v => { if (v) m[v] = (m[v] || 0) + 1; }));
      return topN(Object.entries(m));
    };

    return {
      jobTypes: freq(companyJobs.map(j => j.jobType)),
      workplaces: freq(companyJobs.map(j => j.workplace)),
      jobIndustries: freq(companyJobs.map(j => j.industry)),
      educationReqs: freq(companyJobs.map(j => j.educationLevel)),
      prefJobTypes: freqFlat(allCandidates.map(c => c.preferredJobTypes)),
      prefWorkplaces: freqFlat(allCandidates.map(c => c.preferredWorkplaces)),
      prefIndustries: freqFlat(allCandidates.map(c => c.preferredIndustries)),
      candidateEducation: freq(allCandidates.map(c => c.education)),
    };
  }, [companyJobs, allCandidates]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/jobs?status=open">
          <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer">
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
        
        <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/candidates?status=active")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Candidates</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeCandidates || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {stats?.totalCandidates || 0} total</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/matches")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
            <Network className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.totalMatches || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.shortlistedCount || 0} shortlisted</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Match Score</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.avgMatchScore ? `${Math.round(stats.avgMatchScore)}%` : '0%'}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all active jobs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Skill Demand Chart */}
        <Card className="col-span-1 lg:col-span-2 bg-card">
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

        {/* Recent Matches */}
        <Card className="col-span-1 bg-card flex flex-col">
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
        <Card className="col-span-1 bg-card flex flex-col">
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
              <div className="space-y-2.5">
                {insights.jobTypes.map(([type, count]) => (
                  <InsightBar key={type} label={formatLabel(type)} value={count} max={insights.jobTypes[0][1]} color="bg-cyan-500/70" onClick={() => navigate(`/jobs?jobType=${encodeURIComponent(type)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No job type data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Candidate Preferred Job Types
            </CardTitle>
            <CardDescription>What candidates in the talent pool are looking for</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.prefJobTypes.length > 0 ? (
              <div className="space-y-2.5">
                {insights.prefJobTypes.map(([type, count]) => (
                  <InsightBar key={type} label={formatLabel(type)} value={count} max={insights.prefJobTypes[0][1]} color="bg-pink-500/70" onClick={() => navigate(`/candidates?search=${encodeURIComponent(type)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No preference data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="space-y-2.5">
                {insights.workplaces.map(([wp, count]) => (
                  <InsightBar key={wp} label={formatLabel(wp)} value={count} max={insights.workplaces[0][1]} color="bg-teal-500/70" onClick={() => navigate(`/jobs?workplace=${encodeURIComponent(wp)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No workplace data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Candidate Preferred Workplaces
            </CardTitle>
            <CardDescription>Where candidates in the talent pool want to work</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.prefWorkplaces.length > 0 ? (
              <div className="space-y-2.5">
                {insights.prefWorkplaces.map(([wp, count]) => (
                  <InsightBar key={wp} label={formatLabel(wp)} value={count} max={insights.prefWorkplaces[0][1]} color="bg-rose-500/70" onClick={() => navigate(`/candidates?search=${encodeURIComponent(wp)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No preference data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="w-4 h-4" />
              Your Jobs by Industry
            </CardTitle>
            <CardDescription>Industry sectors your jobs are posted in</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.jobIndustries.length > 0 ? (
              <div className="space-y-2.5">
                {insights.jobIndustries.map(([ind, count]) => (
                  <InsightBar key={ind} label={formatLabel(ind)} value={count} max={insights.jobIndustries[0][1]} color="bg-orange-500/70" onClick={() => navigate(`/jobs?industry=${encodeURIComponent(ind)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No industry data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Candidate Preferred Industries
            </CardTitle>
            <CardDescription>Industries candidates in the talent pool are interested in</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.prefIndustries.length > 0 ? (
              <div className="space-y-2.5">
                {insights.prefIndustries.map(([ind, count]) => (
                  <InsightBar key={ind} label={formatLabel(ind)} value={count} max={insights.prefIndustries[0][1]} color="bg-fuchsia-500/70" onClick={() => navigate(`/candidates?search=${encodeURIComponent(ind)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No preference data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="space-y-2.5">
                {insights.educationReqs.map(([edu, count]) => (
                  <InsightBar key={edu} label={edu} value={count} max={insights.educationReqs[0][1]} color="bg-indigo-500/70" onClick={() => navigate(`/jobs?education=${encodeURIComponent(edu)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No education data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Candidate Education Levels
            </CardTitle>
            <CardDescription>Qualifications held by candidates in the talent pool</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.candidateEducation.length > 0 ? (
              <div className="space-y-2.5">
                {insights.candidateEducation.map(([edu, count]) => (
                  <InsightBar key={edu} label={edu} value={count} max={insights.candidateEducation[0][1]} color="bg-sky-500/70" onClick={() => navigate(`/candidates?search=${encodeURIComponent(edu)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No education data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

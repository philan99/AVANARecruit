import { useRole } from "@/contexts/role-context";
import { useGetCandidate, useGetCandidateMatches, useListJobs, useListCandidates } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Target, MapPin, Building, ArrowUpRight, Star, TrendingUp, Search } from "lucide-react";
import { Link } from "wouter";

export default function CandidateDashboard() {
  const { candidateProfileId } = useRole();

  const { data: candidate } = useGetCandidate(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: ["candidate", candidateProfileId] },
  });

  const { data: matches } = useGetCandidateMatches(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: ["candidate-matches", candidateProfileId] },
  });

  const { data: openJobs } = useListJobs({ status: "open" }, {
    query: { queryKey: ["open-jobs"] },
  });

  if (!candidateProfileId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Set Up Your Profile</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create or select your candidate profile to see personalized job matches and opportunities.
          </p>
          <Link href="/profile">
            <Button size="lg">
              Go to My Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const topMatches = matches?.sort((a, b) => b.overallScore - a.overallScore).slice(0, 5) || [];
  const avgScore = matches?.length ? Math.round(matches.reduce((s, m) => s + m.overallScore, 0) / matches.length) : 0;
  const shortlistedCount = matches?.filter(m => m.status === "shortlisted" || m.status === "hired").length || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {candidate?.name?.split(" ")[0] || "Candidate"}
        </h1>
        <p className="text-muted-foreground mt-1">Here's your job matching overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Positions</CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openJobs?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Available opportunities</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Job Matches</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{matches?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on your profile</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Match Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all matches</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{shortlistedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Companies interested</p>
          </CardContent>
        </Card>
      </div>

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
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-foreground truncate">{match.jobTitle}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center mt-0.5">
                        <Building className="w-3 h-3 mr-1" />
                        {match.jobCompany}
                      </p>
                    </div>
                    <div className="flex items-center ml-4 shrink-0 gap-2">
                      {match.status !== "pending" && (
                        <Badge variant={match.status === "shortlisted" ? "default" : match.status === "hired" ? "default" : "secondary"} className="text-[9px] uppercase">
                          {match.status}
                        </Badge>
                      )}
                      <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        {Math.round(match.overallScore)}%
                      </span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No matches yet. Companies will match with your profile soon.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
              {openJobs?.slice(0, 5).map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer">
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate flex items-center">
                          <Building className="w-3 h-3 mr-1" />
                          {job.company}
                        </p>
                        <p className="text-xs text-muted-foreground truncate flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase shrink-0 ml-2">
                      {job.experienceLevel}
                    </Badge>
                  </div>
                </Link>
              )) || (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No open positions at the moment.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

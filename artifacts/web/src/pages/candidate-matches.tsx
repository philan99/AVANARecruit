import { useState, useMemo } from "react";
import { useRole } from "@/contexts/role-context";
import { useGetCandidateMatches, getGetCandidateMatchesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Building, MapPin, Briefcase, ArrowRight, Sparkles, X } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

type ScoreFilter = "all" | "high" | "mid" | "low";

export default function CandidateMatches() {
  const { candidateProfileId } = useRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");

  const { data: matches, isLoading } = useGetCandidateMatches(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateMatchesQueryKey(candidateProfileId!) },
  });

  async function handleRunMatching() {
    if (!candidateProfileId) return;
    setIsRunning(true);
    try {
      const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/run-matching`, {
        method: "POST",
      });
      if (res.ok) {
        const results = await res.json();
        queryClient.invalidateQueries({ queryKey: getGetCandidateMatchesQueryKey(candidateProfileId) });
        toast({ title: "AI Matching Complete", description: `Found ${results.length} job matches.` });
      } else {
        toast({ title: "Error", description: "Failed to run matching.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to run matching.", variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  }

  if (!candidateProfileId) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center py-16">
        <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">No Profile Selected</h2>
        <p className="text-muted-foreground mb-6">Set up your profile first to see job matches.</p>
        <Link href="/profile">
          <Button>Go to My Profile</Button>
        </Link>
      </div>
    );
  }

  const allSorted = useMemo(() => [...(matches || [])].sort((a, b) => b.overallScore - a.overallScore), [matches]);

  const sortedMatches = useMemo(() => {
    if (scoreFilter === "all") return allSorted;
    return allSorted.filter(m => {
      const score = Math.round(m.overallScore);
      if (scoreFilter === "high") return score > 75;
      if (scoreFilter === "mid") return score >= 50 && score <= 75;
      if (scoreFilter === "low") return score < 50;
      return true;
    });
  }, [allSorted, scoreFilter]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Target className="mr-3 text-primary" /> My Job Matches
          </h1>
          <p className="text-muted-foreground mt-1">Jobs that match your skills and experience, ranked by AI scoring.</p>
        </div>
        <Button onClick={handleRunMatching} disabled={isRunning} className="shrink-0">
          <Sparkles className="w-4 h-4 mr-2" />
          {isRunning ? "Running..." : "Run AI Matching"}
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground font-mono">Loading matches...</div>
      ) : allSorted.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Matches Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Companies haven't matched against your profile yet. Browse open positions in the meantime.
            </p>
            <Link href="/browse-jobs">
              <Button variant="outline" className="mt-4">Browse Open Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="font-mono text-sm px-3 py-1">{allSorted.length} Total Matches</Badge>
            <div className="flex items-center gap-1 ml-auto">
              {([
                { key: "high" as ScoreFilter, label: "> 75%" },
                { key: "mid" as ScoreFilter, label: "50-75%" },
                { key: "low" as ScoreFilter, label: "< 50%" },
                { key: "all" as ScoreFilter, label: "All" },
              ]).map(f => (
                <Button
                  key={f.key}
                  variant={scoreFilter === f.key ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-3"
                  onClick={() => setScoreFilter(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {scoreFilter !== "all" && (
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{sortedMatches.length}</span> of {allSorted.length} matches
            </p>
          )}

        <div className="space-y-4">
          {sortedMatches.map((match) => (
            <Card key={match.id} className="bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                        {Math.round(match.overallScore)}%
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-foreground">{match.jobTitle}</h3>
                          <Badge
                            variant={match.status === "shortlisted" ? "default" : match.status === "hired" ? "default" : match.status === "rejected" ? "destructive" : "secondary"}
                            className="text-[10px] uppercase"
                          >
                            {match.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center"><Building className="w-3.5 h-3.5 mr-1" />{match.jobCompany}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{match.assessment}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {match.matchedSkills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-[10px] py-0 h-5 bg-background">
                              {skill}
                            </Badge>
                          ))}
                          {match.missingSkills.length > 0 && (
                            <Badge variant="outline" className="text-[10px] py-0 h-5 bg-destructive/5 text-destructive border-destructive/20">
                              {match.missingSkills.length} skills to develop
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-secondary/50 rounded px-2 py-1">
                        <div className="text-xs font-mono font-bold text-foreground">{Math.round(match.skillScore)}%</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Skills</div>
                      </div>
                      <div className="bg-secondary/50 rounded px-2 py-1">
                        <div className="text-xs font-mono font-bold text-foreground">{Math.round(match.experienceScore)}%</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Exp</div>
                      </div>
                      <div className="bg-secondary/50 rounded px-2 py-1">
                        <div className="text-xs font-mono font-bold text-foreground">{Math.round(match.educationScore)}%</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Edu</div>
                      </div>
                      <div className="bg-secondary/50 rounded px-2 py-1">
                        <div className="text-xs font-mono font-bold text-foreground">{Math.round(match.locationScore)}%</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Loc</div>
                      </div>
                    </div>
                    <Link href={`/jobs/${match.jobId}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Job <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </>
      )}
    </div>
  );
}

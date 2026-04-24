import { useState, useMemo, useEffect, useRef } from "react";
import { useRole } from "@/contexts/role-context";
import { useGetCandidateMatches, getGetCandidateMatchesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Building, ArrowRight, Sparkles, MapPin, Briefcase, Monitor, LayoutGrid, List, Microscope } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { MatchDiagnosticDialog } from "@/components/match-diagnostic-dialog";

type ScoreFilter = "all" | "high" | "mid" | "low";

function scoreColor(score: number) {
  if (score >= 75) return "bg-green-500 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  return "bg-gray-400 text-white";
}

function scoreChipClasses(v: number) {
  if (v >= 75) return "bg-green-500/10 border-green-500/40 text-green-700 dark:text-green-400";
  if (v >= 50) return "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400";
  return "bg-gray-400/10 border-gray-400/40 text-gray-600 dark:text-gray-400";
}

function ScoreChip({ label, v }: { label: string; v: number | undefined }) {
  const score = Math.round(v ?? 0);
  return (
    <div className={`flex items-center justify-between rounded px-2 py-1 border ${scoreChipClasses(score)}`}>
      <span className="opacity-80">{label}</span>
      <span className="font-semibold">{score}</span>
    </div>
  );
}

export default function CandidateMatches() {
  const { candidateProfileId } = useRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const searchString = useSearch();
  const appliedOnly = new URLSearchParams(searchString).get("applied") === "true";
  const [isRunning, setIsRunning] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("high");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [diagnosticTarget, setDiagnosticTarget] = useState<{ jobId: number; jobTitle: string; jobCompany: string } | null>(null);
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const diagnosticFetchUrl =
    diagnosticTarget && candidateProfileId
      ? `${apiBase}/matches/candidate-diagnostic?candidateId=${candidateProfileId}&jobId=${diagnosticTarget.jobId}`
      : null;

  const { data: matches, isLoading } = useGetCandidateMatches(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateMatchesQueryKey(candidateProfileId!) },
  });

  async function handleRunMatching(silent = false) {
    if (!candidateProfileId) return;
    setIsRunning(true);
    try {
      const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/run-matching`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const results = await res.json();
        queryClient.invalidateQueries({ queryKey: getGetCandidateMatchesQueryKey(candidateProfileId) });
        if (!silent) {
          toast({ title: "AI Matching Complete", description: `Found ${results.length} job matches.` });
        }
      } else if (!silent) {
        toast({ title: "Error", description: "Failed to run matching.", variant: "destructive" });
      }
    } catch {
      if (!silent) toast({ title: "Error", description: "Failed to run matching.", variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  }

  const autoRanRef = useRef(false);
  useEffect(() => {
    if (autoRanRef.current) return;
    if (!candidateProfileId) return;
    if (isLoading) return;
    if (matches && matches.length === 0 && !isRunning) {
      autoRanRef.current = true;
      handleRunMatching(true);
    }
  }, [candidateProfileId, isLoading, matches, isRunning]);

  const allSorted = useMemo(() => [...(matches || [])].sort((a, b) => b.overallScore - a.overallScore), [matches]);

  const sortedMatches = useMemo(() => {
    return allSorted.filter(m => {
      if (appliedOnly && !m.applied) return false;
      const score = Math.round(m.overallScore);
      if (scoreFilter === "high") return score > 75;
      if (scoreFilter === "mid") return score >= 50 && score <= 75;
      if (scoreFilter === "low") return score < 50;
      return true;
    });
  }, [allSorted, scoreFilter, appliedOnly]);

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

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Target className="mr-3 text-primary" /> My Job Matches
          </h1>
          <p className="text-muted-foreground mt-1">Jobs that match your skills and experience, ranked by AI scoring.</p>
        </div>
        <Button onClick={() => handleRunMatching()} disabled={isRunning} className="shrink-0">
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
            {scoreFilter !== "all" && (
              <span className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{sortedMatches.length}</span> of {allSorted.length}
              </span>
            )}
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
            <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("card")}
                aria-label="Card view"
                title="Card view"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                title="List view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="flex flex-col gap-3">
              {sortedMatches.map(match => (
                <Card key={match.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
                      <Badge className={`${scoreColor(match.overallScore)} text-base font-bold border-0 shrink-0 w-16 h-10 justify-center`}>
                        {Math.round(match.overallScore)}%
                      </Badge>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground truncate">{match.jobTitle}</h3>
                          {match.applied && (
                            <Badge className="text-[10px] uppercase border-0 bg-primary text-primary-foreground">Applied</Badge>
                          )}
                          {match.status !== "pending" && (
                            <Badge
                              variant={match.status === "rejected" ? "destructive" : "secondary"}
                              className="text-[10px] uppercase"
                            >
                              {match.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Building className="w-3 h-3" />{match.jobCompany}</span>
                          {match.jobLocation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.jobLocation}</span>}
                          {match.jobType && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{match.jobType}</span>}
                          {match.jobWorkplace && <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{match.jobWorkplace}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-1.5 text-[11px] shrink-0">
                        {[
                          { label: "Exp", v: match.experienceScore },
                          { label: "Skl", v: match.skillScore },
                          { label: "Prf", v: match.preferenceScore ?? 0 },
                          { label: "Ver", v: match.verificationScore ?? 0 },
                          { label: "Loc", v: match.locationScore },
                          { label: "Edu", v: match.educationScore },
                        ].map(c => {
                          const v = Math.round(c.v);
                          return (
                            <div key={c.label} className={`rounded px-2 py-1 text-center w-14 border ${scoreChipClasses(v)}`}>
                              <div className="text-[9px] uppercase opacity-80">{c.label}</div>
                              <div className="font-semibold">{v}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setDiagnosticTarget({ jobId: match.jobId, jobTitle: match.jobTitle, jobCompany: match.jobCompany })}
                        >
                          <Microscope className="w-3 h-3 mr-1" /> Run match diagnostic
                        </Button>
                        <Link href={`/jobs/${match.jobId}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            View Job <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {match.assessment && (
                      <p className="text-xs text-muted-foreground flex gap-1.5 mt-3">
                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                        <span className="line-clamp-2">{match.assessment}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedMatches.map(match => (
              <Card key={match.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{match.jobTitle}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3 h-3" /> {match.jobCompany}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1.5">
                        {match.jobLocation && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.jobLocation}</span>
                        )}
                        {match.jobType && (
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{match.jobType}</span>
                        )}
                        {match.jobWorkplace && (
                          <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{match.jobWorkplace}</span>
                        )}
                      </div>
                    </div>
                    <Badge className={`${scoreColor(match.overallScore)} text-sm font-bold border-0 shrink-0`}>
                      {Math.round(match.overallScore)}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {match.status !== "pending" && (
                      <Badge
                        variant={match.status === "rejected" ? "destructive" : "secondary"}
                        className="text-[10px] uppercase"
                      >
                        {match.status}
                      </Badge>
                    )}
                    {match.applied && (
                      <Badge className="text-[10px] uppercase border-0 bg-primary text-primary-foreground">Applied</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <ScoreChip label="Experience" v={match.experienceScore} />
                    <ScoreChip label="Skills" v={match.skillScore} />
                    <ScoreChip label="Preferences" v={match.preferenceScore ?? 0} />
                    <ScoreChip label="Verification" v={match.verificationScore ?? 0} />
                    <ScoreChip label="Location" v={match.locationScore} />
                    <ScoreChip label="Education" v={match.educationScore} />
                  </div>

                  {match.assessment && (
                    <p className="text-xs text-muted-foreground flex gap-1.5">
                      <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                      <span className="line-clamp-3">{match.assessment}</span>
                    </p>
                  )}

                  {(match.matchedSkills.length > 0 || match.missingSkills.length > 0) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {match.matchedSkills.slice(0, 6).map(s => (
                        <Badge key={`m-${s}`} variant="outline" className="text-[10px] border-green-500/40 text-green-600">{s}</Badge>
                      ))}
                      {match.missingSkills.slice(0, 4).map(s => (
                        <Badge key={`x-${s}`} variant="outline" className="text-[10px] border-destructive/40 text-destructive">{s}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setDiagnosticTarget({ jobId: match.jobId, jobTitle: match.jobTitle, jobCompany: match.jobCompany })}
                    >
                      <Microscope className="w-3 h-3 mr-1" /> Run match diagnostic
                    </Button>
                    <Link href={`/jobs/${match.jobId}`}>
                      <Button variant="outline" size="sm" className="text-xs w-full">
                        View Job <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </>
      )}

      <MatchDiagnosticDialog
        open={!!diagnosticTarget}
        onOpenChange={(o) => { if (!o) setDiagnosticTarget(null); }}
        fetchUrl={diagnosticFetchUrl}
        subtitle={diagnosticTarget ? `${diagnosticTarget.jobTitle} · ${diagnosticTarget.jobCompany}` : undefined}
      />
    </div>
  );
}

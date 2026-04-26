import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, Target, Briefcase, ChevronDown, ChevronRight, ShieldCheck, Send, ChevronsDownUp, ChevronsUpDown, Building } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  companyProfileId: number | null;
  matchCount: number;
  status: string;
}

interface MatchItem {
  id: number;
  jobId: number;
  candidateId: number;
  candidateName: string;
  candidateTitle: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  verificationScore: number;
  matchedSkills: string[];
  assessment: string;
  status: string;
  applied: boolean;
  createdAt: string;
}

interface JobGroup {
  jobId: number;
  jobTitle: string;
  company: string;
  companyProfileId: number | null;
  matches: MatchItem[];
}

interface VerificationSummary {
  total: number;
  verified: number;
  pending: number;
  declined: number;
}

type ScoreFilter = "all" | "high" | "mid" | "low";

export default function AdminMatches() {
  const [allMatches, setAllMatches] = useState<JobGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedJobs, setCollapsedJobs] = useState<Set<number>>(new Set());
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("high");
  const [verificationMap, setVerificationMap] = useState<Record<number, VerificationSummary>>({});

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const jobsRes = await fetch(`${basePath}/jobs`);
        if (!jobsRes.ok) throw new Error("Failed to load jobs");
        const jobs: Job[] = await jobsRes.json();

        const groups: JobGroup[] = [];
        const results = await Promise.all(
          jobs.map(async (job) => {
            const res = await fetch(`${basePath}/jobs/${job.id}/matches`);
            if (res.ok) {
              const matches: MatchItem[] = await res.json();
              return {
                jobId: job.id,
                jobTitle: job.title,
                company: job.company,
                companyProfileId: job.companyProfileId,
                matches,
              };
            }
            return {
              jobId: job.id,
              jobTitle: job.title,
              company: job.company,
              companyProfileId: job.companyProfileId,
              matches: [],
            };
          })
        );

        for (const r of results) {
          if (r.matches.length > 0) {
            r.matches.sort((a, b) => b.overallScore - a.overallScore);
            groups.push(r);
          }
        }

        groups.sort((a, b) => {
          const cmp = a.company.localeCompare(b.company);
          if (cmp !== 0) return cmp;
          return a.jobTitle.localeCompare(b.jobTitle);
        });

        setAllMatches(groups);
        setCollapsedJobs(new Set(groups.map(g => g.jobId)));

        const candidateIds = new Set<number>();
        for (const g of groups) {
          for (const m of g.matches) {
            candidateIds.add(m.candidateId);
          }
        }

        const verifResults: Record<number, VerificationSummary> = {};
        await Promise.all(
          Array.from(candidateIds).map(async (cid) => {
            try {
              const vRes = await fetch(`${basePath}/candidates/${cid}/verifications`);
              if (vRes.ok) {
                const verifs: { status: string }[] = await vRes.json();
                verifResults[cid] = {
                  total: verifs.length,
                  verified: verifs.filter(v => v.status === "verified").length,
                  pending: verifs.filter(v => v.status === "pending").length,
                  declined: verifs.filter(v => v.status === "declined").length,
                };
              }
            } catch {}
          })
        );
        setVerificationMap(verifResults);
      } catch (err) {
        console.error("Failed to load admin matches", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [basePath]);

  const totalMatches = useMemo(
    () => allMatches.reduce((sum, g) => sum + g.matches.length, 0),
    [allMatches]
  );

  const totalCompanies = useMemo(() => {
    const set = new Set<string>();
    for (const g of allMatches) set.add(g.company);
    return set.size;
  }, [allMatches]);

  const filteredGroups = useMemo(() => {
    return allMatches
      .map(g => ({
        ...g,
        matches: g.matches.filter(m => {
          const score = Math.round(m.overallScore);
          if (scoreFilter === "high") return score > 75;
          if (scoreFilter === "mid") return score >= 50 && score <= 75;
          if (scoreFilter === "low") return score < 50;
          return true;
        }),
      }))
      .filter(g => g.matches.length > 0);
  }, [allMatches, scoreFilter]);

  const filteredTotal = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.matches.length, 0),
    [filteredGroups]
  );

  const toggleJob = (jobId: number) => {
    setCollapsedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Network className="mr-3 text-primary" /> All Job Matches
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-generated candidate matches across every job and every company on AVANA Recruit.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-mono">Loading all matches...</div>
      ) : allMatches.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>No matches found yet.</p>
              <p className="text-sm mt-2">Once companies run the matching engine on their jobs, results will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="font-mono text-sm px-3 py-1">{totalMatches} Total Matches</Badge>
            <Badge variant="outline" className="font-mono text-sm px-3 py-1">{allMatches.length} Jobs with Matches</Badge>
            <Badge variant="outline" className="font-mono text-sm px-3 py-1">{totalCompanies} Companies</Badge>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setCollapsedJobs(new Set())}
                disabled={collapsedJobs.size === 0}
              >
                <ChevronsUpDown className="w-3.5 h-3.5 mr-1" /> Expand all
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setCollapsedJobs(new Set(allMatches.map(g => g.jobId)))}
                disabled={collapsedJobs.size === allMatches.length}
              >
                <ChevronsDownUp className="w-3.5 h-3.5 mr-1" /> Collapse all
              </Button>
            </div>
            <div className="flex items-center gap-1">
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
              Showing <span className="font-medium text-foreground">{filteredTotal}</span> of {totalMatches} matches
            </p>
          )}

          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <Card key={group.jobId} className="bg-card">
                <CardHeader
                  className="border-b border-border pb-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => toggleJob(group.jobId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {collapsedJobs.has(group.jobId) ? (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                      <Briefcase className="w-5 h-5 text-primary" />
                      <div className="flex flex-col">
                        <Link
                          href={`/jobs/${group.jobId}`}
                          className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {group.jobTitle}
                        </Link>
                        <div
                          className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Building className="w-3 h-3" />
                          {group.companyProfileId ? (
                            <Link
                              href={`/companies/${group.companyProfileId}`}
                              className="hover:text-primary transition-colors"
                            >
                              {group.company}
                            </Link>
                          ) : (
                            <span>{group.company}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">{group.matches.length} Matches</Badge>
                  </div>
                </CardHeader>
                {!collapsedJobs.has(group.jobId) && (
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-secondary/50">
                        <TableRow>
                          <TableHead className="w-[250px]">Candidate</TableHead>
                          <TableHead className="text-center font-mono">Overall</TableHead>
                          <TableHead className="text-center font-mono hidden md:table-cell">Skills</TableHead>
                          <TableHead className="text-center font-mono hidden md:table-cell">Experience</TableHead>
                          <TableHead className="text-center font-mono hidden lg:table-cell">Education</TableHead>
                          <TableHead className="text-center font-mono hidden lg:table-cell">Location</TableHead>
                          <TableHead className="text-center font-mono hidden lg:table-cell">Verified</TableHead>
                          <TableHead className="hidden xl:table-cell">Matched Skills</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden xl:table-cell">Assessment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.matches.map((match) => (
                          <TableRow key={match.id} className={match.applied ? "bg-blue-500/5 border-l-2 border-l-blue-500" : ""}>
                            <TableCell>
                              <Link href={`/candidates/${match.candidateId}`} className="block hover:text-primary transition-colors">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-medium text-foreground">{match.candidateName}</span>
                                  {match.applied && (
                                    <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-600 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" title="Candidate has applied">
                                      <Send className="w-3 h-3" />
                                      Applied
                                    </span>
                                  )}
                                  {verificationMap[match.candidateId]?.verified > 0 && (
                                    <span className="inline-flex items-center gap-0.5 bg-green-500/10 text-green-600 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" title={`${verificationMap[match.candidateId].verified} verified employment${verificationMap[match.candidateId].verified > 1 ? "s" : ""}`}>
                                      <ShieldCheck className="w-3 h-3" />
                                      Verified
                                    </span>
                                  )}
                                  {verificationMap[match.candidateId]?.total > 0 && verificationMap[match.candidateId].verified === 0 && verificationMap[match.candidateId].pending > 0 && (
                                    <span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-600 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" title="Verification pending">
                                      <ShieldCheck className="w-3 h-3" />
                                      Pending
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">{match.candidateTitle}</div>
                              </Link>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-sm">
                                {Math.round(match.overallScore)}%
                              </div>
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              <span className="font-mono text-sm">{Math.round(match.skillScore)}%</span>
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              <span className="font-mono text-sm">{Math.round(match.experienceScore)}%</span>
                            </TableCell>
                            <TableCell className="text-center hidden lg:table-cell">
                              <span className="font-mono text-sm">{Math.round(match.educationScore)}%</span>
                            </TableCell>
                            <TableCell className="text-center hidden lg:table-cell">
                              <span className="font-mono text-sm">{Math.round(match.locationScore)}%</span>
                            </TableCell>
                            <TableCell className="text-center hidden lg:table-cell">
                              <span className="font-mono text-sm">{Math.round(match.verificationScore ?? 0)}%</span>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {match.matchedSkills.slice(0, 3).map(skill => (
                                  <Badge key={skill} variant="outline" className="text-[10px] py-0 h-4 bg-background">
                                    {skill}
                                  </Badge>
                                ))}
                                {match.matchedSkills.length > 3 && (
                                  <Badge variant="outline" className="text-[10px] py-0 h-4 bg-background">
                                    +{match.matchedSkills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const isApplied = match.status === 'pending' && match.applied;
                                const displayStatus = isApplied ? 'applied' : match.status;
                                return (
                                  <Badge
                                    variant={match.status === 'shortlisted' ? 'default' : match.status === 'rejected' ? 'destructive' : match.status === 'hired' ? 'default' : 'secondary'}
                                    className={`text-[10px] uppercase tracking-wider ${match.status === 'hired' ? 'bg-green-600 hover:bg-green-700' : match.status === 'interviewed' ? 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30' : match.status === 'screened' ? 'bg-purple-500/15 text-purple-700 border-purple-500/30' : match.status === 'offered' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' : isApplied ? 'bg-blue-500/15 text-blue-700 border-blue-500/30' : ''}`}
                                  >
                                    {displayStatus}
                                  </Badge>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <p className="text-xs text-muted-foreground leading-relaxed max-w-[300px]">
                                {match.assessment}
                              </p>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

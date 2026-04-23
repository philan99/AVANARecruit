import { useState, useEffect, Fragment } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Target, Users, ChevronRight, ChevronDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";

interface MatchResult {
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
  createdAt: string;
}

interface JobInfo {
  id: number;
  title: string;
  company: string;
}

export default function AdminJobMatches() {
  const { id } = useParams<{ id: string }>();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [job, setJob] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleRow = (matchId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };
  const expandAll = () => setExpanded(new Set(matches.map(m => m.id)));
  const collapseAll = () => setExpanded(new Set());
  const allExpanded = matches.length > 0 && expanded.size === matches.length;

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchesRes, jobRes] = await Promise.all([
          fetch(`${basePath}/jobs/${id}/matches`),
          fetch(`${basePath}/jobs/${id}`),
        ]);
        if (matchesRes.ok) setMatches(await matchesRes.json());
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          setJob({ id: jobData.id, title: jobData.title, company: jobData.company });
        }
      } catch (err) {
        console.error("Failed to fetch matches", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [basePath, id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading matches...</div>;
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          Candidate Matches
        </h1>
        {job && (
          <p className="text-lg font-semibold text-foreground mt-1">
            Showing all matches for{" "}
            <Link href={`/jobs/${id}`} className="text-primary hover:underline">{job.title}</Link>
            <span className="text-sm font-normal text-muted-foreground ml-2">— {job.company}</span>
          </p>
        )}
      </div>

      <Card className="bg-card">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Match Results</CardTitle>
          <div className="flex items-center gap-2">
            {matches.length > 0 && (
              <>
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={expandAll} disabled={allExpanded}>
                  <ChevronsUpDown className="w-3.5 h-3.5 mr-1" /> Expand all
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={collapseAll} disabled={expanded.size === 0}>
                  <ChevronsDownUp className="w-3.5 h-3.5 mr-1" /> Collapse all
                </Button>
              </>
            )}
            <Badge variant="secondary" className="font-mono">{matches.length} Matches</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {matches.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>No matches found for this job yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="w-[250px]">Candidate</TableHead>
                  <TableHead className="text-center font-mono">Overall</TableHead>
                  <TableHead className="text-center font-mono hidden md:table-cell">Skills</TableHead>
                  <TableHead className="text-center font-mono hidden md:table-cell">Experience</TableHead>
                  <TableHead className="text-center font-mono hidden lg:table-cell">Education</TableHead>
                  <TableHead className="text-center font-mono hidden lg:table-cell">Location</TableHead>
                  <TableHead className="text-center font-mono hidden lg:table-cell">Verified</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches
                  .sort((a, b) => b.overallScore - a.overallScore)
                  .map((match) => {
                    const isOpen = expanded.has(match.id);
                    return (
                  <Fragment key={match.id}>
                  <TableRow className="cursor-pointer" onClick={() => toggleRow(match.id)}>
                    <TableCell className="w-[40px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); toggleRow(match.id); }}
                        aria-label={isOpen ? "Collapse row" : "Expand row"}
                      >
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Link href={`/candidates/${match.candidateId}`} onClick={(e) => e.stopPropagation()} className="block hover:text-primary transition-colors">
                        <div className="font-medium text-foreground">{match.candidateName}</div>
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
                    <TableCell>
                      <Badge
                        variant={match.status === 'shortlisted' ? 'default' : match.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {match.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow key={`${match.id}-detail`} className="bg-secondary/20 hover:bg-secondary/20">
                      <TableCell></TableCell>
                      <TableCell colSpan={8} className="py-4">
                        <div className="space-y-3">
                          {match.matchedSkills.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Matched Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {match.matchedSkills.map(skill => (
                                  <Badge key={skill} variant="outline" className="text-[10px] py-0 h-5 bg-background border-green-500/40 text-green-700 dark:text-green-400">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {match.assessment && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">AI Assessment</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{match.assessment}</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

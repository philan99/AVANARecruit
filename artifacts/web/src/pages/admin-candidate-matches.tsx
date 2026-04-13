import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Briefcase, Target } from "lucide-react";

interface MatchResult {
  id: number;
  jobId: number;
  candidateId: number;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  matchedSkills: string[];
  assessment: string;
  status: string;
  createdAt: string;
  jobTitle: string;
  jobCompany: string;
}

interface CandidateInfo {
  id: number;
  name: string;
  currentTitle: string;
}

export default function AdminCandidateMatches() {
  const { id } = useParams<{ id: string }>();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchesRes, candidateRes] = await Promise.all([
          fetch(`${basePath}/candidates/${id}/matches`),
          fetch(`${basePath}/candidates/${id}`),
        ]);
        if (matchesRes.ok) setMatches(await matchesRes.json());
        if (candidateRes.ok) {
          const data = await candidateRes.json();
          setCandidate({ id: data.id, name: data.name, currentTitle: data.currentTitle });
        }
      } catch (err) {
        console.error("Failed to fetch candidate matches", err);
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
          <Briefcase className="w-6 h-6 text-primary" />
          Job Matches
        </h1>
        {candidate && (
          <p className="text-lg font-semibold text-foreground mt-1">
            Showing all matches for{" "}
            <Link href={`/candidates/${id}`} className="text-primary hover:underline">
              {candidate.name}
            </Link>
            {candidate.currentTitle && <span className="text-sm font-normal text-muted-foreground ml-2">— {candidate.currentTitle}</span>}
          </p>
        )}
      </div>

      <Card className="bg-card">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Match Results</CardTitle>
          <Badge variant="secondary" className="font-mono">{matches.length} Matches</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {matches.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>No job matches found for this candidate yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[250px]">Job</TableHead>
                  <TableHead className="text-center font-mono">Overall</TableHead>
                  <TableHead className="text-center font-mono hidden md:table-cell">Skills</TableHead>
                  <TableHead className="text-center font-mono hidden md:table-cell">Experience</TableHead>
                  <TableHead className="text-center font-mono hidden lg:table-cell">Education</TableHead>
                  <TableHead className="text-center font-mono hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden xl:table-cell">Matched Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Assessment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <Link href={`/jobs/${match.jobId}`} className="block hover:text-primary transition-colors">
                        <div className="font-medium text-foreground">{match.jobTitle}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{match.jobCompany}</div>
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
                      <Badge
                        variant={match.status === 'shortlisted' ? 'default' : match.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {match.status}
                      </Badge>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

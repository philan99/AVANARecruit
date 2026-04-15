import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Star, Target } from "lucide-react";

interface MatchResult {
  id: number;
  jobId: number;
  candidateId: number;
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
  jobTitle: string;
  jobCompany: string;
}

export default function CandidateShortlisted() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const candidateId = localStorage.getItem("avanatalent_candidate_id");

  useEffect(() => {
    if (!candidateId) return;
    async function fetchMatches() {
      try {
        const res = await fetch(`${basePath}/candidates/${candidateId}/matches`);
        if (res.ok) {
          const data: MatchResult[] = await res.json();
          setMatches(data.filter(m => m.status === "shortlisted" || m.status === "hired"));
        }
      } catch (err) {
        console.error("Failed to fetch matches", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, [basePath, candidateId]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading shortlisted jobs...</div>;
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
          <Star className="w-6 h-6 text-primary" />
          Shortlisted Jobs
        </h1>
        <p className="text-muted-foreground mt-1">Jobs where companies have shown interest in your profile.</p>
      </div>

      <Card className="bg-card">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Shortlisted & Hired</CardTitle>
          <Badge variant="secondary" className="font-mono">{matches.length} Jobs</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {matches.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>You haven't been shortlisted for any jobs yet.</p>
              <p className="text-sm mt-2">Keep your profile up to date to improve your matches.</p>
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
                  <TableHead className="text-center font-mono hidden lg:table-cell">Verified</TableHead>
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
                      <Badge
                        variant={match.status === 'hired' ? 'default' : 'default'}
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

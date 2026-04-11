import { Link } from "wouter";
import { format } from "date-fns";
import { Users, Mail, Phone, MapPin, Briefcase, GraduationCap, ArrowLeft, Target, Calendar } from "lucide-react";
import { useGetCandidate, getGetCandidateQueryKey, useGetCandidateMatches, getGetCandidateMatchesQueryKey } from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CandidateDetail({ params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id);

  const { data: candidate, isLoading: candidateLoading } = useGetCandidate(candidateId, {
    query: { enabled: !!candidateId, queryKey: getGetCandidateQueryKey(candidateId) },
  });

  const { data: matches, isLoading: matchesLoading } = useGetCandidateMatches(candidateId, {
    query: { enabled: !!candidateId, queryKey: getGetCandidateMatchesQueryKey(candidateId) },
  });

  if (candidateLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading profile...</div>;
  }

  if (!candidate) {
    return <div className="p-8 text-center text-destructive font-mono">Candidate not found.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link href="/candidates" className="hover:text-primary flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Talent Pool
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{candidate.name}</h1>
            <Badge variant={candidate.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-wider">
              {candidate.status}
            </Badge>
          </div>
          <h2 className="text-xl text-primary font-medium mb-4">{candidate.currentTitle}</h2>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5" /> {candidate.email}</span>
            {candidate.phone && <span className="flex items-center"><Phone className="w-4 h-4 mr-1.5" /> {candidate.phone}</span>}
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {candidate.location}</span>
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> Added {format(new Date(candidate.createdAt), "MMM yyyy")}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-4xl font-mono font-bold text-primary">{candidate.experienceYears}</div>
           <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Years Exp.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {candidate.summary}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Skills Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" /> Education Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                {candidate.education}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card className="bg-card border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Match History</span>
                <Badge variant="outline" className="font-mono bg-background">
                  {matches?.length || 0} TOTAL
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {matchesLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading history...</div>
              ) : matches?.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <Target className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  No job matches recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {matches?.map((match) => (
                    <Link key={match.id} href={`/jobs/${match.jobId}`}>
                      <div className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <div className="pr-4">
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {match.jobTitle}
                            </h4>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Briefcase className="w-3 h-3 mr-1" /> {match.jobCompany}
                            </p>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            <span className="font-mono font-bold text-lg text-primary">
                              {Math.round(match.overallScore)}%
                            </span>
                            <Badge variant={match.status === 'shortlisted' ? 'default' : match.status === 'rejected' ? 'destructive' : 'outline'} className="text-[9px] uppercase mt-1 h-4 px-1">
                              {match.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

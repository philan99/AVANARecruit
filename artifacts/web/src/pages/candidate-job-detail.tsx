import { Link } from "wouter";
import { format } from "date-fns";
import { Briefcase, Building, Calendar, MapPin, ArrowLeft, Send, Heart } from "lucide-react";
import { useGetJob, getGetJobQueryKey, useGetCandidateMatches, getGetCandidateMatchesQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CandidateJobDetail({ params }: { params: { id: string } }) {
  const jobId = parseInt(params.id);
  const { candidateProfileId } = useRole();

  const { data: job, isLoading: jobLoading } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) },
  });

  const { data: matches } = useGetCandidateMatches(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateMatchesQueryKey(candidateProfileId!) },
  });

  const myMatch = matches?.find((m) => m.jobId === jobId);

  if (jobLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading job details...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-destructive font-mono">Job not found.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link href="/my-matches" className="hover:text-primary flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Matches
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
            <Badge variant={job.status === "open" ? "default" : "secondary"} className="uppercase text-[10px] tracking-wider">
              {job.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center"><Building className="w-4 h-4 mr-1.5" /> {job.company}</span>
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {job.location}</span>
            <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {job.experienceLevel}</span>
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center font-mono bg-secondary px-2 py-0.5 rounded">
                £{(job.salaryMin || 0).toLocaleString()} - £{(job.salaryMax || 0).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="lg" className="font-mono tracking-tight">
            <Heart className="w-4 h-4 mr-2" /> Add to Favourites
          </Button>
          <Button size="lg" className="font-mono tracking-tight">
            <Send className="w-4 h-4 mr-2" /> APPLY
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.requirements}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          {myMatch && (
            <Card className="bg-card border-primary/20">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <CardTitle className="text-lg">Your Match Score</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-mono font-bold text-3xl text-primary">{Math.round(myMatch.overallScore)}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-mono font-bold text-foreground">{Math.round(myMatch.skillScore)}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Skills</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-mono font-bold text-foreground">{Math.round(myMatch.experienceScore)}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Experience</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-mono font-bold text-foreground">{Math.round(myMatch.educationScore)}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Education</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-mono font-bold text-foreground">{Math.round(myMatch.locationScore)}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Location</div>
                  </div>
                </div>
                {myMatch.assessment && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground leading-relaxed">{myMatch.assessment}</p>
                  </div>
                )}
                {myMatch.matchedSkills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Matched Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {myMatch.matchedSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px] py-0 h-5 bg-background">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {myMatch.missingSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Skills to Develop</p>
                    <div className="flex flex-wrap gap-1">
                      {myMatch.missingSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px] py-0 h-5 bg-destructive/5 text-destructive border-destructive/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-2 py-1 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

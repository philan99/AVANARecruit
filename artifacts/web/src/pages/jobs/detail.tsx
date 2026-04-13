import { Link } from "wouter";
import { format } from "date-fns";
import { Briefcase, Building, Calendar, MapPin, Target, ArrowLeft, Loader2, Network, Pencil, Send } from "lucide-react";
import { useGetJob, getGetJobQueryKey, useGetJobMatches, getGetJobMatchesQueryKey, useRunJobMatching } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const JOB_TYPE_LABELS: Record<string, string> = {
  permanent_full_time: "Permanent (Full Time)",
  contract: "Contract",
  fixed_term_contract: "Fixed Term Contract",
  part_time: "Part-time",
  temporary: "Temporary",
};

const INDUSTRY_LABELS: Record<string, string> = {
  accounting_finance: "Accounting & Finance",
  agriculture: "Agriculture",
  automotive: "Automotive",
  banking: "Banking",
  construction: "Construction",
  consulting: "Consulting",
  creative_design: "Creative & Design",
  education: "Education",
  energy_utilities: "Energy & Utilities",
  engineering: "Engineering",
  healthcare: "Healthcare",
  hospitality_tourism: "Hospitality & Tourism",
  human_resources: "Human Resources",
  insurance: "Insurance",
  legal: "Legal",
  logistics_supply_chain: "Logistics & Supply Chain",
  manufacturing: "Manufacturing",
  marketing_advertising: "Marketing & Advertising",
  media_entertainment: "Media & Entertainment",
  nonprofit: "Non-profit",
  pharmaceutical: "Pharmaceutical",
  property_real_estate: "Property & Real Estate",
  public_sector: "Public Sector",
  retail: "Retail",
  sales: "Sales",
  science_research: "Science & Research",
  technology: "Technology",
  telecommunications: "Telecommunications",
  transport: "Transport",
  other: "Other",
};

export default function JobDetail({ params }: { params: { id: string } }) {
  const jobId = parseInt(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading: jobLoading } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) },
  });

  const { data: matches, isLoading: matchesLoading } = useGetJobMatches(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobMatchesQueryKey(jobId) },
  });

  const runMatching = useRunJobMatching();

  const handleRunMatching = () => {
    runMatching.mutate(
      { id: jobId },
      {
        onSuccess: () => {
          toast({ title: "Matching Complete", description: "AI analysis finished successfully." });
          queryClient.invalidateQueries({ queryKey: getGetJobMatchesQueryKey(jobId) });
          queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
        },
        onError: () => {
          toast({ title: "Matching Failed", description: "There was an error running the AI analysis.", variant: "destructive" });
        },
      }
    );
  };

  if (jobLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading job data...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-destructive font-mono">Job not found.</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <button onClick={() => window.history.back()} className="hover:text-primary flex items-center cursor-pointer bg-transparent border-none p-0">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
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
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> Posted {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/jobs/${jobId}/edit`}>
            <Button variant="outline" size="lg">
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button onClick={handleRunMatching} disabled={runMatching.isPending} size="lg" className="font-mono tracking-tight">
            {runMatching.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> ANALYZING...</>
            ) : (
              <><Network className="w-4 h-4 mr-2" /> RUN AI MATCHING</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
        <div className="lg:col-span-2">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{job.location}</span>
                </div>
                {job.jobType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Type</span>
                    <span className="font-medium">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
                  </div>
                )}
                {job.workplace && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Workplace</span>
                    <span className="font-medium capitalize">{job.workplace}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience Level</span>
                  <span className="font-medium capitalize">{job.experienceLevel}</span>
                </div>
                {job.industry && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{INDUSTRY_LABELS[job.industry] || job.industry}</span>
                  </div>
                )}
                {job.educationLevel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Education Level</span>
                    <span className="font-medium">{job.educationLevel}</span>
                  </div>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary Range</span>
                    <span className="font-mono font-medium">£{(job.salaryMin || 0).toLocaleString()} - £{(job.salaryMax || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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

        <div>
          <Card className="bg-card border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Top Matches</span>
                <Badge variant="outline" className="font-mono bg-background">
                  {matches?.length || 0} TOTAL
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {matchesLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading matches...</div>
              ) : matches?.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <Target className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  No matches yet. Run AI matching to find candidates.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {matches?.map((match: any) => (
                    <Link key={match.id} href={`/candidates/${match.candidateId}`}>
                      <div className={`p-4 hover:bg-secondary/50 transition-colors cursor-pointer group ${match.applied ? "bg-blue-500/5 border-l-2 border-l-blue-500" : ""}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {match.candidateName}
                              </h4>
                              {match.applied && (
                                <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-600 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                                  <Send className="w-3 h-3" />
                                  Applied
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{match.candidateTitle}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-bold text-lg text-primary">
                              {Math.round(match.overallScore)}%
                            </span>
                            <Badge variant="outline" className="text-[9px] uppercase mt-1 h-4 px-1">{match.status}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {match.assessment}
                        </p>
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

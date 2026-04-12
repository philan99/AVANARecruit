import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Briefcase, Building, Calendar, MapPin, ArrowLeft, Send, Heart, Loader2, Globe } from "lucide-react";
import { useGetJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CandidateJobDetail({ params }: { params: { id: string } }) {
  const jobId = parseInt(params.id);
  const { candidateProfileId } = useRole();
  const [isFavourite, setIsFavourite] = useState(false);
  const [myMatch, setMyMatch] = useState<any>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState<string | null>(null);

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const fetchFavouriteStatus = useCallback(async () => {
    if (!candidateProfileId) return;
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/favourites`);
      if (res.ok) {
        const data = await res.json();
        setIsFavourite(data.some((f: any) => f.jobId === jobId));
      }
    } catch {}
  }, [candidateProfileId, jobId, apiBase]);

  useEffect(() => {
    fetchFavouriteStatus();
  }, [fetchFavouriteStatus]);

  const runAutoMatch = useCallback(async () => {
    if (!candidateProfileId || !jobId) return;
    setMatchLoading(true);
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/match-job/${jobId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setMyMatch(data);
      }
    } catch {} finally {
      setMatchLoading(false);
    }
  }, [candidateProfileId, jobId, apiBase]);

  useEffect(() => {
    runAutoMatch();
  }, [runAutoMatch]);

  async function toggleFavourite() {
    if (!candidateProfileId) return;
    if (isFavourite) {
      setIsFavourite(false);
      await fetch(`${apiBase}/candidates/${candidateProfileId}/favourites/${jobId}`, { method: "DELETE" });
    } else {
      setIsFavourite(true);
      await fetch(`${apiBase}/candidates/${candidateProfileId}/favourites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
    }
  }

  const { data: job, isLoading: jobLoading } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) },
  });

  useEffect(() => {
    if (!job?.companyProfileId) return;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/company-profile?companyId=${job.companyProfileId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.website) setCompanyWebsite(data.website);
        }
      } catch {}
    })();
  }, [job?.companyProfileId, apiBase]);

  if (jobLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading job details...</div>;
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
          <Button
            variant={isFavourite ? "default" : "outline"}
            size="lg"
            className="font-mono tracking-tight"
            onClick={toggleFavourite}
          >
            <Heart className={`w-4 h-4 mr-2 ${isFavourite ? "fill-white" : ""}`} />
            {isFavourite ? "Favourited" : "Add to Favourites"}
          </Button>
          <Button size="lg" className="font-mono tracking-tight">
            <Send className="w-4 h-4 mr-2" /> APPLY
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
                    <span className="font-medium capitalize">{({ permanent_full_time: "Permanent (Full Time)", contract: "Contract", fixed_term_contract: "Fixed Term Contract", part_time: "Part-time", temporary: "Temporary" } as Record<string, string>)[job.jobType] || job.jobType}</span>
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
                    <span className="font-medium capitalize">{({ accounting_finance: "Accounting & Finance", agriculture: "Agriculture", automotive: "Automotive", banking: "Banking", construction: "Construction", consulting: "Consulting", creative_design: "Creative & Design", education: "Education", energy_utilities: "Energy & Utilities", engineering: "Engineering", healthcare: "Healthcare", hospitality_tourism: "Hospitality & Tourism", human_resources: "Human Resources", insurance: "Insurance", legal: "Legal", logistics_supply_chain: "Logistics & Supply Chain", manufacturing: "Manufacturing", marketing_advertising: "Marketing & Advertising", media_entertainment: "Media & Entertainment", nonprofit: "Non-profit", pharmaceutical: "Pharmaceutical", property_real_estate: "Property & Real Estate", public_sector: "Public Sector", retail: "Retail", sales: "Sales", science_research: "Science & Research", technology: "Technology", telecommunications: "Telecommunications", transport: "Transport", other: "Other" } as Record<string, string>)[job.industry] || job.industry}</span>
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
                {companyWebsite && (
                  <div className="flex items-center text-muted-foreground">
                    <Globe className="w-4 h-4 mr-2 shrink-0" />
                    <a
                      href={companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {companyWebsite.replace(/^https?:\/\//, "")}
                    </a>
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
              <CardTitle className="text-lg">AI Match Score</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {matchLoading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground">Analysing your profile...</p>
                </div>
              ) : myMatch ? (
                <>
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
                  {myMatch.matchedSkills?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Matched Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {myMatch.matchedSkills.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-[10px] py-0 h-5 bg-background">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {myMatch.missingSkills?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Skills to Develop</p>
                      <div className="flex flex-wrap gap-1">
                        {myMatch.missingSkills.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-[10px] py-0 h-5 bg-destructive/5 text-destructive border-destructive/20">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">Unable to generate match score</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

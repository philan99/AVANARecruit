import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Briefcase, Building, Calendar, MapPin, ArrowLeft, Send, Heart, Loader2, Globe, CheckCircle2, Sparkles, Quote } from "lucide-react";
import { useGetJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CandidateJobDetail({ params }: { params: { id: string } }) {
  const jobId = parseInt(params.id);
  const { candidateProfileId } = useRole();
  const { toast } = useToast();
  const [isFavourite, setIsFavourite] = useState(false);
  const [myMatch, setMyMatch] = useState<any>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [confirmApplyOpen, setConfirmApplyOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [candidateName, setCandidateName] = useState("");

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

  useEffect(() => {
    if (!candidateProfileId) return;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/candidates/${candidateProfileId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.name) setCandidateName(data.name);
        }
      } catch {}
    })();
  }, [candidateProfileId, apiBase]);

  const openApplyDialog = () => {
    if (!job || !myMatch) return;
    const name = candidateName || "Candidate";
    setEmailSubject(`Application for ${job.title} - ${name}`);
    setEmailBody(
`Dear ${job.company},

I am writing to express my strong interest in the ${job.title} position. Having reviewed the role requirements, I believe my skills and experience make me an excellent fit for this opportunity.

Based on my profile analysis, I have a ${Math.round(myMatch.overallScore)}% match score for this role${myMatch.matchedSkills?.length > 0 ? `, with matched skills including ${myMatch.matchedSkills.slice(0, 5).join(", ")}` : ""}.

I would welcome the opportunity to discuss how my background and qualifications align with your team's needs. I am available for an interview at your earliest convenience.

Thank you for considering my application. I look forward to hearing from you.

Kind regards,
${name}`
    );
    setApplyDialogOpen(true);
  };

  const handleSendApplication = async () => {
    if (!myMatch || !candidateProfileId) return;
    setSendingEmail(true);
    try {
      const res = await fetch(`${apiBase}/matches/${myMatch.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          candidateId: candidateProfileId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send application");
      }
      toast({ title: "Application Sent", description: `Your application for ${job?.title} has been sent to ${job?.company}.` });
      setMyMatch((prev: any) => prev ? { ...prev, applied: true } : prev);
      setApplyDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send application.", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

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
          {myMatch?.applied ? (
            <Button
              size="lg"
              variant="outline"
              className="font-mono tracking-tight cursor-default border-green-500/50 text-green-600"
              disabled
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Applied
            </Button>
          ) : myMatch && Math.round(myMatch.overallScore) > 75 ? (
            <Button
              size="lg"
              variant="default"
              className="font-mono tracking-tight cursor-pointer"
              onClick={openApplyDialog}
            >
              <Send className="w-4 h-4 mr-2" /> APPLY
            </Button>
          ) : myMatch && Math.round(myMatch.overallScore) >= 50 ? (
            <Button
              size="lg"
              variant="outline"
              className="font-mono tracking-tight cursor-pointer"
              onClick={() => setConfirmApplyOpen(true)}
            >
              <Send className="w-4 h-4 mr-2" /> APPLY
            </Button>
          ) : (
            <span
              title={!myMatch ? "Your match score is being calculated. Please wait a moment." : `Your match score is ${Math.round(myMatch.overallScore)}%. A minimum of 50% is required to apply.`}
            >
              <Button
                size="lg"
                variant="outline"
                className="font-mono tracking-tight opacity-50 pointer-events-none"
                disabled
              >
                <Send className="w-4 h-4 mr-2" /> APPLY
              </Button>
            </span>
          )}
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

          {(job.idealCandidateTraits?.length || job.idealCandidateNote) && (
            <Card className="bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-primary">
                    What {job.company} is looking for
                  </span>
                </div>
                <CardTitle className="text-lg leading-snug">
                  The kind of person who'd thrive in this role
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.idealCandidateTraits && job.idealCandidateTraits.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2">
                      Working style
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.idealCandidateTraits.map((trait) => (
                        <span
                          key={trait}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {job.idealCandidateNote && (
                  <div className="rounded-lg p-4 relative bg-muted/40 border border-border">
                    <Quote className="absolute top-3 left-3 w-4 h-4 text-primary opacity-40" />
                    <p className="text-sm leading-relaxed text-foreground/80 pl-6 italic">
                      "{job.idealCandidateNote}"
                    </p>
                    <div className="text-[10px] text-muted-foreground mt-2 pl-6">
                      — from the hiring team at {job.company}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
                    {[
                      { label: "Experience", v: myMatch.experienceScore },
                      { label: "Skills", v: myMatch.skillScore },
                      { label: "Preferences", v: myMatch.preferenceScore ?? 0 },
                      { label: "Verified", v: myMatch.verificationScore ?? 0 },
                      { label: "Location", v: myMatch.locationScore },
                      { label: "Education", v: myMatch.educationScore },
                    ].map(t => {
                      const v = Math.round(t.v);
                      const cls =
                        v >= 75 ? "bg-green-500/10 border-green-500/40 text-green-700 dark:text-green-400" :
                        v >= 50 ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400" :
                        "bg-gray-400/10 border-gray-400/40 text-gray-600 dark:text-gray-400";
                      return (
                        <div key={t.label} className={`rounded-lg p-3 text-center border ${cls}`}>
                          <div className="text-sm font-mono font-bold">{v}%</div>
                          <div className="text-[10px] uppercase tracking-wider mt-0.5 opacity-80">{t.label}</div>
                        </div>
                      );
                    })}
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
                  <Button
                    className="w-full mt-5 font-mono tracking-tight bg-[#4CAF50] hover:bg-[#43a047] text-white cursor-pointer"
                    onClick={() => {
                      const missingList = myMatch.missingSkills?.length > 0 ? myMatch.missingSkills.join(", ") : "none identified";
                      const matchedList = myMatch.matchedSkills?.length > 0 ? myMatch.matchedSkills.join(", ") : "none";
                      const msg = `I'm looking at the "${job.title}" role at ${job.company}. My overall match score is ${Math.round(myMatch.overallScore)}% (Skills: ${Math.round(myMatch.skillScore)}%, Experience: ${Math.round(myMatch.experienceScore)}%, Education: ${Math.round(myMatch.educationScore)}%, Location: ${Math.round(myMatch.locationScore)}%, Verification: ${Math.round(myMatch.verificationScore ?? 0)}%). My matched skills are: ${matchedList}. Skills I'm missing: ${missingList}. How can I improve my match score for this job?`;
                      window.dispatchEvent(new CustomEvent("chatbot:send", { detail: { message: msg } }));
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Improve my Match Score
                  </Button>
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">Unable to generate match score</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={confirmApplyOpen} onOpenChange={setConfirmApplyOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Confirm Application</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Your match score for this role is <span className="font-bold text-foreground">{myMatch ? Math.round(myMatch.overallScore) : 0}%</span>, which is below the recommended threshold of 75%.
            </p>
            <p className="text-sm text-muted-foreground">
              You can still apply, but you may want to consider improving your profile or skills to strengthen your application.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmApplyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { setConfirmApplyOpen(false); openApplyDialog(); }}>
              Continue to Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Apply for {job?.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Send your application to <span className="font-medium">{job?.company}</span>
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apply-subject">Subject</Label>
              <Input
                id="apply-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apply-body">Message</Label>
              <Textarea
                id="apply-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your application..."
                rows={14}
                className="resize-y"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setApplyDialogOpen(false)}
              disabled={sendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendApplication}
              disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

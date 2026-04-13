import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useListJobs, useUpdateMatchStatus } from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Network, Check, X, Target, Briefcase, ChevronDown, ChevronRight, ShieldCheck, RotateCcw, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompanyProfile } from "@/hooks/use-company-profile";

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
  matchedSkills: string[];
  assessment: string;
  status: string;
  applied: boolean;
  createdAt: string;
}

interface JobGroup {
  jobId: number;
  jobTitle: string;
  matches: MatchItem[];
}

type ScoreFilter = "all" | "high" | "mid" | "low";

interface VerificationSummary {
  total: number;
  verified: number;
  pending: number;
  declined: number;
}

export default function MatchesList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [allMatches, setAllMatches] = useState<JobGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedJobs, setCollapsedJobs] = useState<Set<number>>(new Set());
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [verificationMap, setVerificationMap] = useState<Record<number, VerificationSummary>>({});
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMatch, setContactMatch] = useState<{ id: number; candidateName: string; jobTitle: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const { data: profile } = useCompanyProfile();
  const companyProfileId = profile?.id;

  const { data: jobs } = useListJobs(companyProfileId ? { companyProfileId } : {}, {
    query: { enabled: !!companyProfileId }
  });

  useEffect(() => {
    if (!jobs || jobs.length === 0) return;

    async function fetchAllMatches() {
      setLoading(true);
      try {
        const groups: JobGroup[] = [];
        const results = await Promise.all(
          jobs!.map(async (job) => {
            const res = await fetch(`${basePath}/jobs/${job.id}/matches`);
            if (res.ok) {
              const matches: MatchItem[] = await res.json();
              return { jobId: job.id, jobTitle: job.title, matches };
            }
            return { jobId: job.id, jobTitle: job.title, matches: [] };
          })
        );
        for (const r of results) {
          if (r.matches.length > 0) {
            r.matches.sort((a, b) => b.overallScore - a.overallScore);
            groups.push(r);
          }
        }
        setAllMatches(groups);

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
        console.error("Failed to fetch matches", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllMatches();
  }, [jobs, basePath]);

  const totalMatches = useMemo(() => allMatches.reduce((sum, g) => sum + g.matches.length, 0), [allMatches]);

  const filteredGroups = useMemo(() => {
    if (scoreFilter === "all") return allMatches;
    return allMatches.map(g => ({
      ...g,
      matches: g.matches.filter(m => {
        const score = Math.round(m.overallScore);
        if (scoreFilter === "high") return score > 75;
        if (scoreFilter === "mid") return score >= 50 && score <= 75;
        if (scoreFilter === "low") return score < 50;
        return true;
      })
    })).filter(g => g.matches.length > 0);
  }, [allMatches, scoreFilter]);

  const filteredTotal = useMemo(() => filteredGroups.reduce((sum, g) => sum + g.matches.length, 0), [filteredGroups]);

  const updateStatus = useUpdateMatchStatus();

  const handleUpdateStatus = (matchId: number, jobId: number, status: "shortlisted" | "rejected" | "hired" | "pending") => {
    updateStatus.mutate(
      { id: matchId, data: { status } },
      {
        onSuccess: () => {
          toast({ title: "Status Updated", description: `Match marked as ${status}.` });
          setAllMatches(prev => prev.map(g => {
            if (g.jobId === jobId) {
              return { ...g, matches: g.matches.map(m => m.id === matchId ? { ...m, status } : m) };
            }
            return g;
          }));
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
      }
    );
  };

  const openContactDialog = (match: MatchItem, jobTitle: string) => {
    const companyName = profile?.name || "Our Company";
    setContactMatch({ id: match.id, candidateName: match.candidateName, jobTitle });
    setEmailSubject(`Regarding the ${jobTitle} opportunity at ${companyName}`);
    setEmailBody(
`Dear ${match.candidateName},

I hope this message finds you well. We have reviewed your profile and believe you would be an excellent fit for the ${jobTitle} role at ${companyName}.

We would love the opportunity to discuss this position with you further and learn more about your experience and career goals.

Would you be available for a brief conversation at your earliest convenience? Please feel free to suggest a time that works best for you.

We look forward to hearing from you.

Kind regards,
${companyName}`
    );
    setContactDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!contactMatch || !companyProfileId) return;
    setSendingEmail(true);
    try {
      const res = await fetch(`${basePath}/matches/${contactMatch.id}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          companyProfileId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email");
      }
      toast({ title: "Email Sent", description: `Your message has been sent to ${contactMatch.candidateName}.` });
      setContactDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send email.", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Network className="mr-3 text-primary" /> Job Role to Candidate Matches
        </h1>
        <p className="text-muted-foreground mt-1">Review AI-generated candidate fits across all jobs.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-mono">Loading all matches...</div>
      ) : allMatches.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>No matches found yet.</p>
              <p className="text-sm mt-2">Go to a Job Detail page and run the AI matching engine.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="font-mono text-sm px-3 py-1">{totalMatches} Total Matches</Badge>
            <Badge variant="outline" className="font-mono text-sm px-3 py-1">{allMatches.length} Jobs with Matches</Badge>
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
                      <Link href={`/jobs/${group.jobId}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                        {group.jobTitle}
                      </Link>
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
                          <TableHead className="hidden xl:table-cell">Matched Skills</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden xl:table-cell">Assessment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.matches.map((match) => (
                          <TableRow key={match.id} className={match.applied ? "bg-blue-500/5 border-l-2 border-l-blue-500" : ""}>
                            <TableCell>
                              <Link href={`/candidates/${match.candidateId}`} className="block hover:text-primary transition-colors">
                                <div className="flex items-center gap-1.5">
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
                            <TableCell className="text-right">
                              {match.status === 'pending' && (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => handleUpdateStatus(match.id, group.jobId, "rejected")}
                                    disabled={updateStatus.isPending}
                                    title="Reject Candidate"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-full text-primary hover:bg-primary hover:text-primary-foreground border-primary/50"
                                    onClick={() => handleUpdateStatus(match.id, group.jobId, "shortlisted")}
                                    disabled={updateStatus.isPending}
                                    title="Shortlist Candidate"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                              {match.status === 'shortlisted' && (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    onClick={() => handleUpdateStatus(match.id, group.jobId, "pending")}
                                    disabled={updateStatus.isPending}
                                    title="Back to Pending"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-full text-primary hover:bg-primary hover:text-primary-foreground border-primary/50"
                                    onClick={() => openContactDialog(match, group.jobTitle)}
                                    title="Contact Candidate"
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="icon"
                                    className="w-8 h-8 rounded-full"
                                    onClick={() => handleUpdateStatus(match.id, group.jobId, "hired")}
                                    disabled={updateStatus.isPending}
                                    title="Mark as Hired"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
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
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Contact {contactMatch?.candidateName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Send an email regarding the <span className="font-medium">{contactMatch?.jobTitle}</span> position
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your message..."
                rows={14}
                className="resize-y"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setContactDialogOpen(false)}
              disabled={sendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
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
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

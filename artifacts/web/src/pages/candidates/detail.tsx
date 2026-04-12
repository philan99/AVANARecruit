import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Users, Mail, Phone, MapPin, Briefcase, GraduationCap, ArrowLeft,
  Target, Calendar, FileText, Download, Eye, Clock, CalendarDays,
  Monitor, Building, Award, Send, Linkedin, Github, Twitter, Globe,
} from "lucide-react";
import { useGetCandidate, getGetCandidateQueryKey } from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusStyles: Record<string, string> = {
  active: "bg-green-500 text-white",
  passive: "bg-orange-400 text-white",
  not_looking: "bg-gray-400 text-white",
};

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

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export default function CandidateDetail({ params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id);

  const { data: candidate, isLoading: candidateLoading } = useGetCandidate(candidateId, {
    query: { enabled: !!candidateId, queryKey: getGetCandidateQueryKey(candidateId) },
  });

  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const companyId = localStorage.getItem("avanatalent_company_id");
        const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
        const url = companyId
          ? `${basePath}/candidates/${candidateId}/matches?companyId=${companyId}`
          : `${basePath}/candidates/${candidateId}/matches`;
        const res = await fetch(url);
        if (res.ok) setMatches(await res.json());
      } catch (err) {
        console.error("Failed to fetch matches", err);
      } finally {
        setMatchesLoading(false);
      }
    }
    if (candidateId) fetchMatches();
  }, [candidateId]);

  if (candidateLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading candidate...</div>;
  }

  if (!candidate) {
    return <div className="p-8 text-center text-muted-foreground">Candidate not found.</div>;
  }

  const statusLabel = candidate.status === "not_looking" ? "Not Looking" : candidate.status;
  const c = candidate as any;

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

      <Card className="bg-card">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start gap-5">
            {c.profileImage ? (
              <img
                src={`${import.meta.env.BASE_URL}api/storage${c.profileImage}`.replace(/\/\//g, "/")}
                alt={candidate.name}
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{candidate.name}</h1>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${statusStyles[candidate.status] || "bg-gray-100 text-gray-600"}`}>
                  {statusLabel}
                </span>
              </div>
              {candidate.currentTitle && (
                <p className="text-sm text-muted-foreground mt-1">{candidate.currentTitle}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{candidate.location}</span>
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{candidate.email}</span>
                {candidate.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{candidate.phone}</span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Registered {new Date(candidate.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <Button className="gap-2" disabled>
                <Send className="w-4 h-4" />
                Contact Candidate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{candidate.matchCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Job Matches</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{candidate.experienceYears}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Years Experience</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <Briefcase className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{candidate.skills.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Skills</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <GraduationCap className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold truncate px-2">{candidate.education || "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Education</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {candidate.summary && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{candidate.summary}</p>
              </CardContent>
            </Card>
          )}

          {c.experience && c.experience.length > 0 && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Experience History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {c.experience.map((exp: any, i: number) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-4">
                      <p className="text-sm font-medium text-foreground">{exp.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">{exp.company}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed.</p>
              )}
            </CardContent>
          </Card>

          {c.qualifications && c.qualifications.length > 0 && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {c.qualifications.map((q: string) => (
                    <Badge key={q} variant="secondary" className="text-xs px-2.5 py-1">
                      {q}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Match History
                </span>
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

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Contact Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow icon={Mail} label="Email" value={candidate.email} />
              <DetailRow icon={Phone} label="Phone" value={candidate.phone || "Not provided"} />
              <DetailRow icon={MapPin} label="Location" value={candidate.location || "Not specified"} />
            </CardContent>
          </Card>

          {(c.linkedinUrl || c.githubUrl || c.twitterUrl || c.portfolioUrl) && (
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {c.linkedinUrl && (
                  <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <div className="p-1.5 rounded-md bg-blue-500/10"><Linkedin className="w-3.5 h-3.5 text-blue-500" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">LinkedIn</p>
                      <p className="text-xs text-foreground truncate">{c.linkedinUrl}</p>
                    </div>
                  </a>
                )}
                {c.githubUrl && (
                  <a href={c.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <div className="p-1.5 rounded-md bg-gray-500/10"><Github className="w-3.5 h-3.5 text-gray-400" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">GitHub</p>
                      <p className="text-xs text-foreground truncate">{c.githubUrl}</p>
                    </div>
                  </a>
                )}
                {c.twitterUrl && (
                  <a href={c.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <div className="p-1.5 rounded-md bg-sky-500/10"><Twitter className="w-3.5 h-3.5 text-sky-500" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">X / Twitter</p>
                      <p className="text-xs text-foreground truncate">{c.twitterUrl}</p>
                    </div>
                  </a>
                )}
                {c.portfolioUrl && (
                  <a href={c.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <div className="p-1.5 rounded-md bg-green-500/10"><Globe className="w-3.5 h-3.5 text-green-500" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Portfolio / Website</p>
                      <p className="text-xs text-foreground truncate">{c.portfolioUrl}</p>
                    </div>
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Education</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow icon={GraduationCap} label="Level" value={candidate.education || "Not specified"} />
              {c.educationDetails && (
                <div className="mt-2 pt-2 border-t border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Details</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{c.educationDetails}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Job Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow
                icon={Briefcase}
                label="Preferred Job Types"
                value={
                  (c.preferredJobTypes || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {c.preferredJobTypes.map((t: string) => (
                        <Badge key={t} variant="outline" className="text-[11px] px-2 py-0.5">
                          {JOB_TYPE_LABELS[t] || t}
                        </Badge>
                      ))}
                    </div>
                  ) : "Not specified"
                }
              />
              <DetailRow
                icon={Monitor}
                label="Preferred Workplaces"
                value={
                  (c.preferredWorkplaces || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {c.preferredWorkplaces.map((w: string) => (
                        <Badge key={w} variant="outline" className="text-[11px] px-2 py-0.5 capitalize">
                          {w}
                        </Badge>
                      ))}
                    </div>
                  ) : "Not specified"
                }
              />
              <DetailRow
                icon={Building}
                label="Preferred Industries"
                value={
                  (c.preferredIndustries || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {c.preferredIndustries.map((i: string) => (
                        <Badge key={i} variant="outline" className="text-[11px] px-2 py-0.5">
                          {INDUSTRY_LABELS[i] || i}
                        </Badge>
                      ))}
                    </div>
                  ) : "Not specified"
                }
              />
            </CardContent>
          </Card>

          {c.cvFileName && (
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">CV / Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.cvFileName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.cvFile && c.cvFileName?.toLowerCase().endsWith(".pdf") && (
                      <a
                        href={`${import.meta.env.BASE_URL}api/storage${c.cvFile}`.replace(/\/\//g, "/")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="text-xs gap-1 h-7">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </a>
                    )}
                    {c.cvFile && (
                      <a
                        href={`${import.meta.env.BASE_URL}api/storage${c.cvFile}`.replace(/\/\//g, "/")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm" className="text-xs gap-1 h-7">
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="font-medium">{new Date(candidate.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{new Date(candidate.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

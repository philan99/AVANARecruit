import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MapPin,
  Building,
  ArrowLeft,
  Clock,
  Users,
  PoundSterling,
  Monitor,
  GraduationCap,
  Factory,
  CalendarDays,
  FileText,
} from "lucide-react";

interface JobDetail {
  id: number;
  title: string;
  company: string;
  companyProfileId: number | null;
  location: string;
  description: string;
  requirements: string;
  skills: string[];
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  jobType: string | null;
  industry: string | null;
  educationLevel: string | null;
  workplace: string | null;
  status: string;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
}

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

export default function AdminJobDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`${basePath}/jobs/${id}`);
        if (res.ok) setJob(await res.json());
      } catch (err) {
        console.error("Failed to fetch job", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [basePath, id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading job...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-muted-foreground">Job not found.</div>;
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

      <Card className="bg-card">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                <Badge variant={job.status === "open" ? "default" : "secondary"} className="text-xs uppercase">
                  {job.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Building className="w-4 h-4" />{job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.matchCount} {job.matchCount === 1 ? "Match" : "Matches"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{job.matchCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Matches</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <Briefcase className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{job.skills.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Skills Required</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <PoundSterling className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">
              {job.salaryMin && job.salaryMax
                ? `£${(job.salaryMin / 1000).toFixed(0)}k – £${(job.salaryMax / 1000).toFixed(0)}k`
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Salary Range</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 text-center">
            <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold capitalize">{job.experienceLevel}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Experience</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-sm text-muted-foreground leading-relaxed prose prose-sm prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_p]:mb-3 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_table]:w-full [&_th]:text-left [&_th]:p-2 [&_td]:p-2 [&_tr]:border-b [&_tr]:border-border/40"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow
                icon={Building}
                label="Company"
                value={
                  job.companyProfileId ? (
                    <button
                      className="text-primary hover:underline text-sm font-medium"
                      onClick={() => navigate(`/companies/${job.companyProfileId}`)}
                    >
                      {job.company}
                    </button>
                  ) : (
                    job.company
                  )
                }
              />
              <DetailRow
                icon={Briefcase}
                label="Job Type"
                value={job.jobType ? (JOB_TYPE_LABELS[job.jobType] || job.jobType) : "Not specified"}
              />
              <DetailRow
                icon={Monitor}
                label="Workplace"
                value={job.workplace ? job.workplace.charAt(0).toUpperCase() + job.workplace.slice(1) : "Not specified"}
              />
              <DetailRow
                icon={Factory}
                label="Industry"
                value={job.industry ? (INDUSTRY_LABELS[job.industry] || job.industry) : "Not specified"}
              />
              <DetailRow
                icon={GraduationCap}
                label="Education Level"
                value={job.educationLevel || "Not specified"}
              />
              <DetailRow
                icon={Clock}
                label="Experience Level"
                value={job.experienceLevel ? job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1) : "Not specified"}
              />
              <DetailRow
                icon={PoundSterling}
                label="Salary Range"
                value={
                  job.salaryMin && job.salaryMax
                    ? `£${job.salaryMin.toLocaleString()} – £${job.salaryMax.toLocaleString()}`
                    : "Not specified"
                }
              />
              <DetailRow
                icon={MapPin}
                label="Location"
                value={job.location || "Not specified"}
              />
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs px-2.5 py-1">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills specified.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{new Date(job.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{new Date(job.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

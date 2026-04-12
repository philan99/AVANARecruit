import { useState, useEffect } from "react";
import { useParams } from "wouter";
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

export default function AdminJobDetail() {
  const { id } = useParams<{ id: string }>();
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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Button>

      <Card className="bg-card">
        <CardContent className="pt-6">
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Experience Level</p>
              <p className="text-sm font-medium capitalize">{job.experienceLevel}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <PoundSterling className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Salary Range</p>
              <p className="text-sm font-medium">
                {job.salaryMin && job.salaryMax
                  ? `£${job.salaryMin.toLocaleString()} – £${job.salaryMax.toLocaleString()}`
                  : "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Matches</p>
              <p className="text-sm font-medium">{job.matchCount} candidates matched</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Skills Required</p>
              <p className="text-sm font-medium">{job.skills.length} skills</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {job.jobType && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Job Type</p>
              <p className="text-sm font-medium capitalize">{({ permanent_full_time: "Permanent (Full Time)", contract: "Contract", fixed_term_contract: "Fixed Term Contract", part_time: "Part-time", temporary: "Temporary" } as Record<string, string>)[job.jobType] || job.jobType}</p>
            </CardContent>
          </Card>
        )}
        {job.workplace && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Workplace</p>
              <p className="text-sm font-medium capitalize">{job.workplace}</p>
            </CardContent>
          </Card>
        )}
        {job.industry && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Industry</p>
              <p className="text-sm font-medium capitalize">{({ accounting_finance: "Accounting & Finance", agriculture: "Agriculture", automotive: "Automotive", banking: "Banking", construction: "Construction", consulting: "Consulting", creative_design: "Creative & Design", education: "Education", energy_utilities: "Energy & Utilities", engineering: "Engineering", healthcare: "Healthcare", hospitality_tourism: "Hospitality & Tourism", human_resources: "Human Resources", insurance: "Insurance", legal: "Legal", logistics_supply_chain: "Logistics & Supply Chain", manufacturing: "Manufacturing", marketing_advertising: "Marketing & Advertising", media_entertainment: "Media & Entertainment", nonprofit: "Non-profit", pharmaceutical: "Pharmaceutical", property_real_estate: "Property & Real Estate", public_sector: "Public Sector", retail: "Retail", sales: "Sales", science_research: "Science & Research", technology: "Technology", telecommunications: "Telecommunications", transport: "Transport", other: "Other" } as Record<string, string>)[job.industry] || job.industry}</p>
            </CardContent>
          </Card>
        )}
        {job.educationLevel && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Education Level</p>
              <p className="text-sm font-medium">{job.educationLevel}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Required Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs px-2.5 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-right">
        Posted: {new Date(job.createdAt).toLocaleDateString()} · Last updated: {new Date(job.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

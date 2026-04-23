import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { formatIndustry } from "@/lib/industries";
import { publicLocation } from "@/lib/display-location";
import { safeExternalUrl } from "@/lib/safeUrl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  ArrowLeft,
  PoundSterling,
  ExternalLink,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string[];
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  status: string;
  createdAt: string;
}

interface CompanyDetail {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  size: string | null;
  founded: string | null;
  jobs: Job[];
  totalJobs: number;
}

export default function BrowseCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await fetch(`${basePath}/companies/${id}`);
        if (res.ok) setCompany(await res.json());
      } catch (err) {
        console.error("Failed to fetch company", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [basePath, id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading company...</div>;
  }

  if (!company) {
    return <div className="p-8 text-center text-muted-foreground">Company not found.</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground -ml-2"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div className="flex items-start gap-6">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.name}
            className="w-20 h-20 rounded-xl object-cover border border-border"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{company.name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {company.industry && (
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                {formatIndustry(company.industry)}
              </Badge>
            )}
            {publicLocation(company) && (
              <span className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1" /> {publicLocation(company)}
              </span>
            )}
            {company.size && (
              <span className="flex items-center text-sm text-muted-foreground">
                <Users className="w-3.5 h-3.5 mr-1" /> {company.size} employees
              </span>
            )}
            {company.founded && (
              <span className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 mr-1" /> Founded {company.founded}
              </span>
            )}
          </div>
          {company.website && (
            <a
              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:underline mt-2"
            >
              <Globe className="w-3.5 h-3.5 mr-1" /> {company.website}
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
          {(() => {
            const links = [
              { url: safeExternalUrl(company.linkedinUrl), Icon: Linkedin, label: "LinkedIn" },
              { url: safeExternalUrl(company.twitterUrl), Icon: Twitter, label: "X / Twitter" },
              { url: safeExternalUrl(company.facebookUrl), Icon: Facebook, label: "Facebook" },
              { url: safeExternalUrl(company.instagramUrl), Icon: Instagram, label: "Instagram" },
            ].filter(l => l.url);
            if (links.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-2 mt-3">
                {links.map(({ url, Icon, label }) => (
                  <a key={label} href={url!} target="_blank" rel="noopener noreferrer" aria-label={label}
                     className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-5 pb-5 text-center">
            <div className="text-3xl font-bold text-foreground">{company.jobs.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Open Positions</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-5 pb-5 text-center">
            <div className="text-3xl font-bold text-foreground">{formatIndustry(company.industry) || "—"}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Industry</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-5 pb-5 text-center">
            <div className="text-3xl font-bold text-foreground">{company.size || "—"}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Company Size</div>
          </CardContent>
        </Card>
      </div>

      {company.description && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{company.description}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-primary" />
            Open Positions ({company.jobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {company.jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No open positions at this time.</p>
          ) : (
            <div className="space-y-3">
              {company.jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">{job.title}</span>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                          {job.experienceLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" /> {job.location}
                        </span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="flex items-center font-mono">
                            <PoundSterling className="w-3 h-3 mr-1" />
                            £{(job.salaryMin || 0).toLocaleString()} - £{(job.salaryMax || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.skills.slice(0, 5).map(skill => (
                            <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="text-[10px] text-muted-foreground">+{job.skills.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

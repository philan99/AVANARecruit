import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useRole } from "@/contexts/role-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Users,
  Mail,
  Briefcase,
  ArrowLeft,
  LogIn,
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
  email: string | null;
  industry: string | null;
  website: string | null;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  size: string | null;
  founded: string | null;
  createdAt: string;
  updatedAt: string;
  jobs: Job[];
}

export default function AdminCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { impersonateCompany } = useRole();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await fetch(`${basePath}/admin/companies/${id}`);
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

  const openJobs = company.jobs.filter(j => j.status === "open").length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
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
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-16 h-16 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {company.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                {company.industry && (
                  <Badge variant="secondary" className="text-xs">{company.industry}</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-7 ml-auto"
                  onClick={() => {
                    impersonateCompany(company.id, company.email || "");
                    navigate("/");
                  }}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login as Company
                </Button>
              </div>
              {company.description && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{company.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {company.email && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium truncate">{company.email}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {company.location && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium truncate">{company.location}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {company.website && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Website</p>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline truncate block">
                  {(() => { try { return new URL(company.website).hostname; } catch { return company.website; } })()}
                </a>
              </div>
            </CardContent>
          </Card>
        )}
        {company.size && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Company Size</p>
                <p className="text-sm font-medium">{company.size}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {company.founded && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Founded</p>
                <p className="text-sm font-medium">{company.founded}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Jobs Posted</p>
              <p className="text-sm font-medium">{company.jobs.length} total · {openJobs} open</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Jobs ({company.jobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {company.jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Level</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Salary</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Skills</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {company.jobs.map((job) => (
                    <tr key={job.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                      <td className="py-2 px-2 font-medium text-primary hover:underline">{job.title}</td>
                      <td className="py-2 px-2 text-muted-foreground">{job.location}</td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-[9px] uppercase">{job.experienceLevel}</Badge>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {job.salaryMin && job.salaryMax
                          ? `£${job.salaryMin.toLocaleString()} – £${job.salaryMax.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {job.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[9px] px-1.5 py-0">{skill}</Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">+{job.skills.length - 3}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant={job.status === "open" ? "default" : "secondary"} className="text-[9px] uppercase">{job.status}</Badge>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No jobs posted by this company.</p>
          )}
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-right">
        Registered: {new Date(company.createdAt).toLocaleDateString()} · Last updated: {new Date(company.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

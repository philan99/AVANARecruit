import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  LayoutDashboard,
  Mail,
  MapPin,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  Clock,
  Phone,
} from "lucide-react";

interface CompanyProfile {
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
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  currentTitle: string;
  summary: string;
  skills: string[];
  experienceYears: number;
  education: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string[];
  experienceLevel: string;
  status: string;
  matchCount: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "jobs" | "candidates">("overview");

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, candidatesRes, jobsRes] = await Promise.all([
          fetch(`${basePath}/admin/companies`),
          fetch(`${basePath}/admin/candidates`),
          fetch(`${basePath}/jobs`),
        ]);
        if (companiesRes.ok) setCompanies(await companiesRes.json());
        if (candidatesRes.ok) setCandidates(await candidatesRes.json());
        if (jobsRes.ok) setJobs(await jobsRes.json());
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [basePath]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading admin data...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Platform overview and configuration tables.</p>
      </div>

      <div className="flex gap-2 border-b border-border pb-0">
        {[
          { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
          { key: "companies" as const, label: `Companies (${companies.length})`, icon: Building2 },
          { key: "jobs" as const, label: `Jobs (${jobs.length})`, icon: Briefcase },
          { key: "candidates" as const, label: `Candidates (${candidates.length})`, icon: Users },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{companies.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered on platform</p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{candidates.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Profiles created</p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{jobs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {jobs.filter(j => j.status === "open").length} open
                </p>
              </CardContent>
            </Card>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">Recent Companies</CardTitle>
                <CardDescription>Latest companies registered on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companies.length > 0 ? companies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {company.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{company.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {company.industry || "No industry"} {company.location ? `· ${company.location}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No companies registered yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">Recent Candidates</CardTitle>
                <CardDescription>Latest candidate profiles on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidates.length > 0 ? candidates.slice(0, 5).map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{candidate.currentTitle}</p>
                        </div>
                      </div>
                      <Badge variant={candidate.status === "active" ? "default" : "secondary"} className="text-[9px] uppercase shrink-0 ml-2">
                        {candidate.status}
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No candidates registered yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">Recent Jobs</CardTitle>
                <CardDescription>Latest job requisitions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs.length > 0 ? jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {job.company} · {job.location}
                        </p>
                      </div>
                      <Badge
                        variant={job.status === "open" ? "default" : "secondary"}
                        className="text-[9px] uppercase shrink-0 ml-2"
                      >
                        {job.status}
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No jobs posted yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "companies" && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
            <CardDescription>Complete list of registered companies on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {companies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Industry</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Website</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Founded</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{company.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                              {company.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium">{company.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {company.email ? (
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{company.email}</span>
                          ) : "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{company.industry || "—"}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {company.location ? (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{company.location}</span>
                          ) : "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{company.size || "—"}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {company.website ? (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                              <Globe className="w-3 h-3" />{new URL(company.website).hostname}
                            </a>
                          ) : "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{company.founded || "—"}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No companies registered yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "jobs" && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>All Jobs</CardTitle>
            <CardDescription>Complete list of job requisitions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Level</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Skills</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Matches</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{job.id}</td>
                        <td className="py-3 px-4 font-medium">{job.title}</td>
                        <td className="py-3 px-4 text-muted-foreground">{job.company}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[9px] uppercase">{job.experienceLevel}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {job.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-[9px] px-1.5 py-0">{skill}</Badge>
                            ))}
                            {job.skills.length > 3 && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">+{job.skills.length - 3}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-primary">{job.matchCount}</td>
                        <td className="py-3 px-4">
                          <Badge variant={job.status === "open" ? "default" : "secondary"} className="text-[9px] uppercase">{job.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(job.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No jobs posted yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "candidates" && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>All Candidates</CardTitle>
            <CardDescription>Complete list of candidate profiles on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {candidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Experience</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Education</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Skills</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{candidate.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                              {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium">{candidate.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{candidate.email}</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{candidate.currentTitle}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.location}</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{candidate.experienceYears} yrs</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{candidate.education}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {candidate.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-[9px] px-1.5 py-0">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                +{candidate.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={candidate.status === "active" ? "default" : "secondary"} className="text-[9px] uppercase">
                            {candidate.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No candidates registered yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

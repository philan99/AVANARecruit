import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Briefcase,
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


        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/companies">
              <Card className="bg-card cursor-pointer hover:border-primary/50 transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{companies.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered on platform</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/jobs">
              <Card className="bg-card cursor-pointer hover:border-primary/50 transition-colors h-full">
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
            </Link>

            <Link href="/candidates">
              <Card className="bg-card cursor-pointer hover:border-primary/50 transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{candidates.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Profiles created</p>
                </CardContent>
              </Card>
            </Link>

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
                    <Link key={company.id} href="/companies"><div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors">
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
                    </div></Link>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No companies registered yet.</p>
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
                    <Link key={job.id} href="/jobs"><div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors">
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
                    </div></Link>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No jobs posted yet.</p>
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
                    <Link key={candidate.id} href="/candidates"><div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors">
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
                    </div></Link>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No candidates registered yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

    </div>
  );
}

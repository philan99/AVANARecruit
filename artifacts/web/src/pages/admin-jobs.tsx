import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, MapPin, Building, Search, X } from "lucide-react";

interface Job {
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
  status: string;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
  jobType: string | null;
  workplace: string | null;
  industry: string | null;
  educationLevel: string | null;
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);

  const [searchQuery, setSearchQuery] = useState(urlParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(urlParams.get("status") || "all");
  const [locationFilter, setLocationFilter] = useState(urlParams.get("location") || "all");
  const [levelFilter, setLevelFilter] = useState(urlParams.get("level") || "all");
  const [companyFilter, setCompanyFilter] = useState(urlParams.get("company") || "all");
  const [jobTypeFilter, setJobTypeFilter] = useState(urlParams.get("jobType") || "all");
  const [workplaceFilter, setWorkplaceFilter] = useState(urlParams.get("workplace") || "all");
  const [industryFilter, setIndustryFilter] = useState(urlParams.get("industry") || "all");
  const [educationFilter, setEducationFilter] = useState(urlParams.get("education") || "all");

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    setSearchQuery(params.get("search") || "");
    setStatusFilter(params.get("status") || "all");
    setLocationFilter(params.get("location") || "all");
    setLevelFilter(params.get("level") || "all");
    setCompanyFilter(params.get("company") || "all");
    setJobTypeFilter(params.get("jobType") || "all");
    setWorkplaceFilter(params.get("workplace") || "all");
    setIndustryFilter(params.get("industry") || "all");
    setEducationFilter(params.get("education") || "all");
  }, [searchString]);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${basePath}/jobs`);
        if (res.ok) setJobs(await res.json());
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [basePath]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set(jobs.map(j => j.location).filter(Boolean));
    return Array.from(locs).sort();
  }, [jobs]);

  const uniqueLevels = useMemo(() => {
    const levels = new Set(jobs.map(j => j.experienceLevel).filter(Boolean));
    return Array.from(levels).sort();
  }, [jobs]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set(jobs.map(j => j.company).filter(Boolean));
    return Array.from(companies).sort();
  }, [jobs]);

  const uniqueJobTypes = useMemo(() => {
    const types = new Set(jobs.map(j => j.jobType).filter(Boolean) as string[]);
    return Array.from(types).sort();
  }, [jobs]);

  const uniqueWorkplaces = useMemo(() => {
    const wps = new Set(jobs.map(j => j.workplace).filter(Boolean) as string[]);
    return Array.from(wps).sort();
  }, [jobs]);

  const uniqueIndustries = useMemo(() => {
    const inds = new Set(jobs.map(j => j.industry).filter(Boolean) as string[]);
    return Array.from(inds).sort();
  }, [jobs]);

  const uniqueEducationLevels = useMemo(() => {
    const edus = new Set(jobs.map(j => j.educationLevel).filter(Boolean) as string[]);
    return Array.from(edus).sort();
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some(s => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (locationFilter !== "all" && j.location !== locationFilter) return false;
      if (levelFilter !== "all" && j.experienceLevel !== levelFilter) return false;
      if (companyFilter !== "all" && j.company !== companyFilter) return false;
      if (jobTypeFilter !== "all" && j.jobType !== jobTypeFilter) return false;
      if (workplaceFilter !== "all" && j.workplace !== workplaceFilter) return false;
      if (industryFilter !== "all" && j.industry !== industryFilter) return false;
      if (educationFilter !== "all" && j.educationLevel !== educationFilter) return false;
      return true;
    });
  }, [jobs, searchQuery, statusFilter, locationFilter, levelFilter, companyFilter, jobTypeFilter, workplaceFilter, industryFilter, educationFilter]);

  const hasActiveFilters = searchQuery || statusFilter !== "all" || locationFilter !== "all" || levelFilter !== "all" || companyFilter !== "all" || jobTypeFilter !== "all" || workplaceFilter !== "all" || industryFilter !== "all" || educationFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setLocationFilter("all");
    setLevelFilter("all");
    setCompanyFilter("all");
    setJobTypeFilter("all");
    setWorkplaceFilter("all");
    setIndustryFilter("all");
    setEducationFilter("all");
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading jobs data...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Briefcase className="mr-3 text-primary" /> Jobs
        </h1>
        <p className="text-muted-foreground mt-1">{jobs.length} job requisitions on the platform.</p>
      </div>

      <Card className="bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Title, company, or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
            </div>

            <div className="w-[130px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[130px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Level</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueLevels.map(lvl => (
                    <SelectItem key={lvl} value={lvl}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Company</Label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {uniqueCompanies.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-9 text-xs gap-1 text-muted-foreground" onClick={clearFilters}>
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3 mt-3">
            <div className="w-[160px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Job Type</Label>
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  {uniqueJobTypes.map(t => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[130px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Workplace</Label>
              <Select value={workplaceFilter} onValueChange={setWorkplaceFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workplaces</SelectItem>
                  {uniqueWorkplaces.map(w => (
                    <SelectItem key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[180px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Industry</Label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map(i => (
                    <SelectItem key={i} value={i}>{i.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Education</Label>
              <Select value={educationFilter} onValueChange={setEducationFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueEducationLevels.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <p className="text-[11px] text-muted-foreground mt-3">
              Showing {filtered.length} of {jobs.length} jobs
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="pt-6">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Job</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Level</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Workplace</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Industry</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Education</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Salary</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Skills</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Matches</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr key={job.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-foreground truncate">{job.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">ID: {job.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        <span className="flex items-center gap-1"><Building className="w-3 h-3" />{job.company}</span>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-[8px] uppercase px-1 py-0">{job.experienceLevel}</Badge>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {job.jobType ? job.jobType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {job.workplace ? job.workplace.charAt(0).toUpperCase() + job.workplace.slice(1) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {job.industry ? job.industry.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {job.educationLevel || "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground font-mono">
                        {job.salaryMin || job.salaryMax
                          ? `£${(job.salaryMin || 0).toLocaleString()} - £${(job.salaryMax || 0).toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[8px] px-1 py-0">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 2 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0">
                              +{job.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <span className="font-mono font-bold text-primary">{job.matchCount}</span>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant={job.status === "open" ? "default" : "secondary"} className="text-[8px] uppercase">
                          {job.status}
                        </Badge>
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
            <p className="text-sm text-muted-foreground text-center py-8">
              {hasActiveFilters ? "No jobs match your filters." : "No jobs on the platform yet."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

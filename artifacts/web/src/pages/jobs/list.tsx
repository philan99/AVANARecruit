import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";
import { useCompanyProfile } from "@/hooks/use-company-profile";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, Search, Plus, MapPin, Building, Target,
  SlidersHorizontal, X, ChevronDown, Check, GraduationCap,
  Monitor, PoundSterling, LayoutGrid, List, Clock, Factory, UserCheck,
} from "lucide-react";

function MultiSelectDropdown({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  formatOption,
}: {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: Set<string>;
  onChange: (val: Set<string>) => void;
  formatOption?: (val: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(val: string) {
    const next = new Set(selected);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange(next);
  }

  const fmt = formatOption || ((v: string) => v);

  const filtered = filterText
    ? options.filter(o => fmt(o).toLowerCase().includes(filterText.toLowerCase()))
    : options;

  const displayText = selected.size === 0
    ? `All ${label}`
    : selected.size === 1
    ? fmt(Array.from(selected)[0])
    : `${selected.size} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-left hover:bg-accent/50 transition-colors"
      >
        <Icon className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
        <span className={`flex-1 truncate ${selected.size === 0 ? "text-muted-foreground" : "text-foreground"}`}>
          {displayText}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] rounded-md border border-border bg-card shadow-lg">
          {options.length > 5 && (
            <div className="p-2 border-b border-border">
              <Input
                placeholder={`Search ${label.toLowerCase()}...`}
                className="h-7 text-xs"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">No matches</div>
            )}
            {filtered.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className="flex items-center w-full px-3 py-1.5 text-sm hover:bg-accent/50 transition-colors text-left"
              >
                <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  selected.has(option) ? "bg-primary border-primary" : "border-input"
                }`}>
                  {selected.has(option) && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className="truncate">{fmt(option)}</span>
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <div className="border-t border-border p-1.5">
              <button
                type="button"
                onClick={() => onChange(new Set())}
                className="w-full text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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

function formatJobType(val: string) {
  return JOB_TYPE_LABELS[val] || val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function formatWorkplace(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}
function formatIndustry(val: string) {
  return INDUSTRY_LABELS[val] || val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function formatLevel(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

export default function JobsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const [, navigate] = useLocation();
  const { role } = useRole();
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const initStatus = urlParams.get("status");
  const initLocation = urlParams.get("location");
  const initLevel = urlParams.get("level");
  const initJobType = urlParams.get("jobType");
  const initWorkplace = urlParams.get("workplace");
  const initIndustry = urlParams.get("industry");
  const initEducation = urlParams.get("education");
  const hasInitialFilters = !!(initStatus && initStatus !== "all") || !!initLocation || !!initLevel || !!initJobType || !!initWorkplace || !!initIndustry || !!initEducation;

  const [showFilters, setShowFilters] = useState(hasInitialFilters);

  const [statusFilters, setStatusFilters] = useState<Set<string>>(
    initStatus && initStatus !== "all" ? new Set([initStatus]) : new Set()
  );
  const [locationFilters, setLocationFilters] = useState<Set<string>>(
    initLocation ? new Set([initLocation]) : new Set()
  );
  const [levelFilters, setLevelFilters] = useState<Set<string>>(
    initLevel ? new Set([initLevel]) : new Set()
  );
  const [jobTypeFilters, setJobTypeFilters] = useState<Set<string>>(
    initJobType ? new Set([initJobType]) : new Set()
  );
  const [workplaceFilters, setWorkplaceFilters] = useState<Set<string>>(
    initWorkplace ? new Set([initWorkplace]) : new Set()
  );
  const [industryFilters, setIndustryFilters] = useState<Set<string>>(
    initIndustry ? new Set([initIndustry]) : new Set()
  );
  const [educationFilters, setEducationFilters] = useState<Set<string>>(
    initEducation ? new Set([initEducation]) : new Set()
  );

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const status = params.get("status");
    const jobType = params.get("jobType");
    const workplace = params.get("workplace");
    const industry = params.get("industry");
    const education = params.get("education");
    const location = params.get("location");
    const level = params.get("level");
    let hasFilter = false;
    if (status && status !== "all") { setStatusFilters(new Set([status])); hasFilter = true; }
    if (jobType) { setJobTypeFilters(new Set([jobType])); hasFilter = true; }
    if (workplace) { setWorkplaceFilters(new Set([workplace])); hasFilter = true; }
    if (industry) { setIndustryFilters(new Set([industry])); hasFilter = true; }
    if (education) { setEducationFilters(new Set([education])); hasFilter = true; }
    if (location) { setLocationFilters(new Set([location])); hasFilter = true; }
    if (level) { setLevelFilters(new Set([level])); hasFilter = true; }
    if (hasFilter) setShowFilters(true);
  }, [searchString]);

  const { data: companyProfile } = useCompanyProfile({
    enabled: role === "company",
  });

  const companyProfileId = companyProfile?.id;
  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (role !== "company" || !companyProfileId) return;
    async function fetchAppliedJobs() {
      try {
        const res = await fetch(`${basePath}/dashboard/applicants?companyProfileId=${companyProfileId}&limit=1000`);
        if (res.ok) {
          const data = await res.json();
          setAppliedJobIds(new Set(data.map((a: any) => a.jobId)));
        }
      } catch (err) {
        console.error("Failed to fetch applied jobs", err);
      }
    }
    fetchAppliedJobs();
  }, [basePath, companyProfileId, role]);

  const apiQueryParams = {
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(role === "company" && companyProfileId ? { companyProfileId } : {}),
  };

  const { data: jobs, isLoading } = useListJobs(apiQueryParams, {
    query: { queryKey: getListJobsQueryKey(apiQueryParams), enabled: role !== "company" || !!companyProfileId },
  });

  const allJobs = jobs || [];

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(allJobs.map(j => j.location).filter(Boolean))).sort();
  }, [allJobs]);

  const uniqueLevels = useMemo(() => {
    return Array.from(new Set(allJobs.map(j => j.experienceLevel).filter(Boolean))).sort();
  }, [allJobs]);

  const uniqueJobTypes = useMemo(() => {
    return Array.from(new Set(allJobs.map(j => (j as any).jobType).filter(Boolean))).sort();
  }, [allJobs]);

  const uniqueWorkplaces = useMemo(() => {
    return Array.from(new Set(allJobs.map(j => (j as any).workplace).filter(Boolean))).sort();
  }, [allJobs]);

  const uniqueIndustries = useMemo(() => {
    return Array.from(new Set(allJobs.map(j => (j as any).industry).filter(Boolean))).sort();
  }, [allJobs]);

  const uniqueEducationLevels = useMemo(() => {
    return Array.from(new Set(allJobs.map(j => (j as any).educationLevel).filter(Boolean))).sort();
  }, [allJobs]);

  const uniqueStatuses = ["open", "closed", "draft"];

  const filtered = useMemo(() => {
    return allJobs.filter(j => {
      if (statusFilters.size > 0 && !statusFilters.has(j.status)) return false;
      if (locationFilters.size > 0 && !locationFilters.has(j.location)) return false;
      if (levelFilters.size > 0 && !levelFilters.has(j.experienceLevel)) return false;
      if (jobTypeFilters.size > 0 && !jobTypeFilters.has((j as any).jobType || "")) return false;
      if (workplaceFilters.size > 0 && !workplaceFilters.has((j as any).workplace || "")) return false;
      if (industryFilters.size > 0 && !industryFilters.has((j as any).industry || "")) return false;
      if (educationFilters.size > 0 && !educationFilters.has((j as any).educationLevel || "")) return false;
      return true;
    });
  }, [allJobs, statusFilters, locationFilters, levelFilters, jobTypeFilters, workplaceFilters, industryFilters, educationFilters]);

  const activeFilterCount = useMemo(() => {
    return statusFilters.size + locationFilters.size + levelFilters.size + jobTypeFilters.size + workplaceFilters.size + industryFilters.size + educationFilters.size;
  }, [statusFilters, locationFilters, levelFilters, jobTypeFilters, workplaceFilters, industryFilters, educationFilters]);

  const hasActiveFilters = searchQuery || activeFilterCount > 0;

  function clearFilters() {
    setSearchQuery("");
    setStatusFilters(new Set());
    setLocationFilters(new Set());
    setLevelFilters(new Set());
    setJobTypeFilters(new Set());
    setWorkplaceFilters(new Set());
    setIndustryFilters(new Set());
    setEducationFilters(new Set());
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Briefcase className="mr-3 text-primary" /> All Jobs
          </h1>
          <p className="text-muted-foreground mt-1">Manage open roles and track matching candidates.</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Post Job
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search roles or keywords..."
              className="pl-9 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5 mr-1" /> Clear all
            </Button>
          )}
          <div className="flex-1" />
          <div className="flex items-center border border-border rounded-md bg-card overflow-hidden">
            <button
              className={`p-2 transition-colors ${viewMode === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              onClick={() => setViewMode("cards")}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <Card className="bg-card border-border">
            <CardContent className="pt-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <MultiSelectDropdown
                    label="Statuses"
                    icon={Briefcase}
                    options={uniqueStatuses}
                    selected={statusFilters}
                    onChange={setStatusFilters}
                    formatOption={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                  <MultiSelectDropdown
                    label="Locations"
                    icon={MapPin}
                    options={uniqueLocations}
                    selected={locationFilters}
                    onChange={setLocationFilters}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience Level</label>
                  <MultiSelectDropdown
                    label="Levels"
                    icon={Clock}
                    options={uniqueLevels}
                    selected={levelFilters}
                    onChange={setLevelFilters}
                    formatOption={formatLevel}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Type</label>
                  <MultiSelectDropdown
                    label="Job Types"
                    icon={Briefcase}
                    options={uniqueJobTypes}
                    selected={jobTypeFilters}
                    onChange={setJobTypeFilters}
                    formatOption={formatJobType}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Workplace</label>
                  <MultiSelectDropdown
                    label="Workplaces"
                    icon={Monitor}
                    options={uniqueWorkplaces}
                    selected={workplaceFilters}
                    onChange={setWorkplaceFilters}
                    formatOption={formatWorkplace}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Industry</label>
                  <MultiSelectDropdown
                    label="Industries"
                    icon={Factory}
                    options={uniqueIndustries}
                    selected={industryFilters}
                    onChange={setIndustryFilters}
                    formatOption={formatIndustry}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Education</label>
                  <MultiSelectDropdown
                    label="Education"
                    icon={GraduationCap}
                    options={uniqueEducationLevels}
                    selected={educationFilters}
                    onChange={setEducationFilters}
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Active:</span>
                  {Array.from(statusFilters).map(v => (
                    <span key={`status-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1 capitalize">
                      {v}
                      <button onClick={() => { const n = new Set(statusFilters); n.delete(v); setStatusFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(locationFilters).map(v => (
                    <span key={`loc-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(locationFilters); n.delete(v); setLocationFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(levelFilters).map(v => (
                    <span key={`level-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1 capitalize">
                      {v}
                      <button onClick={() => { const n = new Set(levelFilters); n.delete(v); setLevelFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(jobTypeFilters).map(v => (
                    <span key={`jt-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {formatJobType(v)}
                      <button onClick={() => { const n = new Set(jobTypeFilters); n.delete(v); setJobTypeFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(workplaceFilters).map(v => (
                    <span key={`wp-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {formatWorkplace(v)}
                      <button onClick={() => { const n = new Set(workplaceFilters); n.delete(v); setWorkplaceFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(industryFilters).map(v => (
                    <span key={`ind-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {formatIndustry(v)}
                      <button onClick={() => { const n = new Set(industryFilters); n.delete(v); setIndustryFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(educationFilters).map(v => (
                    <span key={`edu-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(educationFilters); n.delete(v); setEducationFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of {allJobs.length} jobs
            {activeFilterCount > 0 && <span> (filtered)</span>}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground font-mono">Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              {hasActiveFilters ? "No jobs match your filters." : "No jobs found."}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className={`hover:border-primary/50 transition-colors cursor-pointer bg-card h-full flex flex-col ${appliedJobIds.has(job.id) ? "border-l-2 border-l-blue-500" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={job.status === "open" ? "default" : "secondary"} className="font-mono text-[10px] uppercase tracking-wider">
                        {job.status}
                      </Badge>
                      {appliedJobIds.has(job.id) && (
                        <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-600 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                          <UserCheck className="w-3 h-3" />
                          Applied
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">REQ-{job.id.toString().padStart(4, "0")}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">{job.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building className="w-3.5 h-3.5 mr-2 shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-2 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    {((job as any).salaryMin || (job as any).salaryMax) && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <PoundSterling className="w-3.5 h-3.5 mr-2 shrink-0" />
                        <span className="font-mono text-xs">
                          £{((job as any).salaryMin || 0).toLocaleString()} – £{((job as any).salaryMax || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {((job as any).jobType || (job as any).workplace) && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(job as any).jobType && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                          {formatJobType((job as any).jobType)}
                        </Badge>
                      )}
                      {(job as any).workplace && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                          {formatWorkplace((job as any).workplace)}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-border mt-auto flex justify-between items-center">
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                          +{job.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded shrink-0 ml-2">
                      <Target className="w-3 h-3 mr-1" />
                      {job.matchCount} Matches
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Job</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Level</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Workplace</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Industry</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Salary</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Skills</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Matches</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr key={job.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer ${appliedJobIds.has(job.id) ? "bg-blue-500/5 border-l-2 border-l-blue-500" : ""}`} onClick={() => navigate(`/jobs/${job.id}`)}>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-xs text-foreground truncate max-w-[200px]">{job.title}</p>
                              {appliedJobIds.has(job.id) && (
                                <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-600 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                                  <UserCheck className="w-3 h-3" />
                                  Applied
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">REQ-{job.id.toString().padStart(4, "0")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-[8px] uppercase px-1 py-0">{job.experienceLevel}</Badge>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {(job as any).jobType ? formatJobType((job as any).jobType) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {(job as any).workplace ? formatWorkplace((job as any).workplace) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {(job as any).industry ? formatIndustry((job as any).industry) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground font-mono">
                        {(job as any).salaryMin || (job as any).salaryMax
                          ? `£${((job as any).salaryMin || 0).toLocaleString()} - £${((job as any).salaryMax || 0).toLocaleString()}`
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

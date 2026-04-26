import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, MapPin, Building, Search, X, SlidersHorizontal, ChevronDown, Check, GraduationCap, Monitor, PoundSterling, LayoutGrid, List, Factory, TrendingUp } from "lucide-react";

function formatWorkplaceLabel(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function formatExperienceLabel(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

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
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [showFilters, setShowFilters] = useState(false);

  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);

  const [searchQuery, setSearchQuery] = useState(urlParams.get("search") || "");

  const [statusFilters, setStatusFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("status");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [locationFilters, setLocationFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("location");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [levelFilters, setLevelFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("level");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [companyFilters, setCompanyFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("company");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [jobTypeFilters, setJobTypeFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("jobType");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [workplaceFilters, setWorkplaceFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("workplace");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [industryFilters, setIndustryFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("industry");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [educationFilters, setEducationFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("education");
    return v && v !== "all" ? new Set([v]) : new Set();
  });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    setSearchQuery(params.get("search") || "");
    const status = params.get("status");
    setStatusFilters(status && status !== "all" ? new Set([status]) : new Set());
    const location = params.get("location");
    setLocationFilters(location && location !== "all" ? new Set([location]) : new Set());
    const level = params.get("level");
    setLevelFilters(level && level !== "all" ? new Set([level]) : new Set());
    const company = params.get("company");
    setCompanyFilters(company && company !== "all" ? new Set([company]) : new Set());
    const jobType = params.get("jobType");
    setJobTypeFilters(jobType && jobType !== "all" ? new Set([jobType]) : new Set());
    const workplace = params.get("workplace");
    setWorkplaceFilters(workplace && workplace !== "all" ? new Set([workplace]) : new Set());
    const industry = params.get("industry");
    setIndustryFilters(industry && industry !== "all" ? new Set([industry]) : new Set());
    const education = params.get("education");
    setEducationFilters(education && education !== "all" ? new Set([education]) : new Set());

    const hasAny = status || location || level || company || jobType || workplace || industry || education;
    if (hasAny) setShowFilters(true);
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

  const uniqueStatuses = ["open", "closed"];

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some(s => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (statusFilters.size > 0 && !statusFilters.has(j.status)) return false;
      if (locationFilters.size > 0 && !locationFilters.has(j.location)) return false;
      if (levelFilters.size > 0 && !levelFilters.has(j.experienceLevel)) return false;
      if (companyFilters.size > 0 && !companyFilters.has(j.company)) return false;
      if (jobTypeFilters.size > 0 && !jobTypeFilters.has(j.jobType || "")) return false;
      if (workplaceFilters.size > 0 && !workplaceFilters.has(j.workplace || "")) return false;
      if (industryFilters.size > 0 && !industryFilters.has(j.industry || "")) return false;
      if (educationFilters.size > 0 && !educationFilters.has(j.educationLevel || "")) return false;
      return true;
    });
  }, [jobs, searchQuery, statusFilters, locationFilters, levelFilters, companyFilters, jobTypeFilters, workplaceFilters, industryFilters, educationFilters]);

  const activeFilterCount = useMemo(() => {
    return statusFilters.size + locationFilters.size + levelFilters.size + companyFilters.size + jobTypeFilters.size + workplaceFilters.size + industryFilters.size + educationFilters.size;
  }, [statusFilters, locationFilters, levelFilters, companyFilters, jobTypeFilters, workplaceFilters, industryFilters, educationFilters]);

  const hasActiveFilters = searchQuery || activeFilterCount > 0;

  function tallyTop(keyFn: (j: Job) => string | null | undefined, limit = 8) {
    const map = new Map<string, number>();
    for (const j of jobs) {
      const k = keyFn(j);
      if (!k) continue;
      map.set(k, (map.get(k) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  const companyEntries = useMemo(() => tallyTop(j => j.company, 8), [jobs]);
  const locationEntries = useMemo(() => tallyTop(j => j.location, 8), [jobs]);
  const jobTypeEntries = useMemo(() => tallyTop(j => j.jobType, 20), [jobs]);
  const industryEntries = useMemo(() => tallyTop(j => j.industry, 8), [jobs]);
  const workplaceEntries = useMemo(() => tallyTop(j => j.workplace, 8), [jobs]);
  const experienceEntries = useMemo(() => tallyTop(j => j.experienceLevel, 8), [jobs]);

  function clearFilters() {
    setSearchQuery("");
    setStatusFilters(new Set());
    setLocationFilters(new Set());
    setLevelFilters(new Set());
    setCompanyFilters(new Set());
    setJobTypeFilters(new Set());
    setWorkplaceFilters(new Set());
    setIndustryFilters(new Set());
    setEducationFilters(new Set());
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
        <p className="text-muted-foreground mt-1">{jobs.length} jobs on the platform.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, company, or skill..."
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</label>
                  <MultiSelectDropdown
                    label="Companies"
                    icon={Building}
                    options={uniqueCompanies}
                    selected={companyFilters}
                    onChange={setCompanyFilters}
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
                    icon={GraduationCap}
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
                    icon={Building}
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
                  {Array.from(companyFilters).map(v => (
                    <span key={`company-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(companyFilters); n.delete(v); setCompanyFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
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

      {(companyEntries.length > 0 || locationEntries.length > 0 || jobTypeEntries.length > 0 || industryEntries.length > 0 || workplaceEntries.length > 0 || experienceEntries.length > 0) && (() => {
        const JobBar = ({
          label,
          value,
          max,
          active,
          color,
          onClick,
        }: { label: string; value: number; max: number; active: boolean; color: string; onClick: () => void }) => (
          <button
            onClick={onClick}
            className={`w-full text-left group ${active ? "opacity-100" : "opacity-90 hover:opacity-100"}`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className={`truncate pr-2 ${active ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                {label}
              </span>
              <span className={`tabular-nums ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{value}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${color} ${active ? "" : "opacity-70 group-hover:opacity-100"} transition-all`}
                style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
              />
            </div>
          </button>
        );

        const toggle = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
          const n = new Set(set);
          if (n.has(value)) n.delete(value); else n.add(value);
          setter(n);
        };

        const companyMax = Math.max(1, ...companyEntries.map(([, v]) => v));
        const locationMax = Math.max(1, ...locationEntries.map(([, v]) => v));
        const jobTypeMax = Math.max(1, ...jobTypeEntries.map(([, v]) => v));
        const industryMax = Math.max(1, ...industryEntries.map(([, v]) => v));
        const workplaceMax = Math.max(1, ...workplaceEntries.map(([, v]) => v));
        const experienceMax = Math.max(1, ...experienceEntries.map(([, v]) => v));
        const totalCompanies = new Set(jobs.map(j => j.company).filter(Boolean)).size;
        const totalLocations = new Set(jobs.map(j => j.location).filter(Boolean)).size;
        const totalIndustries = new Set(jobs.map(j => j.industry).filter(Boolean)).size;

        return (
          <Card className="bg-card">
            <CardContent className="pt-5 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Jobs by Company</h3>
                    {totalCompanies > 8 && (
                      <span className="text-[10px] text-muted-foreground">(top 8)</span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {companyEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : companyEntries.map(([c, v]) => (
                      <JobBar
                        key={c}
                        label={c}
                        value={v}
                        max={companyMax}
                        active={companyFilters.has(c)}
                        color="bg-green-500"
                        onClick={() => toggle(companyFilters, c, setCompanyFilters)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Jobs by Location</h3>
                    {totalLocations > 8 && (
                      <span className="text-[10px] text-muted-foreground">(top 8)</span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {locationEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : locationEntries.map(([l, v]) => (
                      <JobBar
                        key={l}
                        label={l}
                        value={v}
                        max={locationMax}
                        active={locationFilters.has(l)}
                        color="bg-blue-500"
                        onClick={() => toggle(locationFilters, l, setLocationFilters)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Jobs by Type</h3>
                  </div>
                  <div className="space-y-2.5">
                    {jobTypeEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : jobTypeEntries.map(([t, v]) => (
                      <JobBar
                        key={t}
                        label={formatJobType(t)}
                        value={v}
                        max={jobTypeMax}
                        active={jobTypeFilters.has(t)}
                        color="bg-purple-500"
                        onClick={() => toggle(jobTypeFilters, t, setJobTypeFilters)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Jobs by Industry</h3>
                    {totalIndustries > 8 && (
                      <span className="text-[10px] text-muted-foreground">(top 8)</span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {industryEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : industryEntries.map(([ind, v]) => (
                      <JobBar
                        key={ind}
                        label={formatIndustry(ind)}
                        value={v}
                        max={industryMax}
                        active={industryFilters.has(ind)}
                        color="bg-orange-500"
                        onClick={() => toggle(industryFilters, ind, setIndustryFilters)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Jobs by Workplace</h3>
                  </div>
                  <div className="space-y-2.5">
                    {workplaceEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : workplaceEntries.map(([wp, v]) => (
                      <JobBar
                        key={wp}
                        label={formatWorkplaceLabel(wp)}
                        value={v}
                        max={workplaceMax}
                        active={workplaceFilters.has(wp)}
                        color="bg-teal-500"
                        onClick={() => toggle(workplaceFilters, wp, setWorkplaceFilters)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Jobs by Experience</h3>
                  </div>
                  <div className="space-y-2.5">
                    {experienceEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : experienceEntries.map(([lvl, v]) => (
                      <JobBar
                        key={lvl}
                        label={formatExperienceLabel(lvl)}
                        value={v}
                        max={experienceMax}
                        active={levelFilters.has(lvl)}
                        color="bg-violet-500"
                        onClick={() => toggle(levelFilters, lvl, setLevelFilters)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of {jobs.length} jobs
            {activeFilterCount > 0 && <span> (filtered)</span>}
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              {hasActiveFilters ? "No jobs match your filters." : "No jobs on the platform yet."}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <Card
              key={job.id}
              className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <CardContent className="pt-5 pb-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider shrink-0">
                    {job.experienceLevel}
                  </Badge>
                  <Badge variant={job.status === "open" ? "default" : "secondary"} className="text-[8px] uppercase shrink-0">
                    {job.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2 mb-3">{job.title}</h3>

                <div className="space-y-1.5 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3 h-3 shrink-0" />
                    <span className="truncate">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-1.5">
                      <PoundSterling className="w-3 h-3 shrink-0" />
                      <span className="font-mono text-xs">
                        £{(job.salaryMin || 0).toLocaleString()} – £{(job.salaryMax || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {(job.jobType || job.workplace) && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.jobType && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                        {formatJobType(job.jobType)}
                      </Badge>
                    )}
                    {job.workplace && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                        {formatWorkplace(job.workplace)}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-border mt-auto flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-0.5">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-0.5">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-primary shrink-0 ml-2">{job.matchCount} matches</span>
                </div>
              </CardContent>
            </Card>
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
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Level</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Workplace</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Industry</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Salary</th>
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
                        {job.jobType ? formatJobType(job.jobType) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {job.workplace ? formatWorkplace(job.workplace) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">
                        {job.industry ? formatIndustry(job.industry) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground font-mono">
                        {job.salaryMin || job.salaryMax
                          ? `£${(job.salaryMin || 0).toLocaleString()} - £${(job.salaryMax || 0).toLocaleString()}`
                          : "—"}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

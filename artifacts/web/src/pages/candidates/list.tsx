import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useListCandidates, getListCandidatesQueryKey } from "@workspace/api-client-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users, Search, MapPin, Mail, X, LayoutGrid, List,
  SlidersHorizontal, ChevronDown, Check, Briefcase,
  Monitor, GraduationCap, Factory, Clock, Bookmark,
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
function formatStatus(val: string) {
  if (val === "not_looking") return "Not Looking";
  return val.charAt(0).toUpperCase() + val.slice(1);
}

export default function CandidatesList() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const role = localStorage.getItem("avanatalent_role");
  const isCompany = role === "company";
  const companyProfileId = localStorage.getItem("avanatalent_company_id");
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!isCompany || !companyProfileId) return;
    try {
      const res = await fetch(`${apiBase}/companies/${companyProfileId}/bookmarks`);
      if (res.ok) {
        const data = await res.json();
        setBookmarkedIds(new Set(data.map((b: any) => b.candidateId)));
      }
    } catch {}
  }, [isCompany, companyProfileId, apiBase]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  async function toggleBookmark(e: React.MouseEvent, candidateId: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!companyProfileId) return;
    const isBookmarked = bookmarkedIds.has(candidateId);
    if (isBookmarked) {
      setBookmarkedIds(prev => { const next = new Set(prev); next.delete(candidateId); return next; });
      await fetch(`${apiBase}/companies/${companyProfileId}/bookmarks/${candidateId}`, { method: "DELETE" });
    } else {
      setBookmarkedIds(prev => new Set(prev).add(candidateId));
      await fetch(`${apiBase}/companies/${companyProfileId}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });
    }
  }

  const initStatus = urlParams.get("status");
  const initLocation = urlParams.get("location");
  const initJobType = urlParams.get("jobType");
  const initWorkplace = urlParams.get("workplace");
  const initIndustry = urlParams.get("industry");
  const initEducation = urlParams.get("education");
  const hasInitialFilters = !!(initStatus && initStatus !== "all") || !!initLocation || !!initJobType || !!initWorkplace || !!initIndustry || !!initEducation;

  const [showFilters, setShowFilters] = useState(hasInitialFilters);

  const [statusFilters, setStatusFilters] = useState<Set<string>>(
    initStatus && initStatus !== "all" ? new Set([initStatus]) : new Set()
  );
  const [locationFilters, setLocationFilters] = useState<Set<string>>(
    initLocation ? new Set([initLocation]) : new Set()
  );
  const [skillFilters, setSkillFilters] = useState<Set<string>>(new Set());
  const [educationFilters, setEducationFilters] = useState<Set<string>>(
    initEducation ? new Set([initEducation]) : new Set()
  );
  const [experienceFilters, setExperienceFilters] = useState<Set<string>>(new Set());
  const [jobTypeFilters, setJobTypeFilters] = useState<Set<string>>(
    initJobType ? new Set([initJobType]) : new Set()
  );
  const [workplaceFilters, setWorkplaceFilters] = useState<Set<string>>(
    initWorkplace ? new Set([initWorkplace]) : new Set()
  );
  const [industryFilters, setIndustryFilters] = useState<Set<string>>(
    initIndustry ? new Set([initIndustry]) : new Set()
  );

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const status = params.get("status");
    const jobType = params.get("jobType");
    const workplace = params.get("workplace");
    const industry = params.get("industry");
    const education = params.get("education");
    const location = params.get("location");
    let hasFilter = false;
    if (status && status !== "all") { setStatusFilters(new Set([status])); hasFilter = true; }
    if (jobType) { setJobTypeFilters(new Set([jobType])); hasFilter = true; }
    if (workplace) { setWorkplaceFilters(new Set([workplace])); hasFilter = true; }
    if (industry) { setIndustryFilters(new Set([industry])); hasFilter = true; }
    if (education) { setEducationFilters(new Set([education])); hasFilter = true; }
    if (location) { setLocationFilters(new Set([location])); hasFilter = true; }
    if (hasFilter) setShowFilters(true);
  }, [searchString]);

  const { data: candidates, isLoading } = useListCandidates({}, {
    query: { queryKey: getListCandidatesQueryKey({}) },
  });

  const allCandidates = candidates || [];

  const uniqueStatuses = ["active", "passive", "not_looking"];
  const experienceRanges = ["0-2", "3-5", "6-10", "10+"];

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(allCandidates.map(c => c.location).filter(Boolean))).sort();
  }, [allCandidates]);

  const uniqueSkills = useMemo(() => {
    return Array.from(new Set(allCandidates.flatMap(c => c.skills))).sort();
  }, [allCandidates]);

  const uniqueEducations = useMemo(() => {
    return Array.from(new Set(allCandidates.map(c => c.education).filter(Boolean))).sort();
  }, [allCandidates]);

  const uniqueJobTypes = useMemo(() => {
    return Array.from(new Set(allCandidates.flatMap(c => (c as any).preferredJobTypes || []).filter(Boolean))).sort();
  }, [allCandidates]);

  const uniqueWorkplaces = useMemo(() => {
    return Array.from(new Set(allCandidates.flatMap(c => (c as any).preferredWorkplaces || []).filter(Boolean))).sort();
  }, [allCandidates]);

  const uniqueIndustries = useMemo(() => {
    return Array.from(new Set(allCandidates.flatMap(c => (c as any).preferredIndustries || []).filter(Boolean))).sort();
  }, [allCandidates]);

  const filtered = useMemo(() => {
    return allCandidates.filter(c => {
      if (showBookmarks && !bookmarkedIds.has(c.id)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = c.name.toLowerCase().includes(q) ||
          c.skills.some(s => s.toLowerCase().includes(q)) ||
          (c.currentTitle || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilters.size > 0 && !statusFilters.has(c.status)) return false;
      if (locationFilters.size > 0 && !locationFilters.has(c.location)) return false;
      if (skillFilters.size > 0 && !c.skills.some(s => skillFilters.has(s))) return false;
      if (educationFilters.size > 0 && !educationFilters.has(c.education)) return false;
      if (experienceFilters.size > 0) {
        const years = c.experienceYears;
        const matchesExp = Array.from(experienceFilters).some(range => {
          if (range === "0-2") return years <= 2;
          if (range === "3-5") return years >= 3 && years <= 5;
          if (range === "6-10") return years >= 6 && years <= 10;
          if (range === "10+") return years >= 10;
          return false;
        });
        if (!matchesExp) return false;
      }
      if (jobTypeFilters.size > 0) {
        const prefs = (c as any).preferredJobTypes || [];
        if (!prefs.some((p: string) => jobTypeFilters.has(p))) return false;
      }
      if (workplaceFilters.size > 0) {
        const prefs = (c as any).preferredWorkplaces || [];
        if (!prefs.some((p: string) => workplaceFilters.has(p))) return false;
      }
      if (industryFilters.size > 0) {
        const prefs = (c as any).preferredIndustries || [];
        if (!prefs.some((p: string) => industryFilters.has(p))) return false;
      }
      return true;
    });
  }, [allCandidates, searchQuery, statusFilters, locationFilters, skillFilters, educationFilters, experienceFilters, jobTypeFilters, workplaceFilters, industryFilters, showBookmarks, bookmarkedIds]);

  const activeFilterCount = useMemo(() => {
    return statusFilters.size + locationFilters.size + skillFilters.size + educationFilters.size + experienceFilters.size + jobTypeFilters.size + workplaceFilters.size + industryFilters.size;
  }, [statusFilters, locationFilters, skillFilters, educationFilters, experienceFilters, jobTypeFilters, workplaceFilters, industryFilters]);

  const hasActiveFilters = searchQuery || activeFilterCount > 0;

  function clearFilters() {
    setSearchQuery("");
    setStatusFilters(new Set());
    setLocationFilters(new Set());
    setSkillFilters(new Set());
    setEducationFilters(new Set());
    setExperienceFilters(new Set());
    setJobTypeFilters(new Set());
    setWorkplaceFilters(new Set());
    setIndustryFilters(new Set());
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Users className="mr-3 text-primary" /> Talent Pool
        </h1>
        <p className="text-muted-foreground mt-1">Browse and manage candidate profiles.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, title, or skill..."
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
          {isCompany && (
            <Button
              variant={showBookmarks ? "default" : "outline"}
              onClick={() => setShowBookmarks(!showBookmarks)}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${showBookmarks ? "fill-white" : ""}`} />
              {showBookmarks ? "Show All" : "Bookmarked"}
            </Button>
          )}
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
                    icon={Users}
                    options={uniqueStatuses}
                    selected={statusFilters}
                    onChange={setStatusFilters}
                    formatOption={formatStatus}
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skills</label>
                  <MultiSelectDropdown
                    label="Skills"
                    icon={Briefcase}
                    options={uniqueSkills}
                    selected={skillFilters}
                    onChange={setSkillFilters}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience</label>
                  <MultiSelectDropdown
                    label="Experience"
                    icon={Clock}
                    options={experienceRanges}
                    selected={experienceFilters}
                    onChange={setExperienceFilters}
                    formatOption={(v) => v === "10+" ? "10+ years" : `${v} years`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Education</label>
                  <MultiSelectDropdown
                    label="Education"
                    icon={GraduationCap}
                    options={uniqueEducations}
                    selected={educationFilters}
                    onChange={setEducationFilters}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Job Type</label>
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Workplace</label>
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Industry</label>
                  <MultiSelectDropdown
                    label="Industries"
                    icon={Factory}
                    options={uniqueIndustries}
                    selected={industryFilters}
                    onChange={setIndustryFilters}
                    formatOption={formatIndustry}
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Active:</span>
                  {Array.from(statusFilters).map(v => (
                    <span key={`status-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {formatStatus(v)}
                      <button onClick={() => { const n = new Set(statusFilters); n.delete(v); setStatusFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(locationFilters).map(v => (
                    <span key={`loc-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(locationFilters); n.delete(v); setLocationFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(skillFilters).map(v => (
                    <span key={`skill-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(skillFilters); n.delete(v); setSkillFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(experienceFilters).map(v => (
                    <span key={`exp-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v === "10+" ? "10+ yrs" : `${v} yrs`}
                      <button onClick={() => { const n = new Set(experienceFilters); n.delete(v); setExperienceFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(educationFilters).map(v => (
                    <span key={`edu-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(educationFilters); n.delete(v); setEducationFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
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
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of {allCandidates.length} candidates
            {activeFilterCount > 0 && <span> (filtered)</span>}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground font-mono">Loading talent pool...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              {hasActiveFilters ? "No candidates match your filters." : "No candidates found."}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((candidate) => (
            <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card h-full flex flex-col">
                <CardContent className="pt-5 pb-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider border-0 ${candidate.status === "active" ? "bg-green-500 text-white" : candidate.status === "passive" ? "bg-orange-400 text-white" : "bg-gray-400 text-white"}`}>
                      {formatStatus(candidate.status)}
                    </Badge>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground font-mono">{candidate.experienceYears} YOE</span>
                      {isCompany && (
                        <button onClick={(e) => toggleBookmark(e, candidate.id)} className="hover:scale-110 transition-transform" title={bookmarkedIds.has(candidate.id) ? "Remove bookmark" : "Bookmark candidate"}>
                          <Bookmark className={`w-4 h-4 ${bookmarkedIds.has(candidate.id) ? "fill-primary text-primary" : "text-muted-foreground/40 hover:text-primary"}`} />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground leading-tight mb-0.5">{candidate.name}</h3>
                  <p className="text-xs text-muted-foreground truncate mb-3">{candidate.currentTitle}</p>

                  <div className="space-y-1.5 mb-3 text-xs text-muted-foreground">
                    {!isCompany && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{candidate.location}</span>
                    </div>
                    {candidate.education && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3 shrink-0" />
                        <span className="truncate">{candidate.education}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border mt-auto flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-0.5">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-0.5">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-primary shrink-0 ml-2">{candidate.matchCount} matches</span>
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
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Candidate</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Experience</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Education</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Skills</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Matches</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    {isCompany && <th className="text-center py-2 px-2 font-medium text-muted-foreground w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => navigate(`/candidates/${candidate.id}`)}>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-foreground truncate">{candidate.name}</p>
                            {!isCompany && <p className="text-[10px] text-muted-foreground truncate">{candidate.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">{candidate.currentTitle}</td>
                      <td className="py-2 px-2 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.location}</span>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground font-mono">{candidate.experienceYears} yrs</td>
                      <td className="py-2 px-2 text-muted-foreground text-[11px]">{candidate.education || "—"}</td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[8px] px-1 py-0">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 2 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0">
                              +{candidate.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <span className="font-mono font-bold text-primary">{candidate.matchCount}</span>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className={`font-mono text-[8px] uppercase tracking-wider border-0 ${candidate.status === "active" ? "bg-green-500 text-white" : candidate.status === "passive" ? "bg-orange-400 text-white" : "bg-gray-400 text-white"}`}>
                          {formatStatus(candidate.status)}
                        </Badge>
                      </td>
                      {isCompany && (
                        <td className="py-2 px-2 text-center">
                          <button onClick={(e) => { e.stopPropagation(); toggleBookmark(e, candidate.id); }} className="hover:scale-110 transition-transform" title={bookmarkedIds.has(candidate.id) ? "Remove bookmark" : "Bookmark candidate"}>
                            <Bookmark className={`w-4 h-4 ${bookmarkedIds.has(candidate.id) ? "fill-primary text-primary" : "text-muted-foreground/40 hover:text-primary"}`} />
                          </button>
                        </td>
                      )}
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

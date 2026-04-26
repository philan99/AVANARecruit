import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useListCandidates, getListCandidatesQueryKey } from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { publicLocation } from "@/lib/display-location";
import {
  Users, Search, MapPin, Mail, X, LayoutGrid, List,
  SlidersHorizontal, ChevronDown, Check, Briefcase,
  Monitor, GraduationCap, Factory, Clock, Bookmark, Plus, Heart, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, PieChart, Pie, Cell, RadialBarChart, RadialBar, LabelList, Legend,
} from "recharts";

const PREF_JOBTYPE_COLORS = ["#ec4899", "#db2777", "#f472b6", "#f9a8d4", "#be185d", "#9d174d", "#fbcfe8", "#831843"];
const PREF_WORKPLACE_COLORS = ["#f43f5e", "#e11d48", "#fb7185", "#fda4af"];

function InsightBar({ label, value, max, color, onClick }: { label: string; value: number; max: number; color: string; onClick?: () => void }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`flex items-center gap-3 ${onClick ? "cursor-pointer hover:bg-secondary/40 rounded-md p-1 -m-1 transition-colors" : ""}`} onClick={onClick}>
      <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-secondary/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono font-semibold w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

function topN(arr: [string, number][], n = 8): [string, number][] {
  return arr.sort((a, b) => b[1] - a[1]).slice(0, n);
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
  const [showBookmarks, setShowBookmarks] = useState(urlParams.get("bookmarks") === "1");

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

  const uniqueStatuses = isCompany ? ["active", "passive"] : ["active", "passive", "not_looking"];
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
      if (isCompany && c.status === "not_looking") return false;
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

  const candidateInsights = useMemo(() => {
    const freq = (arr: (string | null | undefined)[]) => {
      const m: Record<string, number> = {};
      arr.forEach(v => { if (v) m[v] = (m[v] || 0) + 1; });
      return topN(Object.entries(m));
    };
    const freqFlat = (arr: (string[] | null | undefined)[]) => {
      const m: Record<string, number> = {};
      arr.forEach(a => (a || []).forEach(v => { if (v) m[v] = (m[v] || 0) + 1; }));
      return topN(Object.entries(m));
    };
    return {
      prefJobTypes: freqFlat(allCandidates.map(c => (c as any).preferredJobTypes)),
      prefWorkplaces: freqFlat(allCandidates.map(c => (c as any).preferredWorkplaces)),
      prefIndustries: freqFlat(allCandidates.map(c => (c as any).preferredIndustries)),
      candidateEducation: freq(allCandidates.map(c => c.education)),
    };
  }, [allCandidates]);

  const [showInsights, setShowInsights] = useState(false);

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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Users className="mr-3 text-primary" /> Talent Pool
          </h1>
          <p className="text-muted-foreground mt-1">Browse and manage candidate profiles.</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Post Job
          </Button>
        </Link>
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowInsights(s => !s)}
          className="gap-2"
          data-testid="button-toggle-insights"
        >
          <BarChart3 className="w-4 h-4" />
          {showInsights ? "Hide candidate insights" : "Show candidate insights"}
          <ChevronDown className={`w-4 h-4 transition-transform ${showInsights ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {showInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preferred Job Types — Donut chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Candidate Preferred Job Types
              </CardTitle>
              <CardDescription>What candidates in the talent pool are looking for</CardDescription>
            </CardHeader>
            <CardContent>
              {candidateInsights.prefJobTypes.length > 0 ? (
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={candidateInsights.prefJobTypes.map(([type, count]) => ({ name: formatJobType(type), value: count, key: type }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        onClick={(d: any) => d?.key && setJobTypeFilters(new Set([d.key]))}
                        cursor="pointer"
                      >
                        {candidateInsights.prefJobTypes.map((_, i) => (
                          <Cell key={i} fill={PREF_JOBTYPE_COLORS[i % PREF_JOBTYPE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No preference data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Preferred Workplaces — Radial bar chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Candidate Preferred Workplaces
              </CardTitle>
              <CardDescription>Where candidates in the talent pool want to work</CardDescription>
            </CardHeader>
            <CardContent>
              {candidateInsights.prefWorkplaces.length > 0 ? (
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="25%"
                      outerRadius="95%"
                      data={candidateInsights.prefWorkplaces.map(([wp, count], i) => ({
                        name: formatWorkplace(wp),
                        value: count,
                        key: wp,
                        fill: PREF_WORKPLACE_COLORS[i % PREF_WORKPLACE_COLORS.length],
                      }))}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        onClick={(d: any) => d?.key && setWorkplaceFilters(new Set([d.key]))}
                        cursor="pointer"
                      />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No preference data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Preferred Industries — Horizontal bar chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Candidate Preferred Industries
              </CardTitle>
              <CardDescription>Industries candidates in the talent pool are interested in</CardDescription>
            </CardHeader>
            <CardContent>
              {candidateInsights.prefIndustries.length > 0 ? (
                <div style={{ height: Math.max(180, candidateInsights.prefIndustries.length * 32) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={candidateInsights.prefIndustries.map(([ind, count]) => ({ name: formatIndustry(ind), value: count, key: ind }))}
                      margin={{ top: 4, right: 28, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={120} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--secondary)/0.4)' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#d946ef"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={22}
                        onClick={(d: any) => d?.key && setIndustryFilters(new Set([d.key]))}
                        cursor="pointer"
                      >
                        <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No preference data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Education — Vertical bar chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Candidate Education Levels
              </CardTitle>
              <CardDescription>Qualifications held by candidates in the talent pool</CardDescription>
            </CardHeader>
            <CardContent>
              {candidateInsights.candidateEducation.length > 0 ? (
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={candidateInsights.candidateEducation.map(([edu, count]) => ({ name: edu, value: count, key: edu }))}
                      margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--secondary)/0.4)' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                        onClick={(d: any) => d?.key && setEducationFilters(new Set([d.key]))}
                        cursor="pointer"
                      >
                        <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No education data yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
                      <span className="truncate">{publicLocation(candidate)}</span>
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
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{publicLocation(candidate)}</span>
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

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";
import { useIndustries } from "@/hooks/use-industries";
import { publicLocation } from "@/lib/display-location";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Building, Briefcase, PoundSterling, Heart, LayoutGrid, List, SlidersHorizontal, X, GraduationCap, ChevronDown, Check, Monitor, Factory, FileText, BookmarkPlus, Bookmark, Trash2, BarChart3, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, PieChart, Pie, Cell, RadialBarChart, RadialBar, LabelList, Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const BROWSE_JOBTYPE_COLORS = ["#10b981", "#059669", "#34d399", "#6ee7b7", "#047857", "#065f46", "#a7f3d0", "#064e3b"];
const BROWSE_WORKPLACE_COLORS = ["#14b8a6", "#0d9488", "#2dd4bf", "#5eead4"];

type SavedSearchFilters = {
  search?: string;
  companyFilters?: string[];
  levelFilters?: string[];
  locationFilters?: string[];
  salaryEnabled?: boolean;
  salaryRange?: [number, number];
  skillFilters?: string[];
  jobTypeFilters?: string[];
  workplaceFilters?: string[];
  industryFilters?: string[];
  educationFilters?: string[];
};

type SavedSearch = {
  id: number;
  name: string;
  filters: SavedSearchFilters;
  createdAt: string;
};

const JOB_TYPE_LABELS: Record<string, string> = {
  permanent_full_time: "Permanent (Full Time)",
  contract: "Contract",
  fixed_term_contract: "Fixed Term Contract",
  part_time: "Part-time",
  temporary: "Temporary",
};
const JOB_TYPE_OPTIONS = Object.keys(JOB_TYPE_LABELS);

const WORKPLACE_LABELS: Record<string, string> = {
  office: "Office",
  remote: "Remote",
  hybrid: "Hybrid",
};
const WORKPLACE_OPTIONS = Object.keys(WORKPLACE_LABELS);

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
  executive: "Executive",
};
const EXPERIENCE_LEVEL_OPTIONS = Object.keys(EXPERIENCE_LEVEL_LABELS);

const EDUCATION_LEVEL_OPTIONS = [
  "GCSE",
  "A-Level",
  "HND/HNC",
  "Foundation Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
];

function MultiSelectDropdown({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  formatLabel,
}: {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: Set<string>;
  onChange: (val: Set<string>) => void;
  formatLabel?: (val: string) => string;
}) {
  const fmt = formatLabel || ((v: string) => v);
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

  const filtered = filterText
    ? options.filter(o => o.toLowerCase().includes(filterText.toLowerCase()))
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
                <span className="truncate capitalize">{fmt(option)}</span>
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

export default function BrowseJobs() {
  const searchString = useSearch();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const [search, setSearch] = useState("");
  const [companyFilters, setCompanyFilters] = useState<Set<string>>(new Set());
  const [levelFilters, setLevelFilters] = useState<Set<string>>(new Set());
  const [locationFilters, setLocationFilters] = useState<Set<string>>(new Set());
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 200000]);
  const [salaryEnabled, setSalaryEnabled] = useState(false);
  const [skillFilters, setSkillFilters] = useState<Set<string>>(new Set());
  const [jobTypeFilters, setJobTypeFilters] = useState<Set<string>>(new Set());
  const [workplaceFilters, setWorkplaceFilters] = useState<Set<string>>(new Set());
  const [industryFilters, setIndustryFilters] = useState<Set<string>>(new Set());
  const [educationFilters, setEducationFilters] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [showFavourites, setShowFavourites] = useState(params.get("favourites") === "1");
  const [showFilters, setShowFilters] = useState(false);
  const [, navigate] = useLocation();
  const { candidateProfileId } = useRole();
  const [favouriteJobIds, setFavouriteJobIds] = useState<Set<number>>(new Set());
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const { toast } = useToast();

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const fetchFavourites = useCallback(async () => {
    if (!candidateProfileId) return;
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/favourites`);
      if (res.ok) {
        const data = await res.json();
        setFavouriteJobIds(new Set(data.map((f: any) => f.jobId)));
      }
    } catch {}
  }, [candidateProfileId, apiBase]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const fetchSavedSearches = useCallback(async () => {
    if (!candidateProfileId) return;
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/saved-searches`);
      if (res.ok) setSavedSearches(await res.json());
    } catch {}
  }, [candidateProfileId, apiBase]);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  function applySavedSearch(s: SavedSearch) {
    const f = s.filters || {};
    setSearch(f.search ?? "");
    setCompanyFilters(new Set(f.companyFilters ?? []));
    setLevelFilters(new Set(f.levelFilters ?? []));
    setLocationFilters(new Set(f.locationFilters ?? []));
    setSalaryEnabled(!!f.salaryEnabled);
    setSalaryRange(f.salaryRange ?? [0, 200000]);
    setSkillFilters(new Set(f.skillFilters ?? []));
    setJobTypeFilters(new Set(f.jobTypeFilters ?? []));
    setWorkplaceFilters(new Set(f.workplaceFilters ?? []));
    setIndustryFilters(new Set(f.industryFilters ?? []));
    setEducationFilters(new Set(f.educationFilters ?? []));
    toast({ title: "Search loaded", description: `Applied "${s.name}".` });
  }

  async function saveCurrentSearch() {
    if (!candidateProfileId) return;
    const name = saveName.trim();
    if (!name) return;
    const filters: SavedSearchFilters = {
      search,
      companyFilters: Array.from(companyFilters),
      levelFilters: Array.from(levelFilters),
      locationFilters: Array.from(locationFilters),
      salaryEnabled,
      salaryRange,
      skillFilters: Array.from(skillFilters),
      jobTypeFilters: Array.from(jobTypeFilters),
      workplaceFilters: Array.from(workplaceFilters),
      industryFilters: Array.from(industryFilters),
      educationFilters: Array.from(educationFilters),
    };
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/saved-searches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, filters }),
      });
      if (!res.ok) throw new Error("save failed");
      await fetchSavedSearches();
      setSaveDialogOpen(false);
      setSaveName("");
      toast({ title: "Search saved", description: `"${name}" added to your saved searches.` });
    } catch {
      toast({ title: "Could not save search", variant: "destructive" });
    }
  }

  async function deleteSavedSearch(id: number) {
    if (!candidateProfileId) return;
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`${apiBase}/candidates/${candidateProfileId}/saved-searches/${id}`, {
        method: "DELETE",
      });
    } catch {
      fetchSavedSearches();
    }
  }

  async function toggleFavourite(e: React.MouseEvent, jobId: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!candidateProfileId) return;

    const isFav = favouriteJobIds.has(jobId);
    if (isFav) {
      setFavouriteJobIds(prev => { const next = new Set(prev); next.delete(jobId); return next; });
      await fetch(`${apiBase}/candidates/${candidateProfileId}/favourites/${jobId}`, { method: "DELETE" });
    } else {
      setFavouriteJobIds(prev => new Set(prev).add(jobId));
      await fetch(`${apiBase}/candidates/${candidateProfileId}/favourites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
    }
  }

  const queryParams = {
    status: "open" as const,
    ...(search ? { search } : {}),
  };

  const { data: jobs, isLoading } = useListJobs(queryParams, {
    query: { queryKey: getListJobsQueryKey(queryParams) },
  });

  const allOpenParams = { status: "open" as const };
  const { data: allOpenJobs } = useListJobs(allOpenParams, {
    query: { queryKey: getListJobsQueryKey(allOpenParams) },
  });

  const { data: industriesData = [] } = useIndustries();

  const uniqueCompanies = useMemo(() => {
    if (!allOpenJobs) return [];
    const companies = new Set(allOpenJobs.map(j => j.company).filter(Boolean));
    return Array.from(companies).sort();
  }, [allOpenJobs]);

  const uniqueLocations = useMemo(() => {
    if (!allOpenJobs) return [];
    const locations = new Set(allOpenJobs.map(j => publicLocation(j)).filter(Boolean));
    return Array.from(locations).sort();
  }, [allOpenJobs]);

  const uniqueSkills = useMemo(() => {
    if (!allOpenJobs) return [];
    const skills = new Set(allOpenJobs.flatMap(j => j.skills || []));
    return Array.from(skills).sort();
  }, [allOpenJobs]);

  const uniqueLevels = EXPERIENCE_LEVEL_OPTIONS;
  const uniqueJobTypes = JOB_TYPE_OPTIONS;
  const uniqueWorkplaces = WORKPLACE_OPTIONS;
  const uniqueIndustries = useMemo(
    () => industriesData.map((i) => i.value),
    [industriesData],
  );
  const industryLabelMap = useMemo(() => {
    const m: Record<string, string> = {};
    industriesData.forEach((i) => { m[i.value] = i.label; });
    return m;
  }, [industriesData]);
  const uniqueEducationLevels = EDUCATION_LEVEL_OPTIONS;

  const jobInsights = useMemo(() => {
    const list = allOpenJobs ?? [];
    const freq = (vals: (string | null | undefined)[]) => {
      const m: Record<string, number> = {};
      vals.forEach(v => { if (v) m[v] = (m[v] || 0) + 1; });
      return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8) as [string, number][];
    };
    const expCounts: Record<string, number> = {};
    list.forEach(j => {
      const lvl = (j.experienceLevel || "").toLowerCase();
      if (lvl) expCounts[lvl] = (expCounts[lvl] || 0) + 1;
    });
    const experienceLevels: [string, number][] = EXPERIENCE_LEVEL_OPTIONS
      .filter(k => expCounts[k])
      .map(k => [k, expCounts[k]] as [string, number]);

    const skillCounts: Record<string, number> = {};
    list.forEach(j => (j.skills || []).forEach(s => { if (s) skillCounts[s] = (skillCounts[s] || 0) + 1; }));
    const skills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 10) as [string, number][];

    return {
      jobTypes: freq(list.map(j => (j as any).jobType)),
      workplaces: freq(list.map(j => (j as any).workplace)),
      industries: freq(list.map(j => (j as any).industry)),
      experienceLevels,
      locations: freq(list.map(j => publicLocation(j))),
      skills,
    };
  }, [allOpenJobs]);

  const [showJobInsights, setShowJobInsights] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (companyFilters.size > 0) count += companyFilters.size;
    if (levelFilters.size > 0) count += levelFilters.size;
    if (locationFilters.size > 0) count += locationFilters.size;
    if (salaryEnabled) count++;
    if (skillFilters.size > 0) count += skillFilters.size;
    if (jobTypeFilters.size > 0) count += jobTypeFilters.size;
    if (workplaceFilters.size > 0) count += workplaceFilters.size;
    if (industryFilters.size > 0) count += industryFilters.size;
    if (educationFilters.size > 0) count += educationFilters.size;
    return count;
  }, [companyFilters, levelFilters, locationFilters, salaryEnabled, skillFilters, jobTypeFilters, workplaceFilters, industryFilters, educationFilters]);

  function clearAllFilters() {
    setCompanyFilters(new Set());
    setLevelFilters(new Set());
    setLocationFilters(new Set());
    setSalaryEnabled(false);
    setSalaryRange([0, 200000]);
    setSkillFilters(new Set());
    setJobTypeFilters(new Set());
    setWorkplaceFilters(new Set());
    setIndustryFilters(new Set());
    setEducationFilters(new Set());
    setSearch("");
  }

  const displayedJobs = useMemo(() => {
    let result = jobs;
    if (showFavourites) {
      result = result?.filter((job) => favouriteJobIds.has(job.id));
    }
    if (companyFilters.size > 0) {
      result = result?.filter((job) => companyFilters.has(job.company));
    }
    if (levelFilters.size > 0) {
      result = result?.filter((job) => levelFilters.has(job.experienceLevel));
    }
    if (locationFilters.size > 0) {
      result = result?.filter((job) => locationFilters.has(publicLocation(job) ?? ""));
    }
    if (salaryEnabled) {
      result = result?.filter((job) => {
        const min = job.salaryMin || 0;
        const max = job.salaryMax || 0;
        if (min === 0 && max === 0) return true;
        return max >= salaryRange[0] && min <= salaryRange[1];
      });
    }
    if (skillFilters.size > 0) {
      result = result?.filter((job) => job.skills?.some(s => skillFilters.has(s)));
    }
    if (jobTypeFilters.size > 0) {
      result = result?.filter((job) => jobTypeFilters.has((job as any).jobType));
    }
    if (workplaceFilters.size > 0) {
      result = result?.filter((job) => workplaceFilters.has((job as any).workplace));
    }
    if (industryFilters.size > 0) {
      result = result?.filter((job) => industryFilters.has((job as any).industry));
    }
    if (educationFilters.size > 0) {
      result = result?.filter((job) => educationFilters.has((job as any).educationLevel));
    }
    return result;
  }, [jobs, showFavourites, favouriteJobIds, companyFilters, levelFilters, locationFilters, salaryEnabled, salaryRange, skillFilters, jobTypeFilters, workplaceFilters, industryFilters, educationFilters]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Briefcase className="mr-3 text-primary" /> Browse Jobs
          </h1>
          <p className="text-muted-foreground mt-1">Explore open positions from companies on the platform.</p>
        </div>
        <Button
          size="lg"
          className="font-mono tracking-tight"
          variant={showFavourites ? "default" : "outline"}
          onClick={() => setShowFavourites(!showFavourites)}
        >
          <Heart className={`w-4 h-4 mr-2 ${showFavourites ? "fill-white" : ""}`} />
          {showFavourites ? "Show All Jobs" : "Show Favourites"}
        </Button>
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowJobInsights(s => !s)}
          className="gap-2"
          data-testid="button-toggle-job-insights"
        >
          <BarChart3 className="w-4 h-4" />
          {showJobInsights ? "Hide job insights" : "Show job insights"}
          <ChevronDown className={`w-4 h-4 transition-transform ${showJobInsights ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {showJobInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs by Job Type — Donut chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Open Jobs by Job Type
              </CardTitle>
              <p className="text-sm text-muted-foreground">Permanent, contract, part-time and more</p>
            </CardHeader>
            <CardContent>
              {jobInsights.jobTypes.length > 0 ? (
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobInsights.jobTypes.map(([type, count]) => ({ name: JOB_TYPE_LABELS[type] || type, value: count, key: type }))}
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
                        {jobInsights.jobTypes.map((_, i) => (
                          <Cell key={i} fill={BROWSE_JOBTYPE_COLORS[i % BROWSE_JOBTYPE_COLORS.length]} />
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
                <p className="text-sm text-muted-foreground text-center py-4">No open jobs yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Jobs by Workplace — Radial bar chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Open Jobs by Workplace
              </CardTitle>
              <p className="text-sm text-muted-foreground">Office, remote, or hybrid</p>
            </CardHeader>
            <CardContent>
              {jobInsights.workplaces.length > 0 ? (
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="25%"
                      outerRadius="95%"
                      data={jobInsights.workplaces.map(([wp, count], i) => ({
                        name: WORKPLACE_LABELS[wp] || wp,
                        value: count,
                        key: wp,
                        fill: BROWSE_WORKPLACE_COLORS[i % BROWSE_WORKPLACE_COLORS.length],
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
                <p className="text-sm text-muted-foreground text-center py-4">No open jobs yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Jobs by Industry — Horizontal bar chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Factory className="w-4 h-4" />
                Open Jobs by Industry
              </CardTitle>
              <p className="text-sm text-muted-foreground">Top hiring sectors right now</p>
            </CardHeader>
            <CardContent>
              {jobInsights.industries.length > 0 ? (
                <div style={{ height: Math.max(180, jobInsights.industries.length * 32) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={jobInsights.industries.map(([ind, count]) => ({ name: industryLabelMap[ind] || ind, value: count, key: ind }))}
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
                        fill="#f59e0b"
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
                <p className="text-sm text-muted-foreground text-center py-4">No industry data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Jobs by Experience Level — Vertical bar chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Open Jobs by Experience Level
              </CardTitle>
              <p className="text-sm text-muted-foreground">Seniority mix across open roles</p>
            </CardHeader>
            <CardContent>
              {jobInsights.experienceLevels.length > 0 ? (
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={jobInsights.experienceLevels.map(([lvl, count]) => ({ name: EXPERIENCE_LEVEL_LABELS[lvl] || lvl, value: count, key: lvl }))}
                      margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--secondary)/0.4)' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                        onClick={(d: any) => d?.key && setLevelFilters(new Set([d.key]))}
                        cursor="pointer"
                      >
                        <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No experience-level data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Open Jobs by Location — Horizontal bar chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Open Jobs by Location
              </CardTitle>
              <p className="text-sm text-muted-foreground">Top hiring cities and regions</p>
            </CardHeader>
            <CardContent>
              {jobInsights.locations.length > 0 ? (
                <div style={{ height: Math.max(180, jobInsights.locations.length * 32) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={jobInsights.locations.map(([loc, count]) => ({ name: loc, value: count, key: loc }))}
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
                        fill="#0ea5e9"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={22}
                        onClick={(d: any) => d?.key && setLocationFilters(new Set([d.key]))}
                        cursor="pointer"
                      >
                        <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No location data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Open Jobs by Skill — Vertical bar chart */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Most In-Demand Skills
              </CardTitle>
              <p className="text-sm text-muted-foreground">Top skills employers are asking for</p>
            </CardHeader>
            <CardContent>
              {jobInsights.skills.length > 0 ? (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={jobInsights.skills.map(([skill, count]) => ({ name: skill, value: count, key: skill }))}
                      margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={70} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: 12 }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--secondary)/0.4)' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={36}
                        onClick={(d: any) => d?.key && setSkillFilters(new Set([d.key]))}
                        cursor="pointer"
                      >
                        <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No skill data yet.</p>
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
              placeholder="Search jobs by title, company, or location..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5 mr-1" /> Clear all
            </Button>
          )}
          {candidateProfileId && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                    Saved Searches
                    {savedSearches.length > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-muted text-foreground text-[10px] font-bold px-1">
                        {savedSearches.length}
                      </span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72">
                  <DropdownMenuLabel>Your saved searches</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {savedSearches.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                      No saved searches yet.
                    </div>
                  ) : (
                    savedSearches.map((s) => (
                      <DropdownMenuItem
                        key={s.id}
                        onSelect={(e) => { e.preventDefault(); applySavedSearch(s); }}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="flex-1 truncate">{s.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteSavedSearch(s.id); }}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Delete saved search"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveDialogOpen(true)}
                disabled={activeFilterCount === 0 && !search}
                title={activeFilterCount === 0 && !search ? "Apply some filters first" : "Save this search"}
              >
                <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
            </>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Type</label>
                  <MultiSelectDropdown
                    label="Job Types"
                    icon={FileText}
                    options={uniqueJobTypes}
                    selected={jobTypeFilters}
                    onChange={setJobTypeFilters}
                    formatLabel={(v) => JOB_TYPE_LABELS[v] || v}
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
                    formatLabel={(v) => WORKPLACE_LABELS[v] || v}
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
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill</label>
                  <MultiSelectDropdown
                    label="Skills"
                    icon={Briefcase}
                    options={uniqueSkills}
                    selected={skillFilters}
                    onChange={setSkillFilters}
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
                    formatLabel={(v) => industryLabelMap[v] || v}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Education Required</label>
                  <MultiSelectDropdown
                    label="Education"
                    icon={GraduationCap}
                    options={uniqueEducationLevels}
                    selected={educationFilters}
                    onChange={setEducationFilters}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Salary Range</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
                      <Input
                        type="number"
                        placeholder="Min"
                        className="pl-6 bg-background text-sm h-9"
                        value={salaryEnabled ? salaryRange[0] || "" : ""}
                        onChange={(e) => {
                          setSalaryEnabled(true);
                          setSalaryRange([Number(e.target.value) || 0, salaryRange[1]]);
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground text-xs">–</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        className="pl-6 bg-background text-sm h-9"
                        value={salaryEnabled ? salaryRange[1] || "" : ""}
                        onChange={(e) => {
                          setSalaryEnabled(true);
                          setSalaryRange([salaryRange[0], Number(e.target.value) || 200000]);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Active:</span>
                  {Array.from(companyFilters).map(c => (
                    <span key={`company-${c}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {c}
                      <button onClick={() => { const n = new Set(companyFilters); n.delete(c); setCompanyFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(levelFilters).map(l => (
                    <span key={`level-${l}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1 capitalize">
                      {l}
                      <button onClick={() => { const n = new Set(levelFilters); n.delete(l); setLevelFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(locationFilters).map(loc => (
                    <span key={`loc-${loc}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {loc}
                      <button onClick={() => { const n = new Set(locationFilters); n.delete(loc); setLocationFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(skillFilters).map(s => (
                    <span key={`skill-${s}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {s}
                      <button onClick={() => { const n = new Set(skillFilters); n.delete(s); setSkillFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(jobTypeFilters).map(v => (
                    <span key={`jt-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {JOB_TYPE_LABELS[v] || v}
                      <button onClick={() => { const n = new Set(jobTypeFilters); n.delete(v); setJobTypeFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(workplaceFilters).map(v => (
                    <span key={`wp-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {WORKPLACE_LABELS[v] || v}
                      <button onClick={() => { const n = new Set(workplaceFilters); n.delete(v); setWorkplaceFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(industryFilters).map(v => (
                    <span key={`ind-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {industryLabelMap[v] || v}
                      <button onClick={() => { const n = new Set(industryFilters); n.delete(v); setIndustryFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(educationFilters).map(v => (
                    <span key={`edu-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1 capitalize">
                      {v}
                      <button onClick={() => { const n = new Set(educationFilters); n.delete(v); setEducationFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {salaryEnabled && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      £{salaryRange[0].toLocaleString()} – £{salaryRange[1].toLocaleString()}
                      <button onClick={() => { setSalaryEnabled(false); setSalaryRange([0, 200000]); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {!isLoading && displayedJobs && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{displayedJobs.length}</span> {displayedJobs.length === 1 ? "position" : "positions"}
            {activeFilterCount > 0 && <span> (filtered)</span>}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground font-mono">Loading opportunities...</div>
      ) : displayedJobs?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground font-mono">
          {showFavourites ? "You haven't added any favourites yet." : "No open positions found."}
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedJobs?.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card h-full flex flex-col relative">
                <button
                  onClick={(e) => toggleFavourite(e, job.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      favouriteJobIds.has(job.id)
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground/40 hover:text-red-400"
                    }`}
                  />
                </button>
                <CardHeader className="pb-3">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider w-fit mb-2">
                    {job.experienceLevel}
                  </Badge>
                  <CardTitle className="text-lg leading-tight line-clamp-2 pr-8">{job.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building className="w-3.5 h-3.5 mr-2" />
                      <span className="truncate">{job.company}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-2" />
                      <span className="truncate">{publicLocation(job)}</span>
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <PoundSterling className="w-3.5 h-3.5 mr-2" />
                        <span className="font-mono text-xs">
                          £{(job.salaryMin || 0).toLocaleString()} - £{(job.salaryMax || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-border mt-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-0.5">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-0.5">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-card">
          <CardContent className="pt-4 pb-2">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Job Title</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Company</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Level</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Salary</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Skills</th>
                  <th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground w-12"></th>
                </tr>
              </thead>
              <tbody>
                {displayedJobs?.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      navigate(`/jobs/${job.id}`);
                    }}
                  >
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium text-foreground">{job.title}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{job.company}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{publicLocation(job)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                        {job.experienceLevel}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-sm text-muted-foreground font-mono">
                      {job.salaryMin || job.salaryMax
                        ? `£${(job.salaryMin || 0).toLocaleString()} - £${(job.salaryMax || 0).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-0.5">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-0.5">
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => toggleFavourite(e, job.id)}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            favouriteJobIds.has(job.id)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground/40 hover:text-red-400"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this search</DialogTitle>
            <DialogDescription>
              Give this combination of filters a name so you can re-apply it with one click.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</label>
            <Input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Senior React roles in London"
              onKeyDown={(e) => { if (e.key === "Enter") saveCurrentSearch(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCurrentSearch} disabled={!saveName.trim()}>Save search</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

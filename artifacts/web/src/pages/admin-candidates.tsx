import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { PasswordStrength } from "@/components/password-strength";
import { Users, Search, X, KeyRound, SlidersHorizontal, ChevronDown, Check, MapPin, Briefcase, Building, GraduationCap, Monitor, LayoutGrid, List, LogIn, ShieldCheck, Calendar, ArrowUp, ArrowDown, Download, FlaskConical, RotateCcw } from "lucide-react";
import { useRole } from "@/contexts/role-context";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCandidateQueryKey, getGetCandidateMatchesQueryKey } from "@workspace/api-client-react";
import * as XLSX from "xlsx";

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
  preferredJobTypes: string[];
  preferredWorkplaces: string[];
  preferredIndustries: string[];
  qualifications: string[];
  verifiedCount?: number;
}

const PLACEHOLDER_VALUES = ["not specified", "not provided"];
function isFilled(val: any): boolean {
  if (val === null || val === undefined) return false;
  const s = String(val).trim().toLowerCase();
  if (!s) return false;
  return !PLACEHOLDER_VALUES.includes(s);
}
function profileCompletion(c: Candidate): number {
  const checks: boolean[] = [
    isFilled(c.name),
    isFilled(c.email),
    isFilled(c.phone),
    isFilled(c.location),
    isFilled(c.currentTitle),
    c.experienceYears > 0,
    isFilled(c.summary),
    Array.isArray(c.skills) && c.skills.length > 0 && !(c.skills.length === 1 && c.skills[0]?.toLowerCase() === "general"),
    isFilled(c.education),
    Array.isArray(c.qualifications) && c.qualifications.length > 0,
    Array.isArray(c.preferredJobTypes) && c.preferredJobTypes.length > 0,
    Array.isArray(c.preferredWorkplaces) && c.preferredWorkplaces.length > 0,
    Array.isArray(c.preferredIndustries) && c.preferredIndustries.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameSort, setNameSort] = useState<"asc" | "desc">("asc");
  const [resetTarget, setResetTarget] = useState<Candidate | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { impersonateCandidate } = useRole();
  const queryClient = useQueryClient();

  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);

  const [searchQuery, setSearchQuery] = useState(urlParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  const [statusFilters, setStatusFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("status");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [locationFilters, setLocationFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("location");
    return v && v !== "all" ? new Set([v]) : new Set();
  });
  const [skillFilters, setSkillFilters] = useState<Set<string>>(() => {
    const v = urlParams.get("skill");
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
    const skill = params.get("skill");
    setSkillFilters(skill && skill !== "all" ? new Set([skill]) : new Set());
    const jobType = params.get("jobType");
    setJobTypeFilters(jobType && jobType !== "all" ? new Set([jobType]) : new Set());
    const workplace = params.get("workplace");
    setWorkplaceFilters(workplace && workplace !== "all" ? new Set([workplace]) : new Set());
    const industry = params.get("industry");
    setIndustryFilters(industry && industry !== "all" ? new Set([industry]) : new Set());
    const education = params.get("education");
    setEducationFilters(education && education !== "all" ? new Set([education]) : new Set());

    const hasAny = status || location || skill || jobType || workplace || industry || education;
    if (hasAny) setShowFilters(true);
  }, [searchString]);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${basePath}/admin/candidates`);
        if (res.ok) setCandidates(await res.json());
      } catch (err) {
        console.error("Failed to fetch candidates", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [basePath]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set(candidates.map(c => c.location).filter(Boolean));
    return Array.from(locs).sort();
  }, [candidates]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set(candidates.flatMap(c => c.skills));
    return Array.from(skills).sort();
  }, [candidates]);

  const uniqueJobTypes = useMemo(() => {
    const types = new Set(candidates.flatMap(c => c.preferredJobTypes || []));
    return Array.from(types).sort();
  }, [candidates]);

  const uniqueWorkplaces = useMemo(() => {
    const wps = new Set(candidates.flatMap(c => c.preferredWorkplaces || []));
    return Array.from(wps).sort();
  }, [candidates]);

  const uniqueIndustries = useMemo(() => {
    const inds = new Set(candidates.flatMap(c => c.preferredIndustries || []));
    return Array.from(inds).sort();
  }, [candidates]);

  const uniqueEducation = useMemo(() => {
    const edus = new Set(candidates.map(c => c.education).filter(Boolean));
    return Array.from(edus).sort();
  }, [candidates]);

  const uniqueStatuses = ["active", "passive", "not_looking"];

  const filtered = useMemo(() => {
    const list = candidates.filter(c => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.currentTitle.toLowerCase().includes(q) ||
          c.skills.some(s => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (statusFilters.size > 0 && !statusFilters.has(c.status)) return false;
      if (locationFilters.size > 0 && !locationFilters.has(c.location)) return false;
      if (skillFilters.size > 0 && !c.skills.some(s => skillFilters.has(s))) return false;
      if (jobTypeFilters.size > 0 && !(c.preferredJobTypes || []).some(t => jobTypeFilters.has(t))) return false;
      if (workplaceFilters.size > 0 && !(c.preferredWorkplaces || []).some(w => workplaceFilters.has(w))) return false;
      if (industryFilters.size > 0 && !(c.preferredIndustries || []).some(i => industryFilters.has(i))) return false;
      if (educationFilters.size > 0 && !educationFilters.has(c.education)) return false;
      return true;
    });
    const sorted = [...list].sort((a, b) => {
      const cmp = (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
      return nameSort === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [candidates, searchQuery, statusFilters, locationFilters, skillFilters, jobTypeFilters, workplaceFilters, industryFilters, educationFilters, nameSort]);

  const activeFilterCount = useMemo(() => {
    return statusFilters.size + locationFilters.size + skillFilters.size + jobTypeFilters.size + workplaceFilters.size + industryFilters.size + educationFilters.size;
  }, [statusFilters, locationFilters, skillFilters, jobTypeFilters, workplaceFilters, industryFilters, educationFilters]);

  const hasActiveFilters = searchQuery || activeFilterCount > 0;

  function exportToExcel() {
    if (filtered.length === 0) return;
    const rows = filtered.map(c => ({
      Name: c.name || "",
      Email: c.email || "",
      Phone: c.phone || "",
      "Current Title": c.currentTitle || "",
      Location: c.location || "",
      "Experience (years)": c.experienceYears ?? 0,
      Education: c.education || "",
      Status: c.status === "not_looking" ? "Not Looking" : (c.status || ""),
      "Profile %": profileCompletion(c),
      Verified: (c.verifiedCount ?? 0) > 0 ? "Yes" : "No",
      Skills: (c.skills || []).join(", "),
      Qualifications: (c.qualifications || []).join(", "),
      "Preferred Job Types": (c.preferredJobTypes || []).map(formatJobType).join(", "),
      "Preferred Workplaces": (c.preferredWorkplaces || []).map(formatWorkplace).join(", "),
      "Preferred Industries": (c.preferredIndustries || []).join(", "),
      Summary: c.summary || "",
      Created: c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : "",
      Updated: c.updatedAt ? new Date(c.updatedAt).toISOString().slice(0, 10) : "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0]).map(key => {
      const maxLen = Math.max(key.length, ...rows.map(r => String((r as any)[key] ?? "").length));
      return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
    });
    (ws as any)["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `avana-candidates-${stamp}.xlsx`);
    toast({ title: `Exported ${rows.length} candidate${rows.length === 1 ? "" : "s"}` });
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilters(new Set());
    setLocationFilters(new Set());
    setSkillFilters(new Set());
    setJobTypeFilters(new Set());
    setWorkplaceFilters(new Set());
    setIndustryFilters(new Set());
    setEducationFilters(new Set());
  }

  async function handleResetPassword() {
    if (!resetTarget) return;
    {
      const { ok, failed } = validatePassword(newPassword);
      if (!ok) {
        toast({ title: "Password doesn't meet requirements", description: failed[0].label, variant: "destructive" });
        return;
      }
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`${basePath}/admin/candidates/${resetTarget.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        toast({ title: "Password Reset", description: `Password has been reset for ${resetTarget.name}.` });
        setResetTarget(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to reset password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to reset password.", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading candidates...</div>;
  }

  async function startDemoCandidate() {
    try {
      const res = await fetch(`${basePath}/admin/demo-candidate/reset`, { method: "POST" });
      if (!res.ok) throw new Error();
      const demo = await res.json();
      await queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(demo.id) });
      await queryClient.invalidateQueries({ queryKey: getGetCandidateMatchesQueryKey(demo.id) });
      toast({ title: "Demo candidate ready", description: "Wizard reset to step 1." });
      impersonateCandidate(demo.id, demo.email);
      navigate("/onboarding");
    } catch {
      toast({ title: "Error", description: "Failed to reset the demo candidate.", variant: "destructive" });
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Users className="mr-3 text-primary" /> Candidates
          </h1>
          <p className="text-muted-foreground mt-1">{candidates.length} candidate profiles on the platform.</p>
        </div>
        <Card className="bg-card border-amber-500/30 shrink-0">
          <CardContent className="p-3 flex items-center gap-3">
            <FlaskConical className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-foreground">Demo candidate</div>
              <div className="text-muted-foreground">Test the CV wizard end-to-end without affecting live data.</div>
            </div>
            <Button size="sm" onClick={startDemoCandidate} className="ml-1 shrink-0">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset &amp; Test
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, title, or skill..."
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
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={filtered.length === 0}
            title={hasActiveFilters ? "Export filtered candidates" : "Export all candidates"}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
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
                    formatOption={(v) => v === "not_looking" ? "Not Looking" : v.charAt(0).toUpperCase() + v.slice(1)}
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Education</label>
                  <MultiSelectDropdown
                    label="Education"
                    icon={GraduationCap}
                    options={uniqueEducation}
                    selected={educationFilters}
                    onChange={setEducationFilters}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pref. Job Type</label>
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pref. Workplace</label>
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pref. Industry</label>
                  <MultiSelectDropdown
                    label="Industries"
                    icon={Building}
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
                      {v === "not_looking" ? "Not Looking" : v.charAt(0).toUpperCase() + v.slice(1)}
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

      {candidates.length > 0 && (() => {
        const statusCounts = new Map<string, number>();
        const locationCounts = new Map<string, number>();
        const jobTypeCounts = new Map<string, number>();
        for (const c of candidates) {
          if (c.status) statusCounts.set(c.status, (statusCounts.get(c.status) || 0) + 1);
          if (c.location) locationCounts.set(c.location, (locationCounts.get(c.location) || 0) + 1);
          for (const t of c.preferredJobTypes || []) {
            jobTypeCounts.set(t, (jobTypeCounts.get(t) || 0) + 1);
          }
        }
        const statusOrder = ["active", "passive", "not_looking"];
        const statusEntries = statusOrder
          .filter(s => statusCounts.has(s))
          .map(s => [s, statusCounts.get(s)!] as [string, number]);
        const locationEntries = Array.from(locationCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
        const jobTypeEntries = Array.from(jobTypeCounts.entries()).sort((a, b) => b[1] - a[1]);
        const statusColors: Record<string, string> = {
          active: "bg-green-500",
          passive: "bg-orange-400",
          not_looking: "bg-gray-400",
        };
        const formatStatus = (s: string) =>
          s === "not_looking" ? "Not Looking" : s.charAt(0).toUpperCase() + s.slice(1);

        const Bar = ({
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

        const statusMax = Math.max(1, ...statusEntries.map(([, v]) => v));
        const locationMax = Math.max(1, ...locationEntries.map(([, v]) => v));
        const jobTypeMax = Math.max(1, ...jobTypeEntries.map(([, v]) => v));

        return (
          <Card className="bg-card">
            <CardContent className="pt-5 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Candidates by Status</h3>
                  </div>
                  <div className="space-y-2.5">
                    {statusEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : statusEntries.map(([s, v]) => (
                      <Bar
                        key={s}
                        label={formatStatus(s)}
                        value={v}
                        max={statusMax}
                        active={statusFilters.has(s)}
                        color={statusColors[s] || "bg-primary"}
                        onClick={() => toggle(statusFilters, s, setStatusFilters)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Candidates by Location</h3>
                    {locationCounts.size > 8 && (
                      <span className="text-[10px] text-muted-foreground">(top 8)</span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {locationEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : locationEntries.map(([l, v]) => (
                      <Bar
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
                    <h3 className="text-sm font-semibold">Candidates by Pref. Type</h3>
                  </div>
                  <div className="space-y-2.5">
                    {jobTypeEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : jobTypeEntries.map(([t, v]) => (
                      <Bar
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
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of {candidates.length} candidates
            {activeFilterCount > 0 && <span> (filtered)</span>}
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              {hasActiveFilters ? "No candidates match your filters." : "No candidates registered yet."}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((candidate) => (
            <Card
              key={candidate.id}
              className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col"
              onClick={() => navigate(`/candidates/${candidate.id}`)}
            >
              <CardContent className="pt-5 pb-4 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{candidate.name}</h3>
                      <Badge className={`text-[8px] uppercase border-0 shrink-0 ${candidate.status === 'active' ? 'bg-green-500 text-white' : candidate.status === 'passive' ? 'bg-orange-400 text-white' : 'bg-gray-400 text-white'}`}>
                        {candidate.status === "not_looking" ? "Not Looking" : candidate.status}
                      </Badge>
                      {candidate.isDemo && (
                        <Badge className="text-[8px] uppercase border-0 shrink-0 bg-amber-500 text-white">Demo</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{candidate.currentTitle}</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3 h-3 shrink-0" />
                    <span className="truncate">{candidate.education || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3 shrink-0" />
                    <span>{candidate.experienceYears} years experience</span>
                  </div>
                </div>

                {(candidate.preferredJobTypes?.length > 0 || candidate.preferredWorkplaces?.length > 0) && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(candidate.preferredJobTypes || []).map(t => (
                      <Badge key={t} variant="outline" className="text-[9px] px-1.5 py-0.5">
                        {formatJobType(t)}
                      </Badge>
                    ))}
                    {(candidate.preferredWorkplaces || []).map(w => (
                      <Badge key={w} variant="outline" className="text-[9px] px-1.5 py-0.5">
                        {formatWorkplace(w)}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-border mt-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-0.5">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 4 && (
                      <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-0.5">
                        +{candidate.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {(() => {
                  const pct = profileCompletion(candidate);
                  const verified = candidate.verifiedCount || 0;
                  const updated = new Date(candidate.updatedAt || candidate.createdAt);
                  return (
                    <div className="pt-3 mt-3 border-t border-border space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Profile completion</span>
                          <span className={`font-semibold ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-orange-600"}`}>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded bg-muted overflow-hidden">
                          <div
                            className={`h-full ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-orange-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className={`w-3 h-3 ${verified > 0 ? "text-green-600" : "text-muted-foreground/60"}`} />
                          {verified} verified
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Updated {updated.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })()}
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
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => setNameSort(s => s === "asc" ? "desc" : "asc")}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        title={`Sort by name (${nameSort === "asc" ? "A→Z, click for Z→A" : "Z→A, click for A→Z"})`}
                      >
                        Candidate
                        {nameSort === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      </button>
                    </th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Exp</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Profile %</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Verified</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Created</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Updated</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={(e) => { if ((e.target as HTMLElement).closest("button")) return; navigate(`/candidates/${candidate.id}`); }}>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px] shrink-0">
                            {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-xs text-foreground truncate">{candidate.name}</p>
                              {candidate.isDemo && (
                                <Badge className="text-[8px] uppercase border-0 shrink-0 bg-amber-500 text-white px-1 py-0">Demo</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{candidate.currentTitle}</td>
                      <td className="py-2 px-2 text-muted-foreground">{candidate.location}</td>
                      <td className="py-2 px-2 text-muted-foreground">{candidate.experienceYears}y</td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {candidate.email ? (
                          <a href={`mailto:${candidate.email}`} onClick={(e) => e.stopPropagation()} className="hover:underline truncate inline-block max-w-[180px] align-bottom">{candidate.email}</a>
                        ) : <span>—</span>}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {candidate.phone ? (
                          <a href={`tel:${candidate.phone.replace(/\s+/g, "")}`} onClick={(e) => e.stopPropagation()} className="hover:underline whitespace-nowrap">{candidate.phone}</a>
                        ) : <span>—</span>}
                      </td>
                      <td className="py-2 px-2">
                        <Badge className={`text-[8px] uppercase border-0 ${candidate.status === 'active' ? 'bg-green-500 text-white' : candidate.status === 'passive' ? 'bg-orange-400 text-white' : 'bg-gray-400 text-white'}`}>
                          {candidate.status === "not_looking" ? "Not Looking" : candidate.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        {(() => {
                          const pct = profileCompletion(candidate);
                          return (
                            <div className="flex items-center gap-1.5 min-w-[80px]">
                              <div className="h-1.5 flex-1 rounded bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-orange-500"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-semibold tabular-nums ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-orange-600"}`}>{pct}%</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] ${(candidate.verifiedCount || 0) > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                          <ShieldCheck className="w-3 h-3" />
                          {candidate.verifiedCount || 0}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {new Date(candidate.updatedAt || candidate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] gap-1 h-7 px-2"
                            onClick={() => {
                              impersonateCandidate(candidate.id, candidate.email);
                              navigate("/");
                            }}
                          >
                            <LogIn className="w-3 h-3" />
                            Login
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] gap-1 h-7 px-2"
                            onClick={() => {
                              setResetTarget(candidate);
                              setNewPassword("");
                              setConfirmPassword("");
                            }}
                          >
                            <KeyRound className="w-3 h-3" />
                            Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) setResetTarget(null); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-medium text-foreground">{resetTarget?.name}</span> ({resetTarget?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder={`Minimum ${PASSWORD_MIN_LENGTH} characters`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PasswordStrength password={newPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={resetting || !newPassword || !confirmPassword}>
              {resetting ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

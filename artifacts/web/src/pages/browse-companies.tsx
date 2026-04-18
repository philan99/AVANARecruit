import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import { formatIndustry } from "@/lib/industries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Building2,
  Globe,
  Users,
  Briefcase,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  Factory,
} from "lucide-react";

interface CompanyProfile {
  id: number;
  name: string;
  industry: string | null;
  website: string | null;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  size: string | null;
  founded: string | null;
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
  const fmt = formatOption || ((v: string) => v);
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

export default function BrowseCompanies() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [showFilters, setShowFilters] = useState(false);
  const [industryFilters, setIndustryFilters] = useState<Set<string>>(new Set());
  const [locationFilters, setLocationFilters] = useState<Set<string>>(new Set());
  const [sizeFilters, setSizeFilters] = useState<Set<string>>(new Set());

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch(`${basePath}/companies`);
        if (res.ok) setCompanies(await res.json());
      } catch (err) {
        console.error("Failed to fetch companies", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [basePath]);

  const uniqueIndustries = useMemo(() => {
    return Array.from(new Set(companies.map(c => c.industry).filter(Boolean) as string[])).sort();
  }, [companies]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(companies.map(c => c.location).filter(Boolean) as string[])).sort();
  }, [companies]);

  const uniqueSizes = useMemo(() => {
    return Array.from(new Set(companies.map(c => c.size).filter(Boolean) as string[])).sort();
  }, [companies]);

  const activeFilterCount = useMemo(() => {
    return industryFilters.size + locationFilters.size + sizeFilters.size;
  }, [industryFilters, locationFilters, sizeFilters]);

  function clearAllFilters() {
    setIndustryFilters(new Set());
    setLocationFilters(new Set());
    setSizeFilters(new Set());
    setSearch("");
  }

  const displayed = useMemo(() => {
    return companies.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        const matches = c.name.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (industryFilters.size > 0 && (!c.industry || !industryFilters.has(c.industry))) return false;
      if (locationFilters.size > 0 && (!c.location || !locationFilters.has(c.location))) return false;
      if (sizeFilters.size > 0 && (!c.size || !sizeFilters.has(c.size))) return false;
      return true;
    });
  }, [companies, search, industryFilters, locationFilters, sizeFilters]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Building2 className="mr-3 text-primary" /> Browse Companies
        </h1>
        <p className="text-muted-foreground mt-1">Explore companies on the platform and discover opportunities.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies by name, industry, or location..."
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Size</label>
                  <MultiSelectDropdown
                    label="Sizes"
                    icon={Users}
                    options={uniqueSizes}
                    selected={sizeFilters}
                    onChange={setSizeFilters}
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Active:</span>
                  {Array.from(industryFilters).map(v => (
                    <span key={`ind-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(industryFilters); n.delete(v); setIndustryFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(locationFilters).map(v => (
                    <span key={`loc-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(locationFilters); n.delete(v); setLocationFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {Array.from(sizeFilters).map(v => (
                    <span key={`size-${v}`} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {v}
                      <button onClick={() => { const n = new Set(sizeFilters); n.delete(v); setSizeFilters(n); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{displayed.length}</span> {displayed.length === 1 ? "company" : "companies"}
            {activeFilterCount > 0 && <span> (filtered)</span>}
          </p>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground font-mono">Loading companies...</div>
      ) : displayed.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground font-mono">
          No companies found matching your criteria.
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((company) => (
            <Link key={company.id} href={`/browse-companies/${company.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-12 h-12 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight line-clamp-1">{company.name}</CardTitle>
                      {company.industry && (
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider mt-1">
                          {formatIndustry(company.industry)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  {company.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{company.description}</p>
                  )}
                  <div className="space-y-2 mt-auto">
                    {company.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mr-2 shrink-0" />
                        <span className="truncate">{company.location}</span>
                      </div>
                    )}
                    {company.size && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-3.5 h-3.5 mr-2 shrink-0" />
                        <span>{company.size} employees</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Globe className="w-3.5 h-3.5 mr-2 shrink-0" />
                        <span className="truncate">{company.website}</span>
                      </div>
                    )}
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
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Industry</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((company) => (
                  <tr key={company.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4">
                      <Link href={`/browse-companies/${company.id}`} className="hover:text-primary transition-colors">
                        <div className="flex items-center gap-3">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-8 h-8 rounded-md object-cover border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium text-sm">{company.name}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{formatIndustry(company.industry) || "—"}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{company.location || "—"}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{company.size || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

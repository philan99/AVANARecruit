import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Building, Briefcase, PoundSterling, Heart, LayoutGrid, List, SlidersHorizontal, X, GraduationCap } from "lucide-react";

export default function BrowseJobs() {
  const searchString = useSearch();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 200000]);
  const [salaryEnabled, setSalaryEnabled] = useState(false);
  const [skillFilter, setSkillFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [showFavourites, setShowFavourites] = useState(params.get("favourites") === "1");
  const [showFilters, setShowFilters] = useState(false);
  const [, navigate] = useLocation();
  const { candidateProfileId } = useRole();
  const [favouriteJobIds, setFavouriteJobIds] = useState<Set<number>>(new Set());

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

  const uniqueCompanies = useMemo(() => {
    if (!jobs) return [];
    const companies = new Set(jobs.map(j => j.company).filter(Boolean));
    return Array.from(companies).sort();
  }, [jobs]);

  const uniqueLocations = useMemo(() => {
    if (!jobs) return [];
    const locations = new Set(jobs.map(j => j.location).filter(Boolean));
    return Array.from(locations).sort();
  }, [jobs]);

  const uniqueLevels = useMemo(() => {
    if (!jobs) return [];
    const levels = new Set(jobs.map(j => j.experienceLevel).filter(Boolean));
    return Array.from(levels).sort();
  }, [jobs]);

  const uniqueSkills = useMemo(() => {
    if (!jobs) return [];
    const skills = new Set(jobs.flatMap(j => j.skills || []));
    return Array.from(skills).sort();
  }, [jobs]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (companyFilter !== "all") count++;
    if (levelFilter !== "all") count++;
    if (locationFilter !== "all") count++;
    if (salaryEnabled) count++;
    if (skillFilter !== "all") count++;
    return count;
  }, [companyFilter, levelFilter, locationFilter, salaryEnabled, skillFilter]);

  function clearAllFilters() {
    setCompanyFilter("all");
    setLevelFilter("all");
    setLocationFilter("all");
    setSalaryEnabled(false);
    setSalaryRange([0, 200000]);
    setSkillFilter("all");
    setSearch("");
  }

  const displayedJobs = useMemo(() => {
    let result = jobs;
    if (showFavourites) {
      result = result?.filter((job) => favouriteJobIds.has(job.id));
    }
    if (companyFilter !== "all") {
      result = result?.filter((job) => job.company === companyFilter);
    }
    if (levelFilter !== "all") {
      result = result?.filter((job) => job.experienceLevel === levelFilter);
    }
    if (locationFilter !== "all") {
      result = result?.filter((job) => job.location === locationFilter);
    }
    if (salaryEnabled) {
      result = result?.filter((job) => {
        const min = job.salaryMin || 0;
        const max = job.salaryMax || 0;
        if (min === 0 && max === 0) return true;
        return max >= salaryRange[0] && min <= salaryRange[1];
      });
    }
    if (skillFilter !== "all") {
      result = result?.filter((job) => job.skills?.includes(skillFilter));
    }
    return result;
  }, [jobs, showFavourites, favouriteJobIds, companyFilter, levelFilter, locationFilter, salaryEnabled, salaryRange, skillFilter]);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</label>
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="bg-background">
                      <Building className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {uniqueCompanies.map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience Level</label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="bg-background">
                      <GraduationCap className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {uniqueLevels.map(level => (
                        <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="bg-background">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill</label>
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger className="bg-background">
                      <Briefcase className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Skills" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      {uniqueSkills.map(skill => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {companyFilter !== "all" && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {companyFilter}
                      <button onClick={() => setCompanyFilter("all")} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {levelFilter !== "all" && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1 capitalize">
                      {levelFilter}
                      <button onClick={() => setLevelFilter("all")} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {locationFilter !== "all" && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {locationFilter}
                      <button onClick={() => setLocationFilter("all")} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {skillFilter !== "all" && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium pl-2.5 pr-1 py-0.5 gap-1">
                      {skillFilter}
                      <button onClick={() => setSkillFilter("all")} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  )}
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
                      <span className="truncate">{job.location}</span>
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
                        <span className="truncate">{job.location}</span>
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
    </div>
  );
}

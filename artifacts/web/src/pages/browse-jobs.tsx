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
import { Search, MapPin, Building, Briefcase, PoundSterling, Heart, LayoutGrid, List } from "lucide-react";

export default function BrowseJobs() {
  const searchString = useSearch();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [showFavourites, setShowFavourites] = useState(params.get("favourites") === "1");
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

  const displayedJobs = useMemo(() => {
    let result = jobs;
    if (showFavourites) {
      result = result?.filter((job) => favouriteJobIds.has(job.id));
    }
    if (companyFilter !== "all") {
      result = result?.filter((job) => job.company === companyFilter);
    }
    return result;
  }, [jobs, showFavourites, favouriteJobIds, companyFilter]);

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
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[200px] bg-card">
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
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 4).map(skill => (
                        <Badge key={skill} variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 4 && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                          +{job.skills.length - 4}
                        </Badge>
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

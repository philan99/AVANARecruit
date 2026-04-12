import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useListCandidates, getListCandidatesQueryKey } from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, MapPin, Mail, X, LayoutGrid, List } from "lucide-react";

export default function CandidatesList() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialStatus = urlParams.get("status") || "all";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [, setLocation] = useLocation();

  const queryParams = {
    ...(search ? { search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as any } : {}),
  };

  const { data: candidates, isLoading } = useListCandidates(queryParams, {
    query: { queryKey: getListCandidatesQueryKey(queryParams) },
  });

  const uniqueLocations = [...new Set(candidates?.map(c => c.location).filter(Boolean) || [])].sort();
  const uniqueSkills = [...new Set(candidates?.flatMap(c => c.skills) || [])].sort();
  const uniqueEducations = [...new Set(candidates?.map(c => c.education).filter(Boolean) || [])].sort();

  const hasActiveFilters = locationFilter !== "all" || skillFilter !== "all" || experienceFilter !== "all" || educationFilter !== "all" || statusFilter !== "all" || search !== "";

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setLocationFilter("all");
    setSkillFilter("all");
    setExperienceFilter("all");
    setEducationFilter("all");
  };

  const filteredCandidates = candidates?.filter(c => {
    if (locationFilter !== "all" && c.location !== locationFilter) return false;
    if (skillFilter !== "all" && !c.skills.includes(skillFilter)) return false;
    if (educationFilter !== "all" && c.education !== educationFilter) return false;
    if (experienceFilter !== "all") {
      const years = c.experienceYears;
      if (experienceFilter === "0-2" && years > 2) return false;
      if (experienceFilter === "3-5" && (years < 3 || years > 5)) return false;
      if (experienceFilter === "6-10" && (years < 6 || years > 10)) return false;
      if (experienceFilter === "10+" && years < 10) return false;
    }
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Users className="mr-3 text-primary" /> Talent Pool
          </h1>
          <p className="text-muted-foreground mt-1">Browse and manage candidate profiles.</p>
        </div>
        
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search candidates by name or skills..." 
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="passive">Passive</SelectItem>
              <SelectItem value="not_looking">Not Looking</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[170px] bg-card">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[170px] bg-card">
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {uniqueSkills.map(skill => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={experienceFilter} onValueChange={setExperienceFilter}>
            <SelectTrigger className="w-[170px] bg-card">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experience</SelectItem>
              <SelectItem value="0-2">0–2 years</SelectItem>
              <SelectItem value="3-5">3–5 years</SelectItem>
              <SelectItem value="6-10">6–10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
          <Select value={educationFilter} onValueChange={setEducationFilter}>
            <SelectTrigger className="w-[170px] bg-card">
              <SelectValue placeholder="Education" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Education</SelectItem>
              {uniqueEducations.map(edu => (
                <SelectItem key={edu} value={edu}>{edu}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredCandidates?.length ?? 0} candidate{(filteredCandidates?.length ?? 0) !== 1 ? "s" : ""} found
          </span>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5 mr-1" /> Clear Filters
              </Button>
            )}
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8 px-2"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8 px-2"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground font-mono">Loading talent pool...</div>
      ) : filteredCandidates?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground font-mono">No candidates found.</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates?.map((candidate) => (
            <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider border-0 ${candidate.status === 'active' ? 'bg-green-500 text-white' : candidate.status === 'passive' ? 'bg-orange-400 text-white' : 'bg-gray-400 text-white'}`}>
                      {candidate.status === "not_looking" ? "Not Looking" : candidate.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{candidate.experienceYears} YOE</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{candidate.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{candidate.currentTitle}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 mr-2" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-2" />
                      <span className="truncate">{candidate.location}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border mt-auto">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map(skill => (
                        <Badge key={skill} variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-background">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 4 && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-background">
                          +{candidate.skills.length - 4}
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
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Title</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Location</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Experience</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Skills</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates?.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/candidates/${candidate.id}`)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-sm">{candidate.name}</span>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{candidate.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{candidate.currentTitle}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />{candidate.location}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{candidate.experienceYears} years</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {candidate.skills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-background">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-background">
                          +{candidate.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider border-0 ${candidate.status === 'active' ? 'bg-green-500 text-white' : candidate.status === 'passive' ? 'bg-orange-400 text-white' : 'bg-gray-400 text-white'}`}>
                      {candidate.status === "not_looking" ? "Not Looking" : candidate.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

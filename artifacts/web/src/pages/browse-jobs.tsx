import { useState } from "react";
import { Link } from "wouter";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building, Briefcase, DollarSign } from "lucide-react";

export default function BrowseJobs() {
  const [search, setSearch] = useState("");

  const queryParams = {
    status: "open" as const,
    ...(search ? { search } : {}),
  };

  const { data: jobs, isLoading } = useListJobs(queryParams, {
    query: { queryKey: getListJobsQueryKey(queryParams) },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Briefcase className="mr-3 text-primary" /> Browse Opportunities
        </h1>
        <p className="text-muted-foreground mt-1">Explore open positions from companies on the platform.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs by title, company, or location..."
          className="pl-9 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground font-mono">Loading opportunities...</div>
        ) : jobs?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground font-mono">No open positions found.</div>
        ) : (
          jobs?.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card h-full flex flex-col">
                <CardHeader className="pb-3">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider w-fit mb-2">
                    {job.experienceLevel}
                  </Badge>
                  <CardTitle className="text-lg leading-tight line-clamp-2">{job.title}</CardTitle>
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
                        <DollarSign className="w-3.5 h-3.5 mr-2" />
                        <span className="font-mono text-xs">
                          ${(job.salaryMin || 0).toLocaleString()} - ${(job.salaryMax || 0).toLocaleString()}
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
          ))
        )}
      </div>
    </div>
  );
}

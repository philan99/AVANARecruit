import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";
import { useCompanyProfile } from "@/hooks/use-company-profile";

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
import { Briefcase, Search, Plus, MapPin, Building, Target } from "lucide-react";

export default function JobsList() {
  const [search, setSearch] = useState("");
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const [statusFilter, setStatusFilter] = useState<string>(urlParams.get("status") || "all");
  const [, setLocation] = useLocation();
  const { role } = useRole();

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const statusParam = params.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchString]);

  const { data: companyProfile } = useCompanyProfile({
    enabled: role === "company",
  });

  const companyProfileId = companyProfile?.id;

  const queryParams = {
    ...(search ? { search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as any } : {}),
    ...(role === "company" && companyProfileId ? { companyProfileId } : {}),
  };

  const { data: jobs, isLoading } = useListJobs(queryParams, {
    query: { queryKey: getListJobsQueryKey(queryParams), enabled: role !== "company" || !!companyProfileId },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Briefcase className="mr-3 text-primary" /> All Jobs
          </h1>
          <p className="text-muted-foreground mt-1">Manage open roles and track matching candidates.</p>
        </div>
        
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Post Job
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search roles or keywords..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground font-mono">Loading requisitions...</div>
        ) : jobs?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground font-mono">No requisitions found.</div>
        ) : (
          jobs?.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="font-mono text-[10px] uppercase tracking-wider">
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">REQ-{job.id.toString().padStart(4, '0')}</span>
                  </div>
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
                  </div>
                  
                  <div className="pt-4 border-t border-border mt-auto flex justify-between items-center">
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
                    <div className="flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      <Target className="w-3 h-3 mr-1" />
                      {job.matchCount} Matches
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

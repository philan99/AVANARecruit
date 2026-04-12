import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListCandidates, useCreateCandidate, getListCandidatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Search, Plus, MapPin, Mail, Briefcase, GraduationCap, X, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  currentTitle: z.string().min(1, "Current title is required"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  skills: z.string().min(1, "Skills are required (comma separated)"),
  experienceYears: z.coerce.number().min(0),
  education: z.string().min(1, "Education is required"),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["active", "inactive", "hired"]).default("active"),
});

export default function CandidatesList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const createCandidate = useCreateCandidate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      currentTitle: "",
      summary: "",
      skills: "",
      experienceYears: 0,
      education: "",
      location: "",
      status: "active",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
    };

    createCandidate.mutate({ data: payload }, {
      onSuccess: (data) => {
        toast({ title: "Candidate created", description: "Profile has been added successfully." });
        queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        setIsCreateOpen(false);
        form.reset();
        setLocation(`/candidates/${data.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create candidate.", variant: "destructive" });
      }
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Users className="mr-3 text-primary" /> Talent Pool
          </h1>
          <p className="text-muted-foreground mt-1">Browse and manage candidate profiles.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Candidate Profile</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma separated)</FormLabel>
                      <FormControl><Input placeholder="React, TypeScript, Node.js" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl><Textarea className="h-32" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createCandidate.isPending}>
                    {createCandidate.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
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
                    <Badge variant={candidate.status === 'active' ? 'default' : 'secondary'} className="font-mono text-[10px] uppercase tracking-wider">
                      {candidate.status}
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
                    <Badge variant={candidate.status === 'active' ? 'default' : 'secondary'} className="font-mono text-[10px] uppercase tracking-wider">
                      {candidate.status}
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

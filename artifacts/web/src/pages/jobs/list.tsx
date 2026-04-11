import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListJobs, useCreateJob, getListJobsQueryKey, useGetCompanyProfile, getGetCompanyProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useRole } from "@/contexts/role-context";

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
import { Briefcase, Search, Plus, MapPin, Building, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  skills: z.string().min(1, "Skills are required (comma separated)"),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead", "executive"]),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  status: z.enum(["open", "closed", "draft"]).default("open"),
});

export default function JobsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { role } = useRole();

  const { data: companyProfile } = useGetCompanyProfile({
    query: { enabled: role === "company" },
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

  const createJob = useCreateJob();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: companyProfile?.name ?? "",
      location: "",
      description: "",
      requirements: "",
      skills: "",
      experienceLevel: "mid",
      status: "open",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
      ...(companyProfileId ? { companyProfileId } : {}),
    };

    createJob.mutate({ data: payload }, {
      onSuccess: (data) => {
        toast({ title: "Job created", description: "The job has been created successfully." });
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        setIsCreateOpen(false);
        form.reset();
        setLocation(`/jobs/${data.id}`);
      },
      onError: (error) => {
        toast({ title: "Error", description: "Failed to create job.", variant: "destructive" });
      }
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Briefcase className="mr-3 text-primary" /> Active Requisitions
          </h1>
          <p className="text-muted-foreground mt-1">Manage open roles and track matching candidates.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Requisition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Requisition</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Department</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
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
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid-Level</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salaryMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Min</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salaryMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Max</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Skills (comma separated)</FormLabel>
                      <FormControl><Input placeholder="React, TypeScript, Node.js" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl><Textarea className="h-32" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl><Textarea className="h-32" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createJob.isPending}>
                    {createJob.isPending ? "Creating..." : "Create Requisition"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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

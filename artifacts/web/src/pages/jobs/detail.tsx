import { useState, useEffect } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Briefcase, Building, Calendar, MapPin, Target, ArrowLeft, Loader2, Network, User, Pencil } from "lucide-react";
import { useGetJob, getGetJobQueryKey, useGetJobMatches, getGetJobMatchesQueryKey, useRunJobMatching, useUpdateJob } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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

const editFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  skills: z.string().min(1, "Skills are required (comma separated)"),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead", "executive"]),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  status: z.enum(["open", "closed", "draft"]),
});

export default function JobDetail({ params }: { params: { id: string } }) {
  const jobId = parseInt(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: job, isLoading: jobLoading } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) },
  });

  const { data: matches, isLoading: matchesLoading } = useGetJobMatches(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobMatchesQueryKey(jobId) },
  });

  const runMatching = useRunJobMatching();
  const updateJob = useUpdateJob();

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      description: "",
      requirements: "",
      skills: "",
      experienceLevel: "mid" as const,
      status: "open" as const,
    },
  });

  useEffect(() => {
    if (job && isEditOpen) {
      editForm.reset({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        skills: job.skills.join(", "),
        experienceLevel: job.experienceLevel as any,
        salaryMin: job.salaryMin ?? undefined,
        salaryMax: job.salaryMax ?? undefined,
        status: job.status as any,
      });
    }
  }, [job, isEditOpen]);

  function onEditSubmit(values: z.infer<typeof editFormSchema>) {
    const payload = {
      ...values,
      skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
    };
    updateJob.mutate(
      { id: jobId, data: payload },
      {
        onSuccess: () => {
          toast({ title: "Job updated", description: "The requisition has been updated successfully." });
          queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
          setIsEditOpen(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update requisition.", variant: "destructive" });
        },
      }
    );
  }

  const handleRunMatching = () => {
    runMatching.mutate(
      { data: { jobId } },
      {
        onSuccess: () => {
          toast({ title: "Matching Complete", description: "AI analysis finished successfully." });
          queryClient.invalidateQueries({ queryKey: getGetJobMatchesQueryKey(jobId) });
          queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
        },
        onError: () => {
          toast({ title: "Matching Failed", description: "There was an error running the AI analysis.", variant: "destructive" });
        },
      }
    );
  };

  if (jobLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading requisition data...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-destructive font-mono">Requisition not found.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link href="/jobs" className="hover:text-primary flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Requisitions
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
            <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-wider">
              {job.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center"><Building className="w-4 h-4 mr-1.5" /> {job.company}</span>
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {job.location}</span>
            <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {job.experienceLevel}</span>
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center font-mono bg-secondary px-2 py-0.5 rounded">
                ${(job.salaryMin || 0).toLocaleString()} - ${(job.salaryMax || 0).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
              <DialogHeader>
                <DialogTitle>Edit Requisition</DialogTitle>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
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
                      control={editForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/Department</FormLabel>
                          <FormControl><Input {...field} readOnly className="bg-muted cursor-default" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
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
                      control={editForm.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                      control={editForm.control}
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
                      control={editForm.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary Max</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
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
                    control={editForm.control}
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
                    control={editForm.control}
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
                    <Button type="submit" disabled={updateJob.isPending}>
                      {updateJob.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleRunMatching} disabled={runMatching.isPending} size="lg" className="font-mono tracking-tight">
            {runMatching.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> ANALYZING...</>
            ) : (
              <><Network className="w-4 h-4 mr-2" /> RUN AI MATCHING</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.requirements}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-2 py-1 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Top Matches</span>
                <Badge variant="outline" className="font-mono bg-background">
                  {matches?.length || 0} TOTAL
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {matchesLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading matches...</div>
              ) : matches?.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <Target className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  No matches yet. Run AI matching to find candidates.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {matches?.map((match) => (
                    <Link key={match.id} href={`/candidates/${match.candidateId}`}>
                      <div className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {match.candidateName}
                            </h4>
                            <p className="text-xs text-muted-foreground">{match.candidateTitle}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-bold text-lg text-primary">
                              {Math.round(match.overallScore)}%
                            </span>
                            <Badge variant="outline" className="text-[9px] uppercase mt-1 h-4 px-1">{match.status}</Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                          {match.assessment}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

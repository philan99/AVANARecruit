import { useLocation } from "wouter";
import { useGetJob, getGetJobQueryKey, useUpdateJob, useDeleteJob, getListJobsQueryKey, type Job } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CityCombobox } from "@/components/city-combobox";
import { PostcodeInput } from "@/components/postcode-input";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Pencil, Trash2, Info, Check, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const editFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().optional().default(""),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.string().default("United Kingdom"),
  description: z.string().min(1, "Description is required"),
  skills: z.string().min(1, "Skills are required (comma separated)"),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead", "executive"]),
  jobType: z.string().optional(),
  industry: z.string().optional(),
  educationLevel: z.string().optional(),
  workplace: z.enum(["office", "remote", "hybrid"]).default("office"),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  status: z.enum(["open", "closed", "draft"]),
  // Legacy jobs created before the Ideal Candidate feature have empty defaults
  // for these fields. We keep the upper bounds but don't enforce a minimum on
  // edit, so older jobs can still be saved without being forced to fill in
  // this section. The create form keeps the stricter minimum requirements.
  idealCandidateTraits: z.array(z.string()).max(5, "Pick up to 5 traits"),
  idealCandidateNote: z.string().max(300, "Keep it under 300 characters"),
  idealCandidateUseInScore: z.boolean(),
});

const SUGGESTED_TRAITS = [
  "Self-starter",
  "Detail-oriented",
  "Collaborative",
  "Strong communicator",
  "Analytical",
  "Creative",
  "Adaptable",
  "Customer-focused",
  "Pragmatic",
  "Ownership mindset",
  "Curious",
  "Calm under pressure",
];

export default function EditJob({ params }: { params: { id: string } }) {
  const jobId = parseInt(params.id);

  const { data: job, isLoading } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) },
  });

  if (isLoading || !job) {
    if (isLoading) return <div className="p-8 text-center text-muted-foreground font-mono">Loading job data...</div>;
    return <div className="p-8 text-center text-destructive font-mono">Job not found.</div>;
  }

  return <EditJobForm jobId={jobId} job={job} />;
}

function EditJobForm({ jobId, job }: { jobId: number; job: Job }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: job.title ?? "",
      location: job.location ?? "",
      postcode: ((job as any).postcode as string) ?? "",
      country: ((job as any).country as string) ?? "United Kingdom",
      description: job.description ?? "",
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
      experienceLevel: (job.experienceLevel as z.infer<typeof editFormSchema>["experienceLevel"]) ?? "mid",
      jobType: job.jobType ?? undefined,
      industry: job.industry ?? undefined,
      educationLevel: job.educationLevel ?? undefined,
      workplace: (job.workplace as z.infer<typeof editFormSchema>["workplace"]) ?? "office",
      salaryMin: job.salaryMin ?? undefined,
      salaryMax: job.salaryMax ?? undefined,
      status: (job.status as z.infer<typeof editFormSchema>["status"]) ?? "open",
      idealCandidateTraits: Array.isArray(job.idealCandidateTraits) ? job.idealCandidateTraits : [],
      idealCandidateNote: job.idealCandidateNote ?? "",
      idealCandidateUseInScore: job.idealCandidateUseInScore ?? true,
    },
  });

  function onSubmit(values: z.infer<typeof editFormSchema>) {
    const payload = {
      ...values,
      skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
    };
    updateJob.mutate(
      { id: jobId, data: payload },
      {
        onSuccess: () => {
          toast({ title: "Job updated", description: "The job has been updated successfully." });
          queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
          navigate(`/jobs/${jobId}`);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update job.", variant: "destructive" });
        },
      }
    );
  }

  function onInvalid(errors: Record<string, { message?: string } | undefined>) {
    const firstFieldName = Object.keys(errors)[0];
    const firstMessage =
      (firstFieldName && errors[firstFieldName]?.message) ||
      "Please review the highlighted fields and try again.";
    toast({
      title: "Couldn't save changes",
      description: firstMessage,
      variant: "destructive",
    });
    if (firstFieldName) {
      const el = document.querySelector<HTMLElement>(`[name="${firstFieldName}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    }
  }

  function handleDelete() {
    deleteJob.mutate(
      { id: jobId },
      {
        onSuccess: () => {
          toast({ title: "Job deleted", description: "The job has been removed." });
          queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
          navigate("/jobs");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete job.", variant: "destructive" });
        },
      }
    );
  }

  const saveCancelButtons = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Button type="button" variant="outline" onClick={() => navigate(`/jobs/${jobId}`)}>
        Cancel
      </Button>
      <Button
        type="button"
        onClick={form.handleSubmit(onSubmit, onInvalid)}
        disabled={updateJob.isPending}
      >
        {updateJob.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );

  const deleteButton = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" disabled={deleteJob.isPending}>
          <Trash2 className="w-4 h-4 mr-1" />
          {deleteJob.isPending ? "Deleting..." : "Delete Job"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this job?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the job listing and any associated matches. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Pencil className="mr-3 text-primary" /> Edit Job
          </h1>
          <p className="text-muted-foreground mt-1">Update the details for this job listing.</p>
        </div>
        {saveCancelButtons}
      </div>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="permanent_full_time">Permanent (Full Time)</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="fixed_term_contract">Fixed Term Contract</SelectItem>
                          <SelectItem value="part_time">Part-time</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workplace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workplace <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select workplace" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 lg:col-span-3">
                      <FormLabel>Postcode <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <PostcodeInput
                          value={{ postcode: field.value ?? "", country: form.watch("country") || "United Kingdom" }}
                          onChange={(v) => { field.onChange(v.postcode); form.setValue("country", v.country); }}
                          onResolved={(info) => {
                            const cur = form.getValues("location");
                            if (!cur || cur.trim() === "") {
                              form.setValue("location", info.town + (info.region && info.region !== info.town ? `, ${info.region}` : ""));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="accounting_finance">Accounting & Finance</SelectItem>
                          <SelectItem value="agriculture">Agriculture</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="banking">Banking</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="creative_design">Creative & Design</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="energy_utilities">Energy & Utilities</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="hospitality_tourism">Hospitality & Tourism</SelectItem>
                          <SelectItem value="human_resources">Human Resources</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="logistics_supply_chain">Logistics & Supply Chain</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="marketing_advertising">Marketing & Advertising</SelectItem>
                          <SelectItem value="media_entertainment">Media & Entertainment</SelectItem>
                          <SelectItem value="nonprofit">Non-profit</SelectItem>
                          <SelectItem value="pharmaceutical">Pharmaceutical</SelectItem>
                          <SelectItem value="property_real_estate">Property & Real Estate</SelectItem>
                          <SelectItem value="public_sector">Public Sector</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="science_research">Science & Research</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="telecommunications">Telecommunications</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="educationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GCSE">GCSE</SelectItem>
                          <SelectItem value="A-Level">A-Level</SelectItem>
                          <SelectItem value="HND/HNC">HND/HNC</SelectItem>
                          <SelectItem value="Foundation Degree">Foundation Degree</SelectItem>
                          <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                          <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                          <SelectItem value="Professional Qualification">Professional Qualification</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
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
                      <FormLabel>Salary Min (£)</FormLabel>
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
                      <FormLabel>Salary Max (£)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
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
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills (comma separated) <span className="text-red-500">*</span></FormLabel>
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
                    <FormLabel>Job Description <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <RichTextEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-2 border-t border-border">
                <div>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mt-4">
                    Ideal candidate
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Beyond skills and experience — describe the kind of person who'd thrive in this role. Soft signal in matching, not a hard filter.
                  </p>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-muted-foreground rounded-md bg-muted/40 border border-border px-3 py-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                  <p className="leading-relaxed">
                    This section is filled in by you — AVANA won't draft or pre-fill it from a brief or uploaded job spec. It's how candidates hear your team's voice.
                  </p>
                </div>

                <FormField control={form.control} name="idealCandidateTraits" render={({ field }) => {
                  const value = field.value || [];
                  const toggle = (t: string) => {
                    if (value.includes(t)) {
                      field.onChange(value.filter((x) => x !== t));
                    } else if (value.length < 5) {
                      field.onChange([...value, t]);
                    }
                  };
                  return (
                    <FormItem>
                      <FormLabel>
                        Working style <span className="text-red-500">*</span>{" "}
                        <span className="text-muted-foreground font-normal text-xs">
                          · pick 1–5 ({value.length}/5)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {SUGGESTED_TRAITS.map((trait) => {
                            const isSelected = value.includes(trait);
                            const atMax = value.length >= 5 && !isSelected;
                            return (
                              <button
                                key={trait}
                                type="button"
                                onClick={() => toggle(trait)}
                                disabled={atMax}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : atMax
                                      ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                                      : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                                }`}
                              >
                                {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {trait}
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }} />

                <FormField control={form.control} name="idealCandidateNote" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>
                        Why this role suits them <span className="text-red-500">*</span>{" "}
                        <span className="text-muted-foreground font-normal text-xs">· 1–2 sentences</span>
                      </FormLabel>
                      <span className={`text-[11px] font-mono ${(field.value?.length || 0) > 280 ? "text-destructive" : "text-muted-foreground"}`}>
                        {field.value?.length || 0}/300
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        maxLength={300}
                        placeholder="e.g. You'll own the analytics roadmap end-to-end with a small, senior team — perfect for someone who likes shaping direction, not just executing tickets."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="idealCandidateUseInScore" render={({ field }) => (
                  <FormItem className="flex items-start justify-between rounded-md border border-border p-3 gap-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Use as a scoring signal</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        When on, candidates whose profile aligns with these traits get a small Fit boost. Skills and experience always weigh more.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                {deleteButton}
                {saveCancelButtons}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

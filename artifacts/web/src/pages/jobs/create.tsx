import { useState, KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { useCreateJob, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRole } from "@/contexts/role-context";
import { useCompanyProfile } from "@/hooks/use-company-profile";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Briefcase, Sparkles, Loader2, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead", "executive"], { required_error: "Experience level is required" }),
  jobType: z.string().min(1, "Job type is required"),
  industry: z.string().min(1, "Industry is required"),
  educationLevel: z.string().optional(),
  workplace: z.enum(["office", "remote", "hybrid"], { required_error: "Workplace is required" }).optional().refine(val => val !== undefined, { message: "Workplace is required" }),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  status: z.enum(["open", "closed", "draft"], { required_error: "Status is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

function SectionHeader({ step, title, description }: { step: number; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 pb-2 border-b border-border/60">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
        {step}
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function SkillsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");

  function addSkill(raw: string) {
    const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const p of parts) {
      if (!next.some(s => s.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
    setInput("");
  }

  function removeSkill(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addSkill(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeSkill(value.length - 1);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-md border border-input bg-background min-h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
      {value.map((s, i) => (
        <Badge key={`${s}-${i}`} variant="secondary" className="gap-1 pr-1 py-0.5 text-xs">
          {s}
          <button
            type="button"
            onClick={() => removeSkill(i)}
            className="ml-0.5 hover:bg-foreground/10 rounded-sm p-0.5"
            aria-label={`Remove ${s}`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => input.trim() && addSkill(input)}
        placeholder={value.length === 0 ? "Type a skill and press Enter" : ""}
        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm py-1"
      />
    </div>
  );
}

export default function CreateJob() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { role } = useRole();

  const { data: companyProfile } = useCompanyProfile({
    enabled: role === "company",
  });

  const companyProfileId = companyProfile?.id;
  const createJob = useCreateJob();

  const [brief, setBrief] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftingDescription, setDraftingDescription] = useState(false);

  const aiReady = Boolean(companyProfileId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      location: "",
      description: "",
      skills: [],
      experienceLevel: undefined,
      workplace: undefined,
      status: "draft",
    },
  });

  async function handleAiDraft() {
    if (!aiReady) {
      toast({ title: "Company profile needed", description: "Set up your company profile first so AVANA can tailor the draft.", variant: "destructive" });
      navigate("/company-profile");
      return;
    }
    if (!brief.trim()) {
      toast({ title: "Add a brief", description: "Type a short description of the role first.", variant: "destructive" });
      return;
    }
    setDrafting(true);
    try {
      const res = await fetch(`${apiBase}/jobs/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          companyProfileId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      const current = form.getValues();
      form.reset({
        ...current,
        title: data.title || current.title,
        jobType: data.jobType || current.jobType,
        workplace: data.workplace || current.workplace,
        location: data.location || current.location,
        experienceLevel: data.experienceLevel || current.experienceLevel,
        industry: data.industry || current.industry,
        educationLevel: data.educationLevel || current.educationLevel,
        salaryMin: data.salaryMin ?? current.salaryMin,
        salaryMax: data.salaryMax ?? current.salaryMax,
        skills: Array.isArray(data.skills) && data.skills.length ? data.skills : current.skills,
        description: data.description || current.description,
        status: current.status || "draft",
      });
      toast({ title: "Draft ready", description: "Review the fields and tweak anything you'd like before posting." });
    } catch (err) {
      toast({ title: "AI draft failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setDrafting(false);
    }
  }

  async function handleAiDescription() {
    if (!aiReady) {
      toast({ title: "Company profile needed", description: "Set up your company profile first so AVANA can tailor the draft.", variant: "destructive" });
      navigate("/company-profile");
      return;
    }
    const v = form.getValues();
    if (!v.title) {
      toast({ title: "Add a job title", description: "We need a title to draft a description.", variant: "destructive" });
      return;
    }
    setDraftingDescription(true);
    try {
      const res = await fetch(`${apiBase}/jobs/draft-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyProfileId,
          title: v.title,
          skills: v.skills,
          experienceLevel: v.experienceLevel,
          jobType: v.jobType,
          workplace: v.workplace,
          location: v.location,
          industry: v.industry,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.description) {
        form.setValue("description", data.description, { shouldValidate: true, shouldDirty: true });
        toast({ title: "Description drafted", description: "Edit the text to make it your own." });
      }
    } catch (err) {
      toast({ title: "AI description failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setDraftingDescription(false);
    }
  }

  function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      company: companyProfile?.name ?? "",
      skills: values.skills,
      ...(companyProfileId ? { companyProfileId } : {}),
    };

    createJob.mutate({ data: payload }, {
      onSuccess: (data) => {
        toast({ title: "Job posted", description: "The job has been posted successfully." });
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        navigate(`/jobs/${data.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to post job.", variant: "destructive" });
      }
    });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Briefcase className="mr-3 text-primary" /> Post New Job
        </h1>
        <p className="text-muted-foreground mt-1">Fill in the details below to create a new job listing — or let AVANA draft it for you.</p>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Draft with AI</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Describe the role in a sentence or two and AVANA will fill in the form for you. Example: <em>“Senior React developer in London, hybrid, £70-90k, fintech experience preferred.”</em>
              </p>
              <Textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                placeholder="Describe the role you'd like to post..."
                rows={2}
                className="bg-background/80"
                disabled={drafting}
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <Button type="button" onClick={handleAiDraft} disabled={drafting || !brief.trim()} size="sm">
                  {drafting ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Drafting...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Draft with AI</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* SECTION 1: BASICS */}
              <div className="space-y-4">
                <SectionHeader step={1} title="The basics" description="What is the role and where does it sit?" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem className="md:col-span-2 lg:col-span-3">
                      <FormLabel>Job Title <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input placeholder="e.g. Senior Frontend Engineer" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="jobType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select job type" /></SelectTrigger></FormControl>
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
                  )} />
                  <FormField control={form.control} name="workplace" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workplace <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select workplace" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input placeholder="e.g. London or Remote" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* SECTION 2: REQUIREMENTS */}
              <div className="space-y-4">
                <SectionHeader step={2} title="Requirements" description="Who you're looking for." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
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
                  )} />
                  <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
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
                  )} />
                  <FormField control={form.control} name="educationLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select education level" /></SelectTrigger></FormControl>
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
                  )} />
                </div>
                <FormField control={form.control} name="skills" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <SkillsInput value={field.value || []} onChange={field.onChange} />
                    </FormControl>
                    <p className="text-[11px] text-muted-foreground">Press Enter or use commas to add a skill.</p>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* SECTION 3: COMPENSATION & STATUS */}
              <div className="space-y-4">
                <SectionHeader step={3} title="Compensation & visibility" description="Pay range and whether the job goes live." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="salaryMin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Min (£)</FormLabel>
                      <FormControl><Input type="number" placeholder="40000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="salaryMax" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Max (£)</FormLabel>
                      <FormControl><Input type="number" placeholder="60000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* SECTION 4: DESCRIPTION */}
              <div className="space-y-4">
                <SectionHeader step={4} title="The pitch" description="What candidates will read on the job page." />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <FormLabel>Job Description <span className="text-red-500">*</span></FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAiDescription}
                        disabled={draftingDescription}
                        className="h-7 text-xs"
                      >
                        {draftingDescription ? (
                          <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Drafting...</>
                        ) : (
                          <><Sparkles className="w-3 h-3 mr-1.5" /> {field.value ? "Redraft with AI" : "Draft with AI"}</>
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <RichTextEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => navigate("/jobs")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createJob.isPending}>
                  {createJob.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> Post Job</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

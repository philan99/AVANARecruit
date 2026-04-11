import { useState } from "react";
import { useRole } from "@/contexts/role-context";
import { useListCandidates, useCreateCandidate, useGetCandidate, useUpdateCandidate, getListCandidatesQueryKey, getGetCandidateQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCircle, Mail, Phone, MapPin, GraduationCap, Briefcase, Edit, Plus } from "lucide-react";
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
});

export default function CandidateProfile() {
  const { candidateProfileId, setCandidateProfileId } = useRole();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: candidate, isLoading: profileLoading } = useGetCandidate(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateQueryKey(candidateProfileId!) },
  });

  const { data: allCandidates } = useListCandidates({}, {
    query: { queryKey: getListCandidatesQueryKey({}) },
  });

  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();

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
    },
  });

  function onCreateSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
      status: "active" as const,
    };

    createCandidate.mutate({ data: payload }, {
      onSuccess: (data) => {
        setCandidateProfileId(data.id);
        toast({ title: "Profile created", description: "Your profile is now active." });
        queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        setIsCreateOpen(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create profile.", variant: "destructive" });
      },
    });
  }

  if (!candidateProfileId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <UserCircle className="mr-3 text-primary" /> My Profile
          </h1>
          <p className="text-muted-foreground mt-1">Set up your candidate profile to get matched with jobs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setIsCreateOpen(true)}>
            <CardContent className="p-8 text-center">
              <Plus className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Create New Profile</h3>
              <p className="text-sm text-muted-foreground">Build your professional profile from scratch.</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setIsSelectOpen(true)}>
            <CardContent className="p-8 text-center">
              <UserCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Select Existing Profile</h3>
              <p className="text-sm text-muted-foreground">Choose from an existing candidate profile.</p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isSelectOpen} onOpenChange={setIsSelectOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Your Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {allCandidates?.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setCandidateProfileId(c.id);
                    setIsSelectOpen(false);
                    toast({ title: "Profile selected", description: `Welcome, ${c.name}!` });
                  }}
                >
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.currentTitle}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{c.location}</Badge>
                </div>
              ))}
              {(!allCandidates || allCandidates.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No existing profiles found.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Your Profile</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="currentTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="experienceYears" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="education" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="skills" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills (comma separated)</FormLabel>
                    <FormControl><Input placeholder="React, TypeScript, Node.js" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="summary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Summary</FormLabel>
                    <FormControl><Textarea className="h-32" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createCandidate.isPending}>
                    {createCandidate.isPending ? "Saving..." : "Create Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (profileLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading profile...</div>;
  }

  if (!candidate) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-16">
        <p className="text-muted-foreground mb-4">Profile not found. It may have been removed.</p>
        <Button onClick={() => setCandidateProfileId(null)}>Select Different Profile</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <UserCircle className="mr-3 text-primary" /> My Profile
          </h1>
          <p className="text-muted-foreground mt-1">Your professional profile used for job matching.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCandidateProfileId(null)}>
          Switch Profile
        </Button>
      </div>

      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
              {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-foreground">{candidate.name}</h2>
                <Badge variant={candidate.status === "active" ? "default" : "secondary"} className="uppercase text-[10px]">
                  {candidate.status}
                </Badge>
              </div>
              <p className="text-lg text-primary font-medium mb-3">{candidate.currentTitle}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5" /> {candidate.email}</span>
                {candidate.phone && <span className="flex items-center"><Phone className="w-4 h-4 mr-1.5" /> {candidate.phone}</span>}
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {candidate.location}</span>
                <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {candidate.experienceYears} years experience</span>
                <span className="flex items-center"><GraduationCap className="w-4 h-4 mr-1.5" /> {candidate.education}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{candidate.summary}</p>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

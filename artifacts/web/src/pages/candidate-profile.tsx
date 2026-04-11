import { useState, useEffect, useRef } from "react";
import { useRole } from "@/contexts/role-context";
import { useGetCandidate, useUpdateCandidate, getGetCandidateQueryKey, getListCandidatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@workspace/object-storage-web";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCircle, Mail, Phone, MapPin, GraduationCap, Briefcase, Edit, X, Save, Camera, FileText, Upload, Trash2, Plus, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExperienceEntry {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface EditFormState {
  name: string;
  email: string;
  phone: string;
  currentTitle: string;
  summary: string;
  skills: string;
  experienceYears: number;
  education: string;
  educationDetails: string;
  location: string;
}

export default function CandidateProfile() {
  const { candidateProfileId } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const { data: candidate, isLoading: profileLoading } = useGetCandidate(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateQueryKey(candidateProfileId!) },
  });

  const updateCandidate = useUpdateCandidate();

  const basePath = `${import.meta.env.BASE_URL}api/storage`.replace(/\/\//g, "/");
  const { uploadFile, isUploading } = useUpload({
    basePath,
    onSuccess: async (response) => {
      if (!candidateProfileId) return;
      const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
      await fetch(`${apiBase}/candidates/${candidateProfileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: response.objectPath }),
      });
      queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
      toast({ title: "Photo updated", description: "Your profile photo has been saved." });
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Could not upload photo.", variant: "destructive" });
    },
  });

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    await uploadFile(file);
    e.target.value = "";
  }

  const cvFileNameRef = useRef("");

  const { uploadFile: uploadCv, isUploading: isCvUploading } = useUpload({
    basePath,
    onSuccess: async (response) => {
      if (!candidateProfileId) return;
      const savedName = cvFileNameRef.current || "CV Document";
      const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
      await fetch(`${apiBase}/candidates/${candidateProfileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvFile: response.objectPath, cvFileName: savedName }),
      });
      queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
      toast({ title: "CV uploaded", description: "Your CV has been saved." });
      cvFileNameRef.current = "";
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Could not upload CV.", variant: "destructive" });
    },
  });

  async function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }
    cvFileNameRef.current = file.name;
    await uploadCv(file);
    e.target.value = "";
  }

  async function handleRemoveCv() {
    if (!candidateProfileId) return;
    const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
    await fetch(`${apiBase}/candidates/${candidateProfileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvFile: null, cvFileName: null }),
    });
    queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
    toast({ title: "CV removed" });
  }

  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([]);

  const [editForm, setEditForm] = useState<EditFormState>({
    name: "", email: "", phone: "", currentTitle: "",
    summary: "", skills: "", experienceYears: 0, education: "", educationDetails: "", location: "",
  });

  useEffect(() => {
    if (candidate) {
      setEditForm({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || "",
        currentTitle: candidate.currentTitle,
        summary: candidate.summary,
        skills: candidate.skills.join(", "),
        experienceYears: candidate.experienceYears,
        education: candidate.education,
        educationDetails: (candidate as any).educationDetails || "",
        location: candidate.location,
      });
      const exp = (candidate as any).experience;
      if (Array.isArray(exp)) {
        setExperienceList(exp);
      }
    }
  }, [candidate]);

  function startEditing() {
    if (candidate) {
      setEditForm({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || "",
        currentTitle: candidate.currentTitle,
        summary: candidate.summary,
        skills: candidate.skills.join(", "),
        experienceYears: candidate.experienceYears,
        education: candidate.education,
        educationDetails: (candidate as any).educationDetails || "",
        location: candidate.location,
      });
    }
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function addExperienceEntry() {
    setExperienceList(prev => [
      { jobTitle: "", company: "", startDate: "", endDate: "", current: false, description: "" },
      ...prev,
    ]);
  }

  function updateExperienceEntry(index: number, field: keyof ExperienceEntry, value: string | boolean) {
    setExperienceList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "current" && value === true) {
        updated[index].endDate = "";
      }
      return updated;
    });
  }

  function removeExperienceEntry(index: number) {
    setExperienceList(prev => prev.filter((_, i) => i !== index));
  }

  function moveExperienceEntry(index: number, direction: "up" | "down") {
    setExperienceList(prev => {
      const updated = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
  }

  function handleSave() {
    if (!candidateProfileId) return;
    const payload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || undefined,
      currentTitle: editForm.currentTitle,
      summary: editForm.summary,
      skills: editForm.skills.split(",").map(s => s.trim()).filter(Boolean),
      experienceYears: editForm.experienceYears,
      education: editForm.education,
      educationDetails: editForm.educationDetails || null,
      location: editForm.location,
      experience: experienceList,
    };

    updateCandidate.mutate({ id: candidateProfileId, data: payload }, {
      onSuccess: () => {
        toast({ title: "Profile updated", description: "Your changes have been saved." });
        queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
        queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        setIsEditing(false);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
      },
    });
  }

  function handleStatusChange(newStatus: string) {
    if (!candidateProfileId) return;
    const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
    fetch(`${apiBase}/candidates/${candidateProfileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
      toast({ title: "Status updated", description: `Your status is now "${newStatus === "active" ? "Active" : newStatus === "passive" ? "Passive" : "Not Looking"}".` });
    });
  }

  function updateField(field: keyof EditFormState, value: string | number) {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }

  if (!candidateProfileId) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-16">
        <UserCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">No Profile Found</h2>
        <p className="text-muted-foreground">Please sign up or log in to view your profile.</p>
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
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={cancelEditing}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateCandidate.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateCandidate.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Select value={candidate?.status || "active"} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="passive">Passive</SelectItem>
                <SelectItem value="not_looking">Not Looking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input value={editForm.name} onChange={e => updateField("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" value={editForm.email} onChange={e => updateField("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input value={editForm.phone} onChange={e => updateField("phone", e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Current Title</label>
                <Input value={editForm.currentTitle} onChange={e => updateField("currentTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Years of Experience</label>
                <Input type="number" min="0" value={editForm.experienceYears} onChange={e => updateField("experienceYears", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input value={editForm.location} onChange={e => updateField("location", e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div
                className="w-20 h-20 rounded-full shrink-0 relative group cursor-pointer"
                onClick={handlePhotoClick}
              >
                {(candidate as any).profileImage ? (
                  <img
                    src={`${import.meta.env.BASE_URL}api/storage${(candidate as any).profileImage}`.replace(/\/\//g, "/")}
                    alt={candidate.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                    {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-foreground">{candidate.name}</h2>
                  <Badge
                    className={`uppercase text-[10px] ${
                      candidate.status === "active"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : candidate.status === "passive"
                        ? "bg-orange-400 text-white hover:bg-orange-500"
                        : "bg-gray-400 text-white hover:bg-gray-500"
                    }`}
                  >
                    {candidate.status === "not_looking" ? "Not Looking" : candidate.status}
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
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              className="min-h-[120px]"
              value={editForm.summary}
              onChange={e => updateField("summary", e.target.value)}
            />
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{candidate.summary}</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {editForm.skills.split(",").map(s => s.trim()).filter(Boolean).map((skill, i) => (
                  <Badge key={`${skill}-${i}`} variant="secondary" className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                    {skill}
                    <button
                      type="button"
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      onClick={() => {
                        const skills = editForm.skills.split(",").map(s => s.trim()).filter(Boolean);
                        skills.splice(i, 1);
                        updateField("skills", skills.join(", "));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Type a skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      const existing = editForm.skills.split(",").map(s => s.trim()).filter(Boolean);
                      if (!existing.includes(val)) {
                        updateField("skills", [...existing, val].join(", "));
                      }
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Press Enter to add a skill</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Experience</CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={addExperienceEntry}>
                <Plus className="w-4 h-4 mr-1" /> Add Role
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              {experienceList.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No experience added yet. Click "Add Role" to get started.</p>
              )}
              {experienceList.map((entry, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <div className="absolute top-2 right-2 flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => moveExperienceEntry(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => moveExperienceEntry(index, "down")}
                      disabled={index === experienceList.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeExperienceEntry(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Job Title</label>
                      <Input
                        value={entry.jobTitle}
                        onChange={e => updateExperienceEntry(index, "jobTitle", e.target.value)}
                        placeholder="e.g. Senior Developer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Company</label>
                      <Input
                        value={entry.company}
                        onChange={e => updateExperienceEntry(index, "company", e.target.value)}
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                      <Input
                        type="month"
                        value={entry.startDate}
                        onChange={e => updateExperienceEntry(index, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">End Date</label>
                      <Input
                        type="month"
                        value={entry.endDate}
                        onChange={e => updateExperienceEntry(index, "endDate", e.target.value)}
                        disabled={entry.current}
                        placeholder={entry.current ? "Present" : ""}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entry.current}
                      onChange={e => updateExperienceEntry(index, "current", e.target.checked)}
                      className="rounded border-border"
                    />
                    I currently work here
                  </label>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <Textarea
                      value={entry.description}
                      onChange={e => updateExperienceEntry(index, "description", e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {experienceList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No experience added yet.</p>
              ) : (
                experienceList.map((entry, index) => (
                  <div key={index} className={`${index > 0 ? "border-t pt-4" : ""}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{entry.jobTitle || "Untitled Role"}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" /> {entry.company || "Unknown Company"}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {entry.startDate || "?"} — {entry.current ? "Present" : entry.endDate || "?"}
                      </div>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Education</CardTitle>
          <p className="text-sm text-muted-foreground">Select your highest level of education</p>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Select value={editForm.education} onValueChange={(val) => updateField("education", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
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
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Details (optional)</label>
                <Textarea
                  value={editForm.educationDetails}
                  onChange={e => updateField("educationDetails", e.target.value)}
                  placeholder="e.g. BSc Computer Science, University of Manchester, 2018-2021"
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <GraduationCap className="w-5 h-5 mr-2" />
                <span>{candidate.education}</span>
              </div>
              {(candidate as any).educationDetails && (
                <p className="text-sm text-muted-foreground ml-7 whitespace-pre-wrap">{(candidate as any).educationDetails}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">CV / Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleCvChange}
          />
          {(candidate as any)?.cvFile ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{(candidate as any).cvFileName || "CV Document"}</p>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={isCvUploading}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Replace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveCv}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
              onClick={() => cvInputRef.current?.click()}
            >
              {isCvUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-sm">Upload your CV</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF or Word document (DOC, DOCX)</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

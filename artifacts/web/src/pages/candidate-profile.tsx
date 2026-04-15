import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useRole } from "@/contexts/role-context";
import { useGetCandidate, getGetCandidateQueryKey, getListCandidatesQueryKey } from "@workspace/api-client-react";
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
import { UserCircle, Mail, Phone, MapPin, GraduationCap, Briefcase, Edit, X, Save, Camera, FileText, Upload, Trash2, Plus, Calendar, ArrowUp, ArrowDown, ArrowRight, Linkedin, Facebook, Globe, Twitter, CheckCircle2, Circle, ExternalLink, ShieldCheck, Send, Clock, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
  qualifications: string;
  preferredJobTypes: string[];
  preferredWorkplaces: string[];
  preferredIndustries: string[];
  experienceYears: number;
  education: string;
  educationDetails: string;
  location: string;
  linkedinUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
}

const JOB_TYPE_OPTIONS = [
  { value: "permanent_full_time", label: "Permanent (Full Time)" },
  { value: "contract", label: "Contract" },
  { value: "fixed_term_contract", label: "Fixed Term Contract" },
  { value: "part_time", label: "Part-time" },
  { value: "temporary", label: "Temporary" },
];

const WORKPLACE_OPTIONS = [
  { value: "office", label: "Office" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const INDUSTRY_OPTIONS = [
  { value: "accounting_finance", label: "Accounting & Finance" },
  { value: "agriculture", label: "Agriculture" },
  { value: "automotive", label: "Automotive" },
  { value: "banking", label: "Banking" },
  { value: "construction", label: "Construction" },
  { value: "consulting", label: "Consulting" },
  { value: "creative_design", label: "Creative & Design" },
  { value: "education", label: "Education" },
  { value: "energy_utilities", label: "Energy & Utilities" },
  { value: "engineering", label: "Engineering" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality_tourism", label: "Hospitality & Tourism" },
  { value: "human_resources", label: "Human Resources" },
  { value: "insurance", label: "Insurance" },
  { value: "legal", label: "Legal" },
  { value: "logistics_supply_chain", label: "Logistics & Supply Chain" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "marketing_advertising", label: "Marketing & Advertising" },
  { value: "media_entertainment", label: "Media & Entertainment" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "pharmaceutical", label: "Pharmaceutical" },
  { value: "property_real_estate", label: "Property & Real Estate" },
  { value: "public_sector", label: "Public Sector" },
  { value: "retail", label: "Retail" },
  { value: "sales", label: "Sales" },
  { value: "science_research", label: "Science & Research" },
  { value: "technology", label: "Technology" },
  { value: "telecommunications", label: "Telecommunications" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

const JOB_TYPE_LABELS: Record<string, string> = Object.fromEntries(JOB_TYPE_OPTIONS.map(o => [o.value, o.label]));
const WORKPLACE_LABELS: Record<string, string> = Object.fromEntries(WORKPLACE_OPTIONS.map(o => [o.value, o.label]));
const INDUSTRY_LABELS: Record<string, string> = Object.fromEntries(INDUSTRY_OPTIONS.map(o => [o.value, o.label]));

const PHONE_CODES = [
  { code: "+44", flag: "🇬🇧" }, { code: "+1", flag: "🇺🇸" }, { code: "+353", flag: "🇮🇪" },
  { code: "+33", flag: "🇫🇷" }, { code: "+49", flag: "🇩🇪" }, { code: "+34", flag: "🇪🇸" },
  { code: "+39", flag: "🇮🇹" }, { code: "+31", flag: "🇳🇱" }, { code: "+32", flag: "🇧🇪" },
  { code: "+41", flag: "🇨🇭" }, { code: "+46", flag: "🇸🇪" }, { code: "+47", flag: "🇳🇴" },
  { code: "+45", flag: "🇩🇰" }, { code: "+358", flag: "🇫🇮" }, { code: "+48", flag: "🇵🇱" },
  { code: "+43", flag: "🇦🇹" }, { code: "+351", flag: "🇵🇹" }, { code: "+61", flag: "🇦🇺" },
  { code: "+64", flag: "🇳🇿" }, { code: "+91", flag: "🇮🇳" }, { code: "+81", flag: "🇯🇵" },
  { code: "+82", flag: "🇰🇷" }, { code: "+86", flag: "🇨🇳" }, { code: "+65", flag: "🇸🇬" },
  { code: "+852", flag: "🇭🇰" }, { code: "+971", flag: "🇦🇪" }, { code: "+966", flag: "🇸🇦" },
  { code: "+27", flag: "🇿🇦" }, { code: "+234", flag: "🇳🇬" }, { code: "+55", flag: "🇧🇷" },
  { code: "+52", flag: "🇲🇽" },
];

export default function CandidateProfile() {
  const { candidateProfileId } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const { data: candidate, isLoading: profileLoading } = useGetCandidate(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateQueryKey(candidateProfileId!) },
  });

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
    summary: "", skills: "", qualifications: "", preferredJobTypes: [], preferredWorkplaces: [], preferredIndustries: [], experienceYears: 0, education: "", educationDetails: "", location: "",
    linkedinUrl: "", facebookUrl: "", twitterUrl: "", portfolioUrl: "",
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
        qualifications: ((candidate as any).qualifications || []).join(", "),
        preferredJobTypes: (candidate as any).preferredJobTypes || [],
        preferredWorkplaces: (candidate as any).preferredWorkplaces || [],
        preferredIndustries: (candidate as any).preferredIndustries || [],
        experienceYears: candidate.experienceYears,
        education: candidate.education,
        educationDetails: (candidate as any).educationDetails || "",
        location: candidate.location,
        linkedinUrl: (candidate as any).linkedinUrl || "",
        facebookUrl: (candidate as any).facebookUrl || "",
        twitterUrl: (candidate as any).twitterUrl || "",
        portfolioUrl: (candidate as any).portfolioUrl || "",
      });
      const exp = (candidate as any).experience;
      if (Array.isArray(exp)) {
        setExperienceList(exp);
      }
    }
  }, [candidate]);

  const [verifications, setVerifications] = useState<{ id: number; candidateName: string; roleTitle: string; company: string; verifierName: string; verifierEmail: string; status: string; verifierResponse: string | null; verifiedAt: string | null; createdAt: string }[]>([]);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyForm, setVerifyForm] = useState({ roleTitle: "", company: "", verifierName: "", verifierEmail: "", message: "" });
  const [sendingVerification, setSendingVerification] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (candidateProfileId) {
      fetch(`${apiBase}/candidates/${candidateProfileId}/verifications`)
        .then(r => r.ok ? r.json() : [])
        .then(setVerifications)
        .catch(() => {});
    }
  }, [candidateProfileId, apiBase]);

  async function handleSendVerification() {
    if (!verifyForm.roleTitle.trim() || !verifyForm.company.trim() || !verifyForm.verifierName.trim() || !verifyForm.verifierEmail.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSendingVerification(true);
    try {
      const res = await fetch(`${apiBase}/verifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidateProfileId,
          candidateName: candidate?.name || "",
          roleTitle: verifyForm.roleTitle.trim(),
          company: verifyForm.company.trim(),
          verifierName: verifyForm.verifierName.trim(),
          verifierEmail: verifyForm.verifierEmail.trim(),
          message: verifyForm.message.trim() || null,
        }),
      });
      if (res.ok) {
        const v = await res.json();
        setVerifications(prev => [...prev, v]);
        setVerifyDialogOpen(false);
        setVerifyForm({ roleTitle: "", company: "", verifierName: "", verifierEmail: "", message: "" });
        toast({ title: "Verification Sent", description: `Verification request sent to ${verifyForm.verifierName}.` });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to send request.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send request.", variant: "destructive" });
    } finally {
      setSendingVerification(false);
    }
  }

  async function handleCancelVerification(verificationId: number) {
    try {
      const res = await fetch(`${apiBase}/verifications/${verificationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidateProfileId }),
      });
      if (res.ok) {
        setVerifications(prev => prev.filter(v => v.id !== verificationId));
        toast({ title: "Verification Cancelled", description: "The pending verification request has been cancelled." });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to cancel verification.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to cancel verification.", variant: "destructive" });
    }
  }

  function startEditing() {
    if (candidate) {
      setEditForm({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || "",
        currentTitle: candidate.currentTitle,
        summary: candidate.summary,
        skills: candidate.skills.join(", "),
        qualifications: ((candidate as any).qualifications || []).join(", "),
        preferredJobTypes: (candidate as any).preferredJobTypes || [],
        preferredWorkplaces: (candidate as any).preferredWorkplaces || [],
        preferredIndustries: (candidate as any).preferredIndustries || [],
        experienceYears: candidate.experienceYears,
        education: candidate.education,
        educationDetails: (candidate as any).educationDetails || "",
        location: candidate.location,
        linkedinUrl: (candidate as any).linkedinUrl || "",
        facebookUrl: (candidate as any).facebookUrl || "",
        twitterUrl: (candidate as any).twitterUrl || "",
        portfolioUrl: (candidate as any).portfolioUrl || "",
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

  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!candidateProfileId) return;
    setIsSaving(true);
    const payload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || undefined,
      currentTitle: editForm.currentTitle,
      summary: editForm.summary,
      skills: editForm.skills.split(",").map(s => s.trim()).filter(Boolean),
      qualifications: editForm.qualifications.split(",").map(s => s.trim()).filter(Boolean),
      preferredJobTypes: editForm.preferredJobTypes,
      preferredWorkplaces: editForm.preferredWorkplaces,
      preferredIndustries: editForm.preferredIndustries,
      experienceYears: editForm.experienceYears,
      education: editForm.education,
      educationDetails: editForm.educationDetails || null,
      location: editForm.location,
      experience: experienceList,
      linkedinUrl: editForm.linkedinUrl || null,
      facebookUrl: editForm.facebookUrl || null,
      twitterUrl: editForm.twitterUrl || null,
      portfolioUrl: editForm.portfolioUrl || null,
    };

    try {
      const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
      queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
      setIsEditing(false);
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!candidateProfileId || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      localStorage.removeItem("avanatalent_candidate_id");
      localStorage.removeItem("avanatalent_role");
      localStorage.removeItem("avanatalent_email");
      toast({ title: "Account deleted", description: "Your account and all associated data have been permanently removed." });
      setDeleteDialogOpen(false);
      setLocation("/");
      window.location.reload();
    } catch {
      toast({ title: "Error", description: "Failed to delete account. Please try again.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
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

  function updateField(field: keyof EditFormState, value: string | number | string[]) {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }

  function getProfileCompletion() {
    if (!candidate) return { percent: 0, items: [] };
    const placeholders = ["not specified", "no summary provided"];
    const filled = (val: any) => !!val && !placeholders.includes(String(val).toLowerCase());
    const filledSkills = (arr: any) => Array.isArray(arr) && arr.length > 0 && !(arr.length === 1 && arr[0]?.toLowerCase() === "general");
    const items = [
      { label: "Name", done: filled(candidate.name) },
      { label: "Email", done: filled(candidate.email) },
      { label: "Phone", done: filled(candidate.phone) },
      { label: "Location", done: filled(candidate.location) },
      { label: "Current Title", done: filled(candidate.currentTitle) },
      { label: "Years of Experience", done: candidate.experienceYears != null && candidate.experienceYears > 0 },
      { label: "Profile Photo", done: !!(candidate as any).profileImage },
      { label: "Professional Summary", done: filled(candidate.summary) },
      { label: "Skills", done: filledSkills(candidate.skills) },
      { label: "Experience History", done: Array.isArray((candidate as any).experience) && (candidate as any).experience.length > 0 },
      { label: "Education", done: filled(candidate.education) },
      { label: "CV / Resume", done: !!(candidate as any).cvFile },
    ];
    const done = items.filter(i => i.done).length;
    return { percent: Math.round((done / items.length) * 100), items };
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

  const completion = getProfileCompletion();
  const statusColor = candidate.status === "active" ? "bg-green-500" : candidate.status === "passive" ? "bg-orange-400" : "bg-gray-400";
  const statusLabel = candidate.status === "not_looking" ? "Not Looking" : candidate.status === "active" ? "Active" : "Passive";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvChange} />

      {/* Profile Header */}
      <Card className="bg-card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div
              className="w-24 h-24 rounded-xl shrink-0 relative group cursor-pointer border-4 border-card shadow-lg"
              onClick={handlePhotoClick}
            >
              {(candidate as any).profileImage ? (
                <img
                  src={`${import.meta.env.BASE_URL}api/storage${(candidate as any).profileImage}`.replace(/\/\//g, "/")}
                  alt={candidate.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
              )}
              <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{candidate.name}</h1>
                <Badge className={`${statusColor} text-white hover:${statusColor} uppercase text-[10px] px-2`}>
                  {statusLabel}
                </Badge>
              </div>
              <p className="text-base text-primary font-medium mt-0.5">{candidate.currentTitle}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {candidate.email}</span>
                {candidate.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {candidate.phone}</span>}
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {candidate.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {candidate.experienceYears} yrs exp</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {candidate.education}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-start sm:mt-2 shrink-0">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEditing}>
                    <X className="w-4 h-4 mr-1.5" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-1.5" /> {isSaving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <>
                  <Select value={candidate?.status || "active"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="passive">Passive</SelectItem>
                      <SelectItem value="not_looking">Not Looking</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Edit className="w-4 h-4 mr-1.5" /> Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Sidebar */}
        <div className="space-y-6 lg:col-span-1">

          {/* Profile Completion */}
          {completion.percent < 100 && (
            <Card className="bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Profile Completion
                  <span className="text-primary font-bold">{completion.percent}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>
                <div className="space-y-1.5">
                  {completion.items.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      {item.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={item.done ? "text-muted-foreground" : "text-foreground"}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Details (edit mode) */}
          {isEditing && (
            <Card className="bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                  <Input value={editForm.name} onChange={e => updateField("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <Input type="email" value={editForm.email} onChange={e => updateField("email", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Phone</label>
                  <div className="flex gap-2">
                    <Select
                      value={editForm.phone.match(/^\+\d+/)?.[0] || "+44"}
                      onValueChange={(code) => {
                        const numberPart = editForm.phone.replace(/^\+\d+\s*/, "");
                        updateField("phone", `${code} ${numberPart}`);
                      }}
                    >
                      <SelectTrigger className="w-[100px] shrink-0 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PHONE_CODES.map(p => (
                          <SelectItem key={p.code} value={p.code}>{p.flag} {p.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={editForm.phone.replace(/^\+\d+\s*/, "")}
                      onChange={e => {
                        const code = editForm.phone.match(/^\+\d+/)?.[0] || "+44";
                        updateField("phone", `${code} ${e.target.value}`);
                      }}
                      placeholder="Phone number"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Current Title</label>
                  <Input value={editForm.currentTitle} onChange={e => updateField("currentTitle", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Years of Experience</label>
                  <Input type="number" min="0" value={editForm.experienceYears} onChange={e => updateField("experienceYears", parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Location</label>
                  <Input value={editForm.location} onChange={e => updateField("location", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {editForm.skills.split(",").map(s => s.trim()).filter(Boolean).map((skill, i) => (
                      <Badge key={`${skill}-${i}`} variant="secondary" className="px-2.5 py-1 text-xs flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                          onClick={() => {
                            const skills = editForm.skills.split(",").map(s => s.trim()).filter(Boolean);
                            skills.splice(i, 1);
                            updateField("skills", skills.join(", "));
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Type a skill and press Enter"
                    className="h-8 text-sm"
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
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.length > 0 ? candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-xs">
                      {skill}
                    </Badge>
                  )) : (
                    <p className="text-xs text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {editForm.qualifications.split(",").map(s => s.trim()).filter(Boolean).map((qual, i) => (
                      <Badge key={`${qual}-${i}`} variant="secondary" className="px-2.5 py-1 text-xs flex items-center gap-1">
                        {qual}
                        <button
                          type="button"
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                          onClick={() => {
                            const quals = editForm.qualifications.split(",").map(s => s.trim()).filter(Boolean);
                            quals.splice(i, 1);
                            updateField("qualifications", quals.join(", "));
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Type a qualification and press Enter"
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          const existing = editForm.qualifications.split(",").map(s => s.trim()).filter(Boolean);
                          if (!existing.includes(val)) {
                            updateField("qualifications", [...existing, val].join(", "));
                          }
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {((candidate as any).qualifications || []).length > 0 ? (
                    ((candidate as any).qualifications || []).map((qual: string) => (
                      <Badge key={qual} variant="secondary" className="px-2.5 py-1 text-xs">
                        {qual}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No qualifications added yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Education</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <Select value={editForm.education} onValueChange={(val) => updateField("education", val)}>
                    <SelectTrigger className="h-8 text-sm">
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
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{candidate.education}</p>
                    {(candidate as any).educationDetails && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">{(candidate as any).educationDetails}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Linkedin className="w-3 h-3" /> LinkedIn
                    </label>
                    <Input value={editForm.linkedinUrl} onChange={e => updateField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Facebook className="w-3 h-3" /> Facebook
                    </label>
                    <Input value={editForm.facebookUrl} onChange={e => updateField("facebookUrl", e.target.value)} placeholder="https://facebook.com/yourprofile" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Twitter className="w-3 h-3" /> X / Twitter
                    </label>
                    <Input value={editForm.twitterUrl} onChange={e => updateField("twitterUrl", e.target.value)} placeholder="https://x.com/yourhandle" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Portfolio
                    </label>
                    <Input value={editForm.portfolioUrl} onChange={e => updateField("portfolioUrl", e.target.value)} placeholder="https://yourportfolio.com" className="h-8 text-sm" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {!(candidate as any)?.linkedinUrl && !(candidate as any)?.facebookUrl && !(candidate as any)?.twitterUrl && !(candidate as any)?.portfolioUrl ? (
                    <p className="text-xs text-muted-foreground text-center py-2">No links added yet</p>
                  ) : (
                    <>
                      {(candidate as any)?.linkedinUrl && (
                        <a href={(candidate as any).linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                          <div className="p-1.5 rounded-md bg-blue-500/10"><Linkedin className="w-3.5 h-3.5 text-blue-500" /></div>
                          <span className="text-sm text-foreground truncate flex-1">{(candidate as any).linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                      {(candidate as any)?.facebookUrl && (
                        <a href={(candidate as any).facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                          <div className="p-1.5 rounded-md bg-blue-600/10"><Facebook className="w-3.5 h-3.5 text-blue-600" /></div>
                          <span className="text-sm text-foreground truncate flex-1">{(candidate as any).facebookUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                      {(candidate as any)?.twitterUrl && (
                        <a href={(candidate as any).twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                          <div className="p-1.5 rounded-md bg-sky-500/10"><Twitter className="w-3.5 h-3.5 text-sky-500" /></div>
                          <span className="text-sm text-foreground truncate flex-1">{(candidate as any).twitterUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                      {(candidate as any)?.portfolioUrl && (
                        <a href={(candidate as any).portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                          <div className="p-1.5 rounded-md bg-green-500/10"><Globe className="w-3.5 h-3.5 text-green-500" /></div>
                          <span className="text-sm text-foreground truncate flex-1">{(candidate as any).portfolioUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CV / Resume */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">CV / Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {(candidate as any)?.cvFile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{(candidate as any).cvFileName || "CV Document"}</p>
                      <p className="text-xs text-muted-foreground">Uploaded</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => cvInputRef.current?.click()} disabled={isCvUploading}>
                      <Upload className="w-3.5 h-3.5 mr-1" /> Replace
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs text-destructive hover:text-destructive" onClick={handleRemoveCv}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
                  onClick={() => cvInputRef.current?.click()}
                >
                  {isCvUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <p className="font-medium text-xs">Upload your CV</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">PDF or Word document</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Verifications</CardTitle>
              <div className="flex items-center gap-1.5">
                {verifications.length > 0 && (
                  <Link href="/verifications">
                    <Button variant="link" size="sm" className="h-7 text-xs text-primary px-2">
                      Show All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-7 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verify Me
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Request Employment Verification
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Send a verification request to a previous employer or colleague to confirm your employment history.
                    </p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Role / Job Title *</label>
                        <Input value={verifyForm.roleTitle} onChange={e => setVerifyForm(p => ({ ...p, roleTitle: e.target.value }))} placeholder="e.g. Senior Developer" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Company *</label>
                        <Input value={verifyForm.company} onChange={e => setVerifyForm(p => ({ ...p, company: e.target.value }))} placeholder="e.g. Acme Corp" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Verifier's Name *</label>
                        <Input value={verifyForm.verifierName} onChange={e => setVerifyForm(p => ({ ...p, verifierName: e.target.value }))} placeholder="e.g. John Smith" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Verifier's Email *</label>
                        <Input type="email" value={verifyForm.verifierEmail} onChange={e => setVerifyForm(p => ({ ...p, verifierEmail: e.target.value }))} placeholder="e.g. john@acmecorp.com" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Personal Message (optional)</label>
                        <Textarea value={verifyForm.message} onChange={e => setVerifyForm(p => ({ ...p, message: e.target.value }))} placeholder="Add a personal note to your verifier..." className="min-h-[60px] text-sm" />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleSendVerification} disabled={sendingVerification}>
                      <Send className="w-4 h-4 mr-2" />
                      {sendingVerification ? "Sending..." : "Send Verification Request"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {verifications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No verification requests yet</p>
              ) : (
                <div className="space-y-2">
                  {verifications.map(v => (
                    <div key={v.id} className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-muted/10">
                      <div className="mt-0.5">
                        {v.status === "verified" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {v.status === "pending" && <Clock className="w-4 h-4 text-amber-500" />}
                        {v.status === "declined" && <XCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight truncate">{v.roleTitle}</p>
                        <p className="text-xs text-muted-foreground">{v.company}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{v.verifierName}</span>
                          <span className="text-[10px] text-muted-foreground">&middot;</span>
                          <Badge variant={v.status === "verified" ? "default" : v.status === "declined" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                            {v.status === "verified" ? "Verified" : v.status === "declined" ? "Declined" : "Pending"}
                          </Badge>
                          {v.status === "pending" && (
                            <Button variant="ghost" size="sm" className="h-4 px-1 text-[10px] text-muted-foreground hover:text-destructive" onClick={() => handleCancelVerification(v.id)}>
                              <X className="w-3 h-3 mr-0.5" /> Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Permanently delete your account and all associated data including your profile, matches, and applications. This action cannot be undone.
              </p>
              <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeleteConfirmText(""); }}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete My Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete your candidate profile, all job matches, applications, and any other data associated with your account.
                    </p>
                    <p className="text-sm font-medium">
                      Type <span className="font-mono text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">DELETE</span> to confirm:
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="font-mono"
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText(""); }}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || deleting}
                    >
                      {deleting ? "Deleting..." : "Permanently Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">

          {/* Preferences */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Job Type</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {JOB_TYPE_OPTIONS.map((opt) => {
                        const selected = editForm.preferredJobTypes.includes(opt.value);
                        return (
                          <Badge
                            key={opt.value}
                            variant={selected ? "default" : "outline"}
                            className={`px-2.5 py-1 text-xs cursor-pointer transition-colors ${selected ? "" : "hover:bg-muted"}`}
                            onClick={() => {
                              const updated = selected
                                ? editForm.preferredJobTypes.filter(v => v !== opt.value)
                                : [...editForm.preferredJobTypes, opt.value];
                              updateField("preferredJobTypes", updated);
                            }}
                          >
                            {opt.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Workplace</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {WORKPLACE_OPTIONS.map((opt) => {
                        const selected = editForm.preferredWorkplaces.includes(opt.value);
                        return (
                          <Badge
                            key={opt.value}
                            variant={selected ? "default" : "outline"}
                            className={`px-2.5 py-1 text-xs cursor-pointer transition-colors ${selected ? "" : "hover:bg-muted"}`}
                            onClick={() => {
                              const updated = selected
                                ? editForm.preferredWorkplaces.filter(v => v !== opt.value)
                                : [...editForm.preferredWorkplaces, opt.value];
                              updateField("preferredWorkplaces", updated);
                            }}
                          >
                            {opt.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Industry</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {INDUSTRY_OPTIONS.map((opt) => {
                        const selected = editForm.preferredIndustries.includes(opt.value);
                        return (
                          <Badge
                            key={opt.value}
                            variant={selected ? "default" : "outline"}
                            className={`px-2.5 py-1 text-xs cursor-pointer transition-colors ${selected ? "" : "hover:bg-muted"}`}
                            onClick={() => {
                              const updated = selected
                                ? editForm.preferredIndustries.filter(v => v !== opt.value)
                                : [...editForm.preferredIndustries, opt.value];
                              updateField("preferredIndustries", updated);
                            }}
                          >
                            {opt.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Job Type</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {((candidate as any).preferredJobTypes || []).length > 0 ? (
                        ((candidate as any).preferredJobTypes || []).map((v: string) => (
                          <Badge key={v} variant="secondary" className="px-2.5 py-1 text-xs">{JOB_TYPE_LABELS[v] || v}</Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Not set</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Workplace</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {((candidate as any).preferredWorkplaces || []).length > 0 ? (
                        ((candidate as any).preferredWorkplaces || []).map((v: string) => (
                          <Badge key={v} variant="secondary" className="px-2.5 py-1 text-xs">{WORKPLACE_LABELS[v] || v}</Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Not set</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Industry</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {((candidate as any).preferredIndustries || []).length > 0 ? (
                        ((candidate as any).preferredIndustries || []).map((v: string) => (
                          <Badge key={v} variant="secondary" className="px-2.5 py-1 text-xs">{INDUSTRY_LABELS[v] || v}</Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Not set</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  className="min-h-[120px]"
                  value={editForm.summary}
                  onChange={e => updateField("summary", e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{candidate.summary || "No summary added yet."}</p>
              )}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Experience</CardTitle>
                {isEditing && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addExperienceEntry}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Role
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {experienceList.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No experience added yet. Click "Add Role" to get started.</p>
                  )}
                  {experienceList.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                      <div className="absolute top-2 right-2 flex items-center gap-0.5">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => moveExperienceEntry(index, "up")} disabled={index === 0}>
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => moveExperienceEntry(index, "down")} disabled={index === experienceList.length - 1}>
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeExperienceEntry(index)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Job Title</label>
                          <Input value={entry.jobTitle} onChange={e => updateExperienceEntry(index, "jobTitle", e.target.value)} placeholder="e.g. Senior Developer" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Company</label>
                          <Input value={entry.company} onChange={e => updateExperienceEntry(index, "company", e.target.value)} placeholder="e.g. Acme Corp" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                          <Input type="month" value={entry.startDate} onChange={e => updateExperienceEntry(index, "startDate", e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">End Date</label>
                          <Input type="month" value={entry.endDate} onChange={e => updateExperienceEntry(index, "endDate", e.target.value)} disabled={entry.current} placeholder={entry.current ? "Present" : ""} className="h-8 text-sm" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input type="checkbox" checked={entry.current} onChange={e => updateExperienceEntry(index, "current", e.target.checked)} className="rounded border-border" />
                        I currently work here
                      </label>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                        <Textarea value={entry.description} onChange={e => updateExperienceEntry(index, "description", e.target.value)} placeholder="Describe your responsibilities and achievements..." className="min-h-[80px] text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {experienceList.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No experience added yet.</p>
                  ) : (
                    experienceList.map((entry, index) => (
                      <div key={index} className={`relative pl-6 pb-5 ${index < experienceList.length - 1 ? "border-l-2 border-muted ml-1.5" : "ml-1.5"}`}>
                        <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-sm text-foreground">{entry.jobTitle || "Untitled Role"}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Briefcase className="w-3 h-3" /> {entry.company || "Unknown Company"}
                            </p>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {entry.startDate || "?"} — {entry.current ? "Present" : entry.endDate || "?"}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

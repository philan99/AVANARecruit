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
import { UserCircle, Mail, Phone, MapPin, GraduationCap, Briefcase, Edit, X, Save, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditFormState {
  name: string;
  email: string;
  phone: string;
  currentTitle: string;
  summary: string;
  skills: string;
  experienceYears: number;
  education: string;
  location: string;
}

export default function CandidateProfile() {
  const { candidateProfileId } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [editForm, setEditForm] = useState<EditFormState>({
    name: "", email: "", phone: "", currentTitle: "",
    summary: "", skills: "", experienceYears: 0, education: "", location: "",
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
        location: candidate.location,
      });
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
        location: candidate.location,
      });
    }
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
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
      location: editForm.location,
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
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
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
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Education</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-1.5">
              <Input value={editForm.education} onChange={e => updateField("education", e.target.value)} />
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <GraduationCap className="w-5 h-5 mr-2" />
              <span>{candidate.education}</span>
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
            <div className="space-y-1.5">
              <Input
                value={editForm.skills}
                onChange={e => updateField("skills", e.target.value)}
                placeholder="React, TypeScript, Node.js (comma separated)"
              />
              <p className="text-xs text-muted-foreground">Separate skills with commas</p>
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
    </div>
  );
}

import { useState, useRef } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getGetCompanyProfileQueryKey,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useRole } from "@/contexts/role-context";
import { CITY_SUGGESTIONS } from "@/lib/cities";
import { useIndustries } from "@/hooks/use-industries";
import { safeExternalUrl } from "@/lib/safeUrl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Users,
  Upload,
  Pencil,
  Camera,
  Mail,
  Trash2,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  size: z.string().optional(),
  founded: z.string().optional(),
});

const companySizes = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5000+",
];

export default function CompanyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { companyProfileId, clearRole } = useRole();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const basePath = `${import.meta.env.BASE_URL}api/storage`.replace(/\/\//g, "/");
  const apiBasePath2 = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const { data: profile, isLoading, error } = useQuery({
    queryKey: getGetCompanyProfileQueryKey(),
    queryFn: async () => {
      const url = companyProfileId
        ? `${apiBasePath2}/company-profile?companyId=${companyProfileId}`
        : `${apiBasePath2}/company-profile`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch company profile");
      return res.json();
    },
    retry: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const apiBasePath = apiBasePath2;

  async function updateProfile(data: Record<string, unknown>) {
    if (!profile?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${apiBasePath}/company-profile/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      queryClient.invalidateQueries({ queryKey: getGetCompanyProfileQueryKey() });
      return await res.json();
    } finally {
      setIsSaving(false);
    }
  }

  const { uploadFile, isUploading } = useUpload({
    basePath,
    onSuccess: async (response) => {
      const logoUrl = `${import.meta.env.BASE_URL}api/storage${response.objectPath}`.replace(/\/\//g, "/");
      try {
        await updateProfile({ ...form.getValues(), name: form.getValues().name || profile?.name || "My Company", logoUrl });
        toast({ title: "Logo updated", description: "Company logo has been updated." });
      } catch {
        toast({ title: "Error", description: "Failed to save logo.", variant: "destructive" });
      }
    },
    onError: (err) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const { data: industries = [] } = useIndustries();
  const industryLabel = (code: string | null | undefined) =>
    industries.find(i => i.value === code)?.label || code || "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      industry: "",
      website: "",
      linkedinUrl: "",
      twitterUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      location: "",
      description: "",
      size: "",
      founded: "",
    },
  });

  const hasProfile = !!profile && !error;

  function startEditing() {
    if (profile) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
        industry: profile.industry || "",
        website: profile.website || "",
        linkedinUrl: profile.linkedinUrl || "",
        twitterUrl: profile.twitterUrl || "",
        facebookUrl: profile.facebookUrl || "",
        instagramUrl: profile.instagramUrl || "",
        location: profile.location || "",
        description: profile.description || "",
        size: profile.size || "",
        founded: profile.founded || "",
      });
    }
    setIsEditing(true);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: Record<string, unknown> = { ...values };
    if (profile?.logoUrl) {
      payload.logoUrl = profile.logoUrl;
    }
    try {
      await updateProfile(payload);
      toast({ title: "Profile saved", description: "Company profile has been updated." });
      setIsEditing(false);
    } catch {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    }
  }

  async function handleDeleteAccount() {
    if (!profile?.id || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch(`${apiBasePath}/companies/${profile.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      toast({ title: "Account deleted", description: "Your company account and all associated data have been permanently removed." });
      setDeleteDialogOpen(false);
      clearRole();
      setLocation("/");
      window.location.reload();
    } catch {
      toast({ title: "Error", description: "Failed to delete account. Please try again.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  function handleLogoClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 5MB.", variant: "destructive" });
      return;
    }
    await uploadFile(file);
    e.target.value = "";
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading company profile...</div>;
  }

  if (!hasProfile && !isEditing) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Building2 className="mr-3 text-primary" /> Company Profile
          </h1>
          <p className="text-muted-foreground mt-1">Set up your company profile to attract top talent.</p>
        </div>

        <Card className="bg-card">
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Company Profile Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Create your company profile to start posting jobs and finding the best candidates.
            </p>
            <Button onClick={startEditing}>
              Create Company Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Building2 className="mr-3 text-primary" />
            {hasProfile ? "Edit Company Profile" : "Create Company Profile"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasProfile ? "Update your company information." : "Fill in your company details to get started."}
          </p>
        </div>

        <Card className="bg-card">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="admin@acme.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((ind) => (
                            <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</FormLabel>
                      <FormControl><Input placeholder="https://linkedin.com/company/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="twitterUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5" /> X / Twitter</FormLabel>
                      <FormControl><Input placeholder="https://x.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5" /> Facebook</FormLabel>
                      <FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5" /> Instagram</FormLabel>
                      <FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Start typing a city..."
                          list="company-city-suggestions"
                          {...field}
                        />
                      </FormControl>
                      <datalist id="company-city-suggestions">
                        {CITY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                      </datalist>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="size" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>{size} employees</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="founded" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founded Year</FormLabel>
                      <FormControl><Input placeholder="2020" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="h-32"
                        placeholder="Tell candidates about your company, culture, and what makes you unique..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end gap-3 pt-4">
                  {hasProfile && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Building2 className="mr-3 text-primary" /> Company Profile
          </h1>
          <p className="text-muted-foreground mt-1">Your company information visible to candidates.</p>
        </div>
        <Button variant="outline" size="sm" onClick={startEditing}>
          <Pencil className="w-4 h-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative group shrink-0">
              {profile!.logoUrl ? (
                <img
                  src={profile!.logoUrl}
                  alt={`${profile!.name} logo`}
                  className="w-24 h-24 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-border">
                  {profile!.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleLogoClick}
                disabled={isUploading}
                className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {isUploading ? (
                  <Upload className="w-6 h-6 text-white animate-pulse" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">{profile!.name}</h2>
              {profile!.industry && (
                <p className="text-lg text-primary font-medium mb-3">{industryLabel(profile!.industry)}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile!.email && (
                  <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5" /> {profile!.email}</span>
                )}
                {profile!.location && (
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {profile!.location}</span>
                )}
                {profile!.website && (
                  <a href={profile!.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors">
                    <Globe className="w-4 h-4 mr-1.5" /> {profile!.website}
                  </a>
                )}
                {profile!.size && (
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1.5" /> {profile!.size} employees</span>
                )}
                {profile!.founded && (
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> Founded {profile!.founded}</span>
                )}
              </div>
              {(() => {
                const links = [
                  { url: safeExternalUrl(profile!.linkedinUrl), Icon: Linkedin, label: "LinkedIn" },
                  { url: safeExternalUrl(profile!.twitterUrl), Icon: Twitter, label: "X / Twitter" },
                  { url: safeExternalUrl(profile!.facebookUrl), Icon: Facebook, label: "Facebook" },
                  { url: safeExternalUrl(profile!.instagramUrl), Icon: Instagram, label: "Instagram" },
                ].filter(l => l.url);
                if (links.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {links.map(({ url, Icon, label }) => (
                      <a key={label} href={url!} target="_blank" rel="noopener noreferrer" aria-label={label}
                         className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {profile!.description && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{profile!.description}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Permanently delete your company account and all associated data including your profile, jobs, matches, bookmarks, and candidate alerts. This action cannot be undone.
          </p>
          <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeleteConfirmText(""); }}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Company Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete Company Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will permanently delete your company profile, all job postings, matches, applications, bookmarks, candidate alerts, and any other data associated with your account.
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
  );
}

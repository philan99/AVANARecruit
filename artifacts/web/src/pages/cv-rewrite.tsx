import { useState, useRef } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { useRole } from "@/contexts/role-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Wand2,
  FileText,
  Upload,
  Download,
  RefreshCcw,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { useGetCandidate, getGetCandidateQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type RewriteTone = "concise_impact" | "narrative" | "formal_corporate";
type RewriteLength = "similar" | "shorter" | "longer";

interface RewrittenExperience {
  title: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
}
interface RewrittenEducation {
  qualification: string;
  institution: string;
  dates?: string;
  details?: string;
}
interface RewrittenAdditionalSection {
  title: string;
  items: string[];
}
interface RewrittenCv {
  name: string;
  headline?: string;
  contact: { email?: string; phone?: string; location?: string; linkedin?: string };
  summary: string;
  experience: RewrittenExperience[];
  education: RewrittenEducation[];
  skills: string[];
  qualifications?: string[];
  additional?: RewrittenAdditionalSection[];
}

const TONE_LABEL: Record<RewriteTone, string> = {
  concise_impact: "Concise & impact-led",
  narrative: "Narrative & detailed",
  formal_corporate: "Formal corporate",
};
const LENGTH_LABEL: Record<RewriteLength, string> = {
  similar: "Keep similar length",
  shorter: "Shorten it",
  longer: "Expand it",
};

const ACCEPTED_TYPES = ".pdf,.docx,.txt";

export default function CvRewrite() {
  const { candidateProfileId } = useRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const basePath = `${import.meta.env.BASE_URL}api/storage`.replace(/\/\//g, "/");

  const { data: candidate, isLoading: candidateLoading } = useGetCandidate(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateQueryKey(candidateProfileId!) },
  });
  const hasStoredCv = !!(candidate as any)?.cvFile;
  const storedCvName = (candidate as any)?.cvFileName || "your stored CV";

  // Source
  const [source, setSource] = useState<"stored" | "uploaded">("stored");
  const [uploadedCvFile, setUploadedCvFile] = useState<string | null>(null);
  const [uploadedCvFileName, setUploadedCvFileName] = useState<string | null>(null);

  const cvUploadNameRef = useRef("");
  const cvFileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFile: uploadTempCv, isUploading: isUploadingCv } = useUpload({
    basePath,
    onSuccess: (response: any) => {
      setUploadedCvFile(response.objectPath);
      setUploadedCvFileName(cvUploadNameRef.current || "Uploaded CV");
      setSource("uploaded");
      toast({ title: "CV ready", description: "Your file is ready for the rewrite." });
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Could not upload that file.", variant: "destructive" });
    },
  });

  async function handleCvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ok = /\.(pdf|docx|txt)$/i.test(file.name);
    if (!ok) {
      toast({ title: "Wrong file type", description: "Please upload a PDF, .docx or .txt file.", variant: "destructive" });
      return;
    }
    cvUploadNameRef.current = file.name;
    await uploadTempCv(file);
  }

  // Questions
  const [targetRoleOrIndustry, setTargetRoleOrIndustry] = useState("");
  const [tone, setTone] = useState<RewriteTone>("concise_impact");
  const [length, setLength] = useState<RewriteLength>("similar");
  const [emphasise, setEmphasise] = useState("");
  const [deemphasise, setDeemphasise] = useState("");

  // Job description
  const [jdMode, setJdMode] = useState<"paste" | "upload">("paste");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<string | null>(null);
  const [jdFileName, setJdFileName] = useState<string | null>(null);

  const jdUploadNameRef = useRef("");
  const jdFileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFile: uploadJd, isUploading: isUploadingJd } = useUpload({
    basePath,
    onSuccess: (response: any) => {
      setJdFile(response.objectPath);
      setJdFileName(jdUploadNameRef.current || "Job description");
      toast({ title: "Job description ready", description: "We'll read it during the rewrite." });
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Could not upload that file.", variant: "destructive" });
    },
  });

  async function handleJdFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ok = /\.(pdf|docx|txt)$/i.test(file.name);
    if (!ok) {
      toast({ title: "Wrong file type", description: "Please upload a PDF, .docx or .txt file.", variant: "destructive" });
      return;
    }
    jdUploadNameRef.current = file.name;
    await uploadJd(file);
  }

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [rewritten, setRewritten] = useState<RewrittenCv | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Action state
  const [downloadingFormat, setDownloadingFormat] = useState<"docx" | "pdf" | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [replaceFormat, setReplaceFormat] = useState<"docx" | "pdf">("docx");

  const sourceReady =
    source === "stored" ? hasStoredCv : !!uploadedCvFile;

  async function handleGenerate() {
    if (!candidateProfileId) return;
    if (!sourceReady) {
      toast({
        title: "Pick a source first",
        description: source === "stored"
          ? "You don't have a CV stored on your profile. Upload one here first."
          : "Upload your CV to continue.",
        variant: "destructive",
      });
      return;
    }
    setGenerating(true);
    setGenError(null);
    try {
      const body: any = {
        source,
        uploadedCvFile,
        uploadedCvFileName,
        targetRoleOrIndustry: targetRoleOrIndustry.trim() || null,
        tone,
        length,
        emphasise: emphasise.trim() || null,
        deemphasise: deemphasise.trim() || null,
      };
      if (jdMode === "paste" && jdText.trim()) {
        body.jobDescriptionText = jdText.trim();
      } else if (jdMode === "upload" && jdFile) {
        body.jobDescriptionFile = jdFile;
        body.jobDescriptionFileName = jdFileName;
      }

      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/cv-rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to rewrite CV.");
      }
      setRewritten(data.rewrittenCv as RewrittenCv);
      // Scroll the preview into view
      setTimeout(() => {
        document.getElementById("cv-rewrite-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      setGenError(err?.message || "Failed to rewrite CV.");
      toast({ title: "Rewrite failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(format: "docx" | "pdf") {
    if (!rewritten || !candidateProfileId) return;
    setDownloadingFormat(format);
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/cv-rewrite/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewrittenCv: rewritten, format }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Download failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (rewritten.name || "candidate").replace(/[^\w\-]+/g, "_").slice(0, 60) || "candidate";
      a.download = `${safeName}_CV.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err: any) {
      toast({ title: "Download failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setDownloadingFormat(null);
    }
  }

  async function handleReplace() {
    if (!rewritten || !candidateProfileId) return;
    setReplacing(true);
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/cv-rewrite/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewrittenCv: rewritten, format: replaceFormat }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not replace your CV.");
      queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
      setReplaceConfirmOpen(false);
      toast({
        title: "CV replaced",
        description: "Your stored CV has been updated to the rewritten version.",
      });
    } catch (err: any) {
      toast({ title: "Replace failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setReplacing(false);
    }
  }

  function handleStartOver() {
    setRewritten(null);
    setGenError(null);
    setUploadedCvFile(null);
    setUploadedCvFileName(null);
    setJdFile(null);
    setJdFileName(null);
    setJdText("");
    setEmphasise("");
    setDeemphasise("");
    setTargetRoleOrIndustry("");
    setSource(hasStoredCv ? "stored" : "uploaded");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!candidateProfileId) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sign in to your candidate profile to use the CV rewrite tool.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex w-12 h-12 rounded-lg bg-primary/10 items-center justify-center shrink-0">
          <Wand2 className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Rewrite my CV</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use your stored CV (or upload a different one), tell us how you want it rewritten, and we'll
            generate a clean version you can download as Word or PDF — or save back to your profile.
          </p>
        </div>
      </div>

      {/* STEP 1 — Source */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium inline-flex items-center justify-center">1</span>
            Pick a CV to start from
          </CardTitle>
          <CardDescription>This file will only be used to generate your rewrite — we won't change anything on your profile unless you ask us to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={source} onValueChange={(v) => setSource(v as "stored" | "uploaded")} className="grid gap-3 sm:grid-cols-2">
            <Label
              htmlFor="src-stored"
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover-elevate ${source === "stored" ? "border-primary bg-primary/5" : ""}`}
            >
              <RadioGroupItem id="src-stored" value="stored" className="mt-0.5" disabled={!hasStoredCv && !candidateLoading} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Use the CV on my profile</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {candidateLoading
                    ? "Loading…"
                    : hasStoredCv
                    ? <>We'll start from <span className="font-medium text-foreground">{storedCvName}</span>.</>
                    : "You don't have a CV stored yet — pick the upload option."}
                </div>
              </div>
            </Label>

            <Label
              htmlFor="src-uploaded"
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover-elevate ${source === "uploaded" ? "border-primary bg-primary/5" : ""}`}
            >
              <RadioGroupItem id="src-uploaded" value="uploaded" className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Upload a different CV</div>
                <div className="text-xs text-muted-foreground mt-0.5">PDF, .docx or .txt. Used for this session only.</div>
              </div>
            </Label>
          </RadioGroup>

          {source === "uploaded" && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <input
                ref={cvFileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleCvFile}
                className="hidden"
              />
              {uploadedCvFile ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{uploadedCvFileName}</p>
                    <p className="text-xs text-muted-foreground">Uploaded — will be used for this rewrite only</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setUploadedCvFile(null); setUploadedCvFileName(null); }}>
                    <X className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => cvFileInputRef.current?.click()}
                  disabled={isUploadingCv}
                  className="w-full sm:w-auto"
                >
                  {isUploadingCv ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isUploadingCv ? "Uploading…" : "Upload a CV"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* STEP 2 — Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium inline-flex items-center justify-center">2</span>
            How would you like it rewritten?
          </CardTitle>
          <CardDescription>All of these are optional. Leave them blank for a faithful rewrite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="rewrite-target">Target role or industry</Label>
            <Input
              id="rewrite-target"
              value={targetRoleOrIndustry}
              onChange={(e) => setTargetRoleOrIndustry(e.target.value)}
              placeholder="e.g. Senior Product Manager, FinTech"
            />
            <p className="text-xs text-muted-foreground">If you have one in mind, we'll lead with the most relevant evidence.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as RewriteTone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TONE_LABEL) as RewriteTone[]).map(k => (
                    <SelectItem key={k} value={k}>{TONE_LABEL[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as RewriteLength)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(LENGTH_LABEL) as RewriteLength[]).map(k => (
                    <SelectItem key={k} value={k}>{LENGTH_LABEL[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rewrite-emphasise">Emphasise</Label>
              <Textarea
                id="rewrite-emphasise"
                value={emphasise}
                onChange={(e) => setEmphasise(e.target.value)}
                placeholder="e.g. leadership of cross-functional teams, recent AI work"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rewrite-deemphasise">De-emphasise / remove</Label>
              <Textarea
                id="rewrite-deemphasise"
                value={deemphasise}
                onChange={(e) => setDeemphasise(e.target.value)}
                placeholder="e.g. shorten my early retail roles, drop the 2008 internship"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STEP 3 — Job description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium inline-flex items-center justify-center">3</span>
            Tailor to a job description (optional)
          </CardTitle>
          <CardDescription>
            If you're applying for a specific role, drop the JD in here. We use it for this rewrite only — it isn't saved against your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={jdMode} onValueChange={(v) => setJdMode(v as "paste" | "upload")}>
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
              <TabsTrigger value="paste">Paste text</TabsTrigger>
              <TabsTrigger value="upload">Upload file</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="mt-4">
              <Textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={8}
              />
              {jdText.trim().length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">{jdText.trim().split(/\s+/).length} words pasted</p>
              )}
            </TabsContent>
            <TabsContent value="upload" className="mt-4 space-y-3">
              <input
                ref={jdFileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleJdFile}
                className="hidden"
              />
              {jdFile ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{jdFileName}</p>
                    <p className="text-xs text-muted-foreground">Will be used for this rewrite only — never stored against your profile.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setJdFile(null); setJdFileName(null); }}>
                    <X className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => jdFileInputRef.current?.click()}
                  disabled={isUploadingJd}
                  className="w-full sm:w-auto"
                >
                  {isUploadingJd ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isUploadingJd ? "Uploading…" : "Upload job description"}
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generate */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground sm:max-w-md">
          We'll never invent qualifications, employers or metrics that aren't in your source CV.
        </p>
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={generating || !sourceReady}
          className="sm:min-w-[220px]"
        >
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {generating ? "Generating your rewrite…" : (rewritten ? "Generate again" : "Generate rewrite")}
        </Button>
      </div>

      {genError && !generating && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{genError}</span>
        </div>
      )}

      {/* Result */}
      {rewritten && (
        <div id="cv-rewrite-preview" className="space-y-4">
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Your rewritten CV</h2>
              <p className="text-xs text-muted-foreground">Preview below. Download in your preferred format, or save it back to your profile.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleDownload("docx")} disabled={!!downloadingFormat}>
                {downloadingFormat === "docx" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Download .docx
              </Button>
              <Button variant="outline" onClick={() => handleDownload("pdf")} disabled={!!downloadingFormat}>
                {downloadingFormat === "pdf" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Download .pdf
              </Button>
              <Button variant="outline" onClick={() => setReplaceConfirmOpen(true)}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Replace my stored CV
              </Button>
              <Button variant="ghost" onClick={handleStartOver}>
                <X className="w-4 h-4 mr-2" />
                Start over
              </Button>
            </div>
          </div>

          <CvPreview cv={rewritten} />
        </div>
      )}

      {/* Confirm replace */}
      <AlertDialog open={replaceConfirmOpen} onOpenChange={setReplaceConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your stored CV?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasStoredCv
                ? <>This will overwrite <span className="font-medium">{storedCvName}</span> on your profile with the rewritten version. You won't be able to undo this. Pick the file format below.</>
                : <>This will save the rewritten CV as the CV on your profile. Pick the file format below.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-xs">File format</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={replaceFormat === "docx" ? "default" : "outline"}
                size="sm"
                onClick={() => setReplaceFormat("docx")}
              >.docx</Button>
              <Button
                variant={replaceFormat === "pdf" ? "default" : "outline"}
                size="sm"
                onClick={() => setReplaceFormat("pdf")}
              >.pdf</Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={replacing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleReplace(); }} disabled={replacing}>
              {replacing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Replacing…</> : "Replace CV"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// -------------------------------------------------------------
// Inline preview of the rewritten CV
// -------------------------------------------------------------

function CvPreview({ cv }: { cv: RewrittenCv }) {
  const contactBits = [cv.contact.email, cv.contact.phone, cv.contact.location, cv.contact.linkedin]
    .map(s => (s || "").trim())
    .filter(Boolean);

  return (
    <Card>
      <CardContent className="p-6 sm:p-10">
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">{cv.name || "—"}</h3>
          {cv.headline && <p className="text-sm text-muted-foreground mt-1">{cv.headline}</p>}
          {contactBits.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">{contactBits.join("  ·  ")}</p>
          )}
        </div>

        {cv.summary && (
          <div className="mt-8">
            <SectionHeading>Profile</SectionHeading>
            <p className="text-sm leading-relaxed">{cv.summary}</p>
          </div>
        )}

        {cv.experience.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Experience</SectionHeading>
            <div className="space-y-4">
              {cv.experience.map((role, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-sm">
                      {role.title}
                      {role.company && <span className="font-normal"> — {role.company}</span>}
                    </p>
                    {role.dates && <p className="text-xs text-muted-foreground">{role.dates}</p>}
                  </div>
                  {role.location && <p className="text-xs text-muted-foreground italic">{role.location}</p>}
                  {role.bullets.length > 0 && (
                    <ul className="mt-1.5 space-y-1 list-disc pl-5 text-sm leading-relaxed">
                      {role.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cv.education.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Education</SectionHeading>
            <div className="space-y-2">
              {cv.education.map((ed, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-sm">
                      {[ed.qualification, ed.institution].filter(Boolean).join(" — ")}
                    </p>
                    {ed.dates && <p className="text-xs text-muted-foreground">{ed.dates}</p>}
                  </div>
                  {ed.details && <p className="text-xs text-muted-foreground">{ed.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {cv.skills.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Skills</SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {cv.skills.map((s, i) => (
                <Badge key={i} variant="secondary" className="font-normal">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {cv.qualifications && cv.qualifications.length > 0 && (
          <div className="mt-6">
            <SectionHeading>Certifications</SectionHeading>
            <ul className="space-y-1 list-disc pl-5 text-sm">
              {cv.qualifications.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        )}

        {(cv.additional || []).map((sec, i) => (
          <div className="mt-6" key={i}>
            <SectionHeading>{sec.title}</SectionHeading>
            <ul className="space-y-1 list-disc pl-5 text-sm">
              {sec.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary border-b pb-1.5 mb-3">
      {children}
    </h4>
  );
}

import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCandidate, getGetCandidateQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";
import { useUpload } from "@workspace/object-storage-web";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Briefcase, Target, ShieldCheck,
  Upload, FileText, X, Plus, Sparkles, AlertCircle, GraduationCap,
  MapPin, Heart,
} from "lucide-react";
import logoUrl from "@assets/AVANA_Recruit_1776280304155.png";

type OnboardingState = {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  completedAt: string | null;
};

const TOTAL_STEPS = 7;
const STEP_TITLES = [
  "Welcome",
  "Upload your CV",
  "The basics",
  "Your skills",
  "Education",
  "What you're looking for",
  "All set",
];

const POPULAR_SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python",
  "SQL", "AWS", "Docker", "Kubernetes", "GraphQL",
  "Project Management", "Agile", "Scrum", "Communication", "Leadership",
];

const JOB_TYPES: { value: string; label: string }[] = [
  { value: "permanent_full_time", label: "Permanent (Full Time)" },
  { value: "contract", label: "Contract" },
  { value: "fixed_term_contract", label: "Fixed Term Contract" },
  { value: "part_time", label: "Part-time" },
  { value: "temporary", label: "Temporary" },
];
const WORKPLACES = ["Remote", "Hybrid", "On-site"];
const INDUSTRIES: { value: string; label: string }[] = [
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

export default function Onboarding() {
  const { candidateProfileId } = useRole();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const storageBase = `${import.meta.env.BASE_URL}api/storage`.replace(/\/\//g, "/");

  const { data: candidate } = useGetCandidate(candidateProfileId!, {
    query: { enabled: !!candidateProfileId, queryKey: getGetCandidateQueryKey(candidateProfileId!) },
  });

  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [obState, setObState] = useState<OnboardingState>({
    currentStep: 1, completedSteps: [], skippedSteps: [], completedAt: null,
  });

  // Hydrate step + state from server only once (when candidate first loads)
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current && candidate) {
      hydrated.current = true;
      const fromServer = ((candidate as any)?.onboardingState as OnboardingState | null) ?? null;
      if (fromServer?.completedAt) {
        setLocation("/");
        return;
      }
      const merged: OnboardingState = {
        currentStep: Math.max(1, Math.min(TOTAL_STEPS, fromServer?.currentStep || 1)),
        completedSteps: fromServer?.completedSteps || [],
        skippedSteps: fromServer?.skippedSteps || [],
        completedAt: null,
      };
      setObState(merged);
      setStep(merged.currentStep);
    }
  }, [candidate]);

  // Form state — pre-filled from candidate
  const [phone, setPhone] = useState("");
  const [location, setLocationField] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [experienceYears, setExperienceYears] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [education, setEducation] = useState("");
  const [educationDetails, setEducationDetails] = useState("");
  const [preferredJobTypes, setPreferredJobTypes] = useState<string[]>([]);
  const [preferredWorkplaces, setPreferredWorkplaces] = useState<string[]>([]);
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);

  const formHydrated = useRef(false);
  useEffect(() => {
    if (!formHydrated.current && candidate) {
      formHydrated.current = true;
      setPhone(candidate.phone || "");
      setLocationField(candidate.location || "");
      setCurrentTitle(candidate.currentTitle && candidate.currentTitle !== "Not specified" ? candidate.currentTitle : "");
      setExperienceYears(candidate.experienceYears ? String(candidate.experienceYears) : "");
      setSummary(candidate.summary || "");
      setSkills(candidate.skills || []);
      setEducation(candidate.education || "");
      setEducationDetails(candidate.educationDetails || "");
      setPreferredJobTypes(candidate.preferredJobTypes || []);
      setPreferredWorkplaces(candidate.preferredWorkplaces || []);
      setPreferredIndustries(candidate.preferredIndustries || []);
    }
  }, [candidate]);

  const cvFileNameRef = useRef("");
  const { uploadFile: uploadCv, isUploading: isCvUploading } = useUpload({
    basePath: storageBase,
    onSuccess: async (response) => {
      if (!candidateProfileId) return;
      const savedName = cvFileNameRef.current || "CV Document";
      await fetch(`${apiBase}/candidates/${candidateProfileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvFile: response.objectPath, cvFileName: savedName }),
      });
      queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
      toast({ title: "CV uploaded", description: "Your CV has been saved." });
      cvFileNameRef.current = "";
    },
    onError: () => toast({ title: "Upload failed", description: "Could not upload CV.", variant: "destructive" }),
  });

  async function persistOnboarding(nextStep: number, opts: { completed?: boolean; skipped?: boolean; finishNow?: boolean } = {}): Promise<boolean> {
    if (!candidateProfileId) return false;
    const next: OnboardingState = {
      currentStep: opts.finishNow ? TOTAL_STEPS : nextStep,
      completedSteps: opts.completed
        ? Array.from(new Set([...(obState.completedSteps || []), step]))
        : (obState.completedSteps || []),
      skippedSteps: opts.skipped
        ? Array.from(new Set([...(obState.skippedSteps || []), step]))
        : (obState.skippedSteps || []),
      completedAt: opts.finishNow ? new Date().toISOString() : null,
    };
    const res = await fetch(`${apiBase}/candidates/${candidateProfileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingState: next }),
    });
    if (!res.ok) {
      toast({ title: "Couldn't save progress", description: "Please try again.", variant: "destructive" });
      return false;
    }
    setObState(next);
    queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateProfileId) });
    return true;
  }

  async function patchCandidate(payload: Record<string, unknown>): Promise<boolean> {
    if (!candidateProfileId) return false;
    const res = await fetch(`${apiBase}/candidates/${candidateProfileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }

  async function saveStepData(): Promise<boolean> {
    if (!candidateProfileId) return false;
    let ok = true;
    switch (step) {
      case 3:
        ok = await patchCandidate({
          phone: phone || null,
          location: location || "Not specified",
          currentTitle: currentTitle || "Not specified",
          experienceYears: experienceYears ? parseInt(experienceYears, 10) || 0 : 0,
          summary: summary || "",
        });
        break;
      case 4:
        ok = await patchCandidate({ skills });
        break;
      case 5:
        ok = await patchCandidate({
          education: education || "Not specified",
          educationDetails: educationDetails || null,
        });
        break;
      case 6:
        ok = await patchCandidate({ preferredJobTypes, preferredWorkplaces, preferredIndustries });
        break;
    }
    if (!ok) toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
    return ok;
  }

  async function handleNext() {
    if (saving) return;
    setSaving(true);
    try {
      const dataOk = await saveStepData();
      if (!dataOk) return;
      const nextStep = step + 1;
      const persisted = await persistOnboarding(nextStep, { completed: true, finishNow: nextStep > TOTAL_STEPS });
      if (!persisted) return;
      if (nextStep > TOTAL_STEPS) {
        toast({ title: "All set!", description: "Your profile is ready." });
        setLocation("/my-matches");
      } else {
        setStep(nextStep);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    if (saving) return;
    setSaving(true);
    try {
      const nextStep = step + 1;
      const persisted = await persistOnboarding(nextStep, { skipped: true, finishNow: nextStep > TOTAL_STEPS });
      if (!persisted) return;
      if (nextStep > TOTAL_STEPS) {
        toast({ title: "All set!", description: "You can finish anytime from your dashboard." });
        setLocation("/my-matches");
      } else {
        setStep(nextStep);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleBack() {
    if (saving || step <= 1) return;
    setSaving(true);
    try {
      const prev = step - 1;
      const persisted = await persistOnboarding(prev);
      if (!persisted) return;
      setStep(prev);
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    if (saving) return;
    setSaving(true);
    try {
      const persisted = await persistOnboarding(TOTAL_STEPS, { completed: true, finishNow: true });
      if (!persisted) return;
      toast({ title: "All set!", description: "Your profile is ready." });
      setLocation("/my-matches");
    } finally {
      setSaving(false);
    }
  }

  function addSkill(s: string) {
    const trimmed = s.trim();
    if (!trimmed) return;
    if (skills.some(x => x.toLowerCase() === trimmed.toLowerCase())) return;
    setSkills([...skills, trimmed]);
    setSkillDraft("");
  }

  function toggleArr(arr: string[], setArr: (v: string[]) => void, v: string) {
    if (arr.includes(v)) setArr(arr.filter(x => x !== v));
    else setArr([...arr, v]);
  }

  const firstName = (candidate?.name || "").split(" ")[0] || "there";
  const progressPct = useMemo(() => Math.round(((step - 1) / TOTAL_STEPS) * 100), [step]);

  if (!candidateProfileId) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: "#f3f4f6" }}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#1a2035" }}>
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="AVANA Recruit" className="h-7 w-auto" />
          </div>
          <span className="text-xs text-slate-300">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="h-1 bg-slate-100">
          <div className="h-1 transition-all duration-300" style={{ width: `${Math.max(progressPct, step === TOTAL_STEPS ? 100 : (step / TOTAL_STEPS) * 100)}%`, backgroundColor: "#4CAF50" }} />
        </div>

        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(76,175,80,0.12)" }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: "#4CAF50" }} />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "#1a2035" }}>Welcome to AVANA Recruit, {firstName}</h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
                Let's get your profile set up so we can match you with the right roles. It takes about 5 minutes — and we'll save your progress as you go.
              </p>
              <div className="space-y-3 text-left max-w-md mx-auto mb-2">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Briefcase className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1a2035" }}>Build a profile that gets noticed</p>
                    <p className="text-xs text-slate-600">A complete profile shows up in more search results.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Target className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1a2035" }}>Get matched to jobs that fit</p>
                    <p className="text-xs text-slate-600">Our AI ranks roles by your skills, experience and location.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1a2035" }}>Stand out with verifications</p>
                    <p className="text-xs text-slate-600">Adding 3+ references can boost your match score by 30%.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>Upload your CV</h1>
              <p className="text-sm text-slate-600 mb-5">Recruiters will see this when they review your profile. PDF or DOCX recommended.</p>

              {candidate?.cvFile ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" style={{ color: "#4CAF50" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1a2035" }}>{candidate.cvFileName || "CV Document"}</p>
                      <p className="text-xs text-slate-500">CV uploaded</p>
                    </div>
                  </div>
                  <label className="text-xs text-slate-600 hover:underline cursor-pointer">
                    Replace
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      cvFileNameRef.current = f.name;
                      await uploadCv(f);
                      e.target.value = "";
                    }} />
                  </label>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[#4CAF50] hover:bg-slate-50 transition cursor-pointer mb-4">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-semibold" style={{ color: "#1a2035" }}>Click to upload your CV</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOC or DOCX</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    disabled={isCvUploading}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      cvFileNameRef.current = f.name;
                      await uploadCv(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              {isCvUploading && <p className="text-xs text-slate-500">Uploading…</p>}
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>The basics</h1>
              <p className="text-sm text-slate-600 mb-5">These help us match you on location and seniority.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Current job title</label>
                  <Input value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Location</label>
                  <Input value={location} onChange={(e) => setLocationField(e.target.value)} placeholder="e.g. London, UK" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Years of experience</label>
                  <Input type="number" min="0" max="60" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 5" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone (optional)</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 ..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Short summary</label>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A few sentences about your experience and what you're looking for..." className="h-24" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>Your skills</h1>
              <p className="text-sm text-slate-600 mb-4">Skills make up 35% of your match score — the biggest factor.</p>

              {skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Your skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 text-white text-sm px-3 py-1.5 rounded-full" style={{ backgroundColor: "#4CAF50" }}>
                        {s}
                        <button onClick={() => setSkills(skills.filter(x => x !== s))} className="opacity-80 hover:opacity-100">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Popular skills</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SKILLS.filter(s => !skills.some(x => x.toLowerCase() === s.toLowerCase())).map((s) => (
                    <button key={s} onClick={() => addSkill(s)} className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-700 hover:border-[#4CAF50] hover:text-[#4CAF50] text-sm px-3 py-1.5 rounded-full transition-colors">
                      <Plus className="w-3.5 h-3.5" /> {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillDraft); } }}
                  placeholder="Add a custom skill and press Enter"
                />
                <Button type="button" variant="outline" onClick={() => addSkill(skillDraft)}>Add</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>Education</h1>
              <p className="text-sm text-slate-600 mb-5">Your highest qualification helps with role-specific matching.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Highest qualification</label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                      <SelectItem value="Master's">Master's</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Details (institution, course, year)</label>
                  <Textarea value={educationDetails} onChange={(e) => setEducationDetails(e.target.value)} placeholder="e.g. BSc Computer Science, University College London, 2018" className="h-20" />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>What you're looking for</h1>
              <p className="text-sm text-slate-600 mb-5">We'll prioritise jobs that match your preferences.</p>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Job type</p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((t) => {
                      const active = preferredJobTypes.includes(t.value);
                      return (
                        <button key={t.value} onClick={() => toggleArr(preferredJobTypes, setPreferredJobTypes, t.value)} className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${active ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-300 hover:border-[#4CAF50]"}`} style={active ? { backgroundColor: "#4CAF50" } : {}}>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Workplace</p>
                  <div className="flex flex-wrap gap-2">
                    {WORKPLACES.map((t) => {
                      const active = preferredWorkplaces.includes(t);
                      return (
                        <button key={t} onClick={() => toggleArr(preferredWorkplaces, setPreferredWorkplaces, t)} className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${active ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-300 hover:border-[#4CAF50]"}`} style={active ? { backgroundColor: "#4CAF50" } : {}}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Industries</p>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((t) => {
                      const active = preferredIndustries.includes(t.value);
                      return (
                        <button key={t.value} onClick={() => toggleArr(preferredIndustries, setPreferredIndustries, t.value)} className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${active ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-300 hover:border-[#4CAF50]"}`} style={active ? { backgroundColor: "#4CAF50" } : {}}>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(76,175,80,0.12)" }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#4CAF50" }} />
                </div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a2035" }}>You're all set, {firstName}</h1>
                <p className="text-sm text-slate-600">Your profile is ready. Here's what we found for you.</p>
              </div>

              <div className="rounded-xl p-5 text-white mb-5" style={{ background: "linear-gradient(135deg, #1a2035 0%, #252d4a 100%)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wide text-slate-300">Profile completeness</span>
                  <span className="text-xs text-slate-300">{Math.round(((obState.completedSteps?.length || 0) / TOTAL_STEPS) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div className="h-2 rounded-full" style={{ width: `${Math.round(((obState.completedSteps?.length || 0) / TOTAL_STEPS) * 100)}%`, backgroundColor: "#4CAF50" }} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {location || "No location"}</div>
                  <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {skills.length} skills</div>
                  <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {education || "No education"}</div>
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Boost your score later</p>
              <div className="space-y-1.5 mb-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  Add references and verifications
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Heart className="w-4 h-4 text-amber-500 shrink-0" />
                  Set up job alerts
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {step > 1 && step < TOTAL_STEPS ? (
            <button onClick={handleBack} disabled={saving} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {step < TOTAL_STEPS && step > 1 && (
              <button onClick={handleSkip} disabled={saving} className="text-sm text-slate-500 hover:text-slate-700">Skip</button>
            )}
            {step === 1 && (
              <button onClick={handleSkip} disabled={saving} className="text-sm text-slate-500 hover:text-slate-700">Skip for now</button>
            )}
            {step < TOTAL_STEPS ? (
              <Button onClick={handleNext} disabled={saving} className="font-semibold" style={{ backgroundColor: "#4CAF50" }}>
                {step === 1 ? "Let's get started" : "Continue"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={finish} className="font-semibold" style={{ backgroundColor: "#4CAF50" }}>
                <Sparkles className="w-4 h-4 mr-1" /> View my matches <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
import { Slider } from "@/components/ui/slider";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Briefcase, Target, ShieldCheck,
  Upload, FileText, X, Plus, Sparkles, AlertCircle, GraduationCap,
  MapPin, Heart, Camera, Linkedin, Facebook, Twitter, Globe, Trash2, Briefcase as BriefcaseIcon,
  Loader2,
} from "lucide-react";
import logoUrl from "@assets/Full_Logo_-_GREEN_1776492081935.png";
import { CITY_SUGGESTIONS } from "@/lib/cities";
import { CityCombobox } from "@/components/city-combobox";
import { PostcodeInput } from "@/components/postcode-input";
import { useIndustries } from "@/hooks/use-industries";

type ExperienceEntry = {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

type OnboardingState = {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  completedAt: string | null;
};

const TOTAL_STEPS = 9;

function normalizeUrl(url: string): string | null {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}
const STEP_TITLES = [
  "Welcome",
  "Upload your CV",
  "The basics",
  "Your skills",
  "Experience",
  "Education",
  "Social media",
  "What you're looking for",
  "All set",
];

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
  { code: "+27", flag: "🇿🇦" }, { code: "+55", flag: "🇧🇷" }, { code: "+52", flag: "🇲🇽" },
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
const WORKPLACES: { value: string; label: string }[] = [
  { value: "office", label: "Office" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export default function Onboarding() {
  const { candidateProfileId } = useRole();
  const { data: industriesData = [] } = useIndustries();
  const INDUSTRIES = industriesData;
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
  const [postcode, setPostcode] = useState("");
  const [postcodeCountry, setPostcodeCountry] = useState("United Kingdom");
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [experienceYears, setExperienceYears] = useState<string>("");
  const [maxRadiusMiles, setMaxRadiusMiles] = useState<number>(25);
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [education, setEducation] = useState("");
  const [educationDetails, setEducationDetails] = useState("");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [qualificationDraft, setQualificationDraft] = useState("");
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([]);
  const [preferredJobTypes, setPreferredJobTypes] = useState<string[]>([]);
  const [preferredWorkplaces, setPreferredWorkplaces] = useState<string[]>([]);
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // CV parsing state
  const [parsingCv, setParsingCv] = useState(false);
  const [cvParseError, setCvParseError] = useState<string>("");
  const [cvSummaryMode, setCvSummaryMode] = useState<"verbatim" | "ai">("verbatim");
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());
  const [lowConfidenceFields, setLowConfidenceFields] = useState<Set<string>>(new Set());
  const [prefillBannerDismissed, setPrefillBannerDismissed] = useState(false);
  const [prefillCount, setPrefillCount] = useState(0);

  const formHydrated = useRef(false);
  useEffect(() => {
    if (!formHydrated.current && candidate) {
      formHydrated.current = true;
      const stripPlaceholder = (v?: string | null) => (v && v !== "Not specified" ? v : "");
      setPhone(candidate.phone || "");
      setLocationField(stripPlaceholder(candidate.location));
      setPostcode(((candidate as any).postcode as string) || "");
      setPostcodeCountry(((candidate as any).country as string) || "United Kingdom");
      setCurrentTitle(stripPlaceholder(candidate.currentTitle));
      setExperienceYears(candidate.experienceYears ? String(candidate.experienceYears) : "");
      const r = (candidate as any).maxRadiusMiles;
      if (typeof r === "number") setMaxRadiusMiles(r);
      setSummary(candidate.summary && candidate.summary !== "No summary provided" ? candidate.summary : "");
      setSkills(candidate.skills || []);
      setEducation(stripPlaceholder(candidate.education));
      setEducationDetails(candidate.educationDetails || "");
      setQualifications(((candidate as any).qualifications || []) as string[]);
      const exp = (candidate as any).experience;
      if (Array.isArray(exp)) setExperienceList(exp);
      setPreferredJobTypes(candidate.preferredJobTypes || []);
      setPreferredWorkplaces(candidate.preferredWorkplaces || []);
      setPreferredIndustries(candidate.preferredIndustries || []);
      setLinkedinUrl((candidate as any).linkedinUrl || "");
      setFacebookUrl((candidate as any).facebookUrl || "");
      setTwitterUrl((candidate as any).twitterUrl || "");
      setPortfolioUrl((candidate as any).portfolioUrl || "");
    }
  }, [candidate]);

  function applyCvParse(parsed: any) {
    const prefilled = new Set<string>();
    const mark = (field: string) => prefilled.add(field);
    const hasStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
    const hasArr = (v: unknown): v is unknown[] => Array.isArray(v) && v.length > 0;

    // The user has explicitly asked us to (re-)read this CV — overwrite the
    // form fields with the freshly parsed values so they reflect the uploaded
    // CV, not whatever was previously filled in.
    if (hasStr(parsed.location)) { setLocationField(parsed.location); mark("location"); }
    if (hasStr(parsed.currentTitle)) { setCurrentTitle(parsed.currentTitle); mark("currentTitle"); }
    if (typeof parsed.experienceYears === "number" && parsed.experienceYears > 0) {
      setExperienceYears(String(parsed.experienceYears)); mark("experienceYears");
    }
    if (hasStr(parsed.summary)) { setSummary(parsed.summary); mark("summary"); }
    if (hasArr(parsed.skills)) { setSkills(parsed.skills as string[]); mark("skills"); }
    if (hasStr(parsed.education)) { setEducation(parsed.education); mark("education"); }
    if (hasStr(parsed.educationDetails)) { setEducationDetails(parsed.educationDetails); mark("educationDetails"); }
    if (hasArr(parsed.qualifications)) { setQualifications(parsed.qualifications as string[]); mark("qualifications"); }
    if (hasArr(parsed.experience)) { setExperienceList(parsed.experience as ExperienceEntry[]); mark("experience"); }
    if (hasArr(parsed.preferredJobTypes)) { setPreferredJobTypes(parsed.preferredJobTypes as string[]); mark("preferredJobTypes"); }
    if (hasArr(parsed.preferredWorkplaces)) { setPreferredWorkplaces(parsed.preferredWorkplaces as string[]); mark("preferredWorkplaces"); }
    if (hasArr(parsed.preferredIndustries)) { setPreferredIndustries(parsed.preferredIndustries as string[]); mark("preferredIndustries"); }
    if (hasStr(parsed.linkedinUrl)) { setLinkedinUrl(parsed.linkedinUrl); mark("linkedinUrl"); }
    if (hasStr(parsed.facebookUrl)) { setFacebookUrl(parsed.facebookUrl); mark("facebookUrl"); }
    if (hasStr(parsed.twitterUrl)) { setTwitterUrl(parsed.twitterUrl); mark("twitterUrl"); }
    if (hasStr(parsed.portfolioUrl)) { setPortfolioUrl(parsed.portfolioUrl); mark("portfolioUrl"); }

    setPrefilledFields(prefilled);
    setLowConfidenceFields(new Set((parsed.lowConfidenceFields || []) as string[]));
    setPrefillCount(prefilled.size);
    setPrefillBannerDismissed(false);
    return prefilled.size;
  }

  async function parseCv(candidateId: number, mode: "verbatim" | "ai" = cvSummaryMode) {
    setParsingCv(true);
    setCvParseError("");
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateId}/parse-cv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryMode: mode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as any)?.error || "Couldn't read your CV. You can fill in the details manually.";
        setCvParseError(msg);
        toast({ title: "CV parsing failed", description: msg, variant: "destructive" });
        return;
      }
      const parsed = await res.json();
      const count = applyCvParse(parsed);
      if (count > 0) {
        toast({ title: "CV processed", description: `We pre-filled ${count} field${count === 1 ? "" : "s"} — please review them.` });
      } else {
        toast({ title: "CV processed", description: "Looks like your profile is already filled in. Carry on!" });
      }
    } catch (err) {
      console.error("parse-cv failed", err);
      setCvParseError("We couldn't read your CV right now. You can still fill in the details manually.");
      toast({ title: "CV parsing failed", description: "Please continue filling in the details manually.", variant: "destructive" });
    } finally {
      setParsingCv(false);
    }
  }

  const [fromCvFlow, setFromCvFlow] = useState(false);
  const cvFlowChecked = useRef(false);
  useEffect(() => {
    if (cvFlowChecked.current) return;
    cvFlowChecked.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("parseCv") === "1") {
      setFromCvFlow(true);
      // Strip the query param so a refresh doesn't keep showing the prompt
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, "", cleanUrl);
    }
  }, []);

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
      toast({ title: "CV uploaded", description: "Reading your CV with AI…" });
      cvFileNameRef.current = "";
      // Kick off CV parsing in the background
      parseCv(candidateProfileId);
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
          location: location || "Not specified",
          postcode: postcode || null,
          country: postcodeCountry || "United Kingdom",
          currentTitle: currentTitle || "Not specified",
          experienceYears: experienceYears ? parseInt(experienceYears, 10) || 0 : 0,
          maxRadiusMiles,
          summary: summary || "",
        } as any);
        break;
      case 4:
        ok = await patchCandidate({ skills });
        break;
      case 5:
        ok = await patchCandidate({ experience: experienceList } as any);
        break;
      case 6:
        ok = await patchCandidate({
          education: education || "Not specified",
          educationDetails: educationDetails || null,
          qualifications,
        });
        break;
      case 7:
        ok = await patchCandidate({
          linkedinUrl: normalizeUrl(linkedinUrl),
          facebookUrl: normalizeUrl(facebookUrl),
          twitterUrl: normalizeUrl(twitterUrl),
          portfolioUrl: normalizeUrl(portfolioUrl),
        });
        break;
      case 8:
        ok = await patchCandidate({ preferredJobTypes, preferredWorkplaces, preferredIndustries });
        break;
    }
    if (!ok) toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
    return ok;
  }

  async function handleNext() {
    if (saving) return;
    if (step === 3 && !postcode.trim()) {
      setPostcodeError("Postcode is required so we can match you to nearby jobs.");
      toast({
        title: "Postcode required",
        description: "Please enter your postcode before continuing.",
        variant: "destructive",
      });
      return;
    }
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

      if ((candidate as any)?.isDemo) {
        toast({ title: "Demo profile saved", description: "Showing preview matches without saving them." });
        setLocation(`/demo-matches/${candidateProfileId}`);
        return;
      }

      let matchingOk = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/run-matching`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) { matchingOk = true; break; }
          console.error("run-matching responded", res.status, await res.text().catch(() => ""));
        } catch (err) {
          console.error("Failed to run AI matching (attempt " + (attempt + 1) + ")", err);
        }
        await new Promise(r => setTimeout(r, 600));
      }

      if (matchingOk) {
        toast({ title: "All set!", description: "Your profile is ready and we've found your matches." });
      } else {
        toast({ title: "Profile saved", description: "We're still preparing your matches — tap Run AI Matching on the next page if needed." });
      }
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

  // Field-level badge — small "AI" pill, plus "Verify" if low confidence
  function FieldBadge({ field }: { field: string }) {
    if (!prefilledFields.has(field)) return null;
    const lowConf = lowConfidenceFields.has(field);
    return (
      <span className="inline-flex items-center gap-1 ml-2 align-middle">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(76,175,80,0.12)", color: "#2e7d32" }}>
          <Sparkles className="w-2.5 h-2.5" /> AI
        </span>
        {lowConf && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
            <AlertCircle className="w-2.5 h-2.5" /> Verify
          </span>
        )}
      </span>
    );
  }

  // Banner shown on steps 3-8 after CV parse
  const showPrefillBanner = prefillCount > 0 && !prefillBannerDismissed && step >= 3 && step <= 8;

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
          {showPrefillBanner && (
            <div className="mb-5 flex items-start gap-3 p-3 rounded-lg border" style={{ backgroundColor: "rgba(76,175,80,0.08)", borderColor: "rgba(76,175,80,0.3)" }}>
              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} />
              <div className="flex-1 text-sm">
                <p className="font-semibold" style={{ color: "#1a2035" }}>
                  We pre-filled {prefillCount} field{prefillCount === 1 ? "" : "s"} from your CV
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Please review them as you go — fields marked <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700"><AlertCircle className="w-2.5 h-2.5" />Verify</span> need a closer look.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrefillBannerDismissed(true)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
              <p className="text-sm text-slate-600 mb-4">Recruiters will see this when they review your profile. PDF or DOCX recommended.</p>

              <div className="mb-5 p-4 rounded-lg border border-slate-200 bg-slate-50">
                <p className="text-sm font-semibold mb-1" style={{ color: "#1a2035" }}>How should we handle your role descriptions?</p>
                <p className="text-xs text-slate-600 mb-3">We'll always pull out your job titles, companies and dates. Choose how to handle the wording under each role.</p>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cvSummaryMode"
                      value="verbatim"
                      checked={cvSummaryMode === "verbatim"}
                      onChange={() => setCvSummaryMode("verbatim")}
                      disabled={parsingCv}
                      className="mt-1 accent-[#4CAF50]"
                    />
                    <span className="text-sm" style={{ color: "#1a2035" }}>
                      <span className="font-semibold">Keep my wording</span>
                      <span className="block text-xs text-slate-600">Copy the descriptions from my CV as written.</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cvSummaryMode"
                      value="ai"
                      checked={cvSummaryMode === "ai"}
                      onChange={() => setCvSummaryMode("ai")}
                      disabled={parsingCv}
                      className="mt-1 accent-[#4CAF50]"
                    />
                    <span className="text-sm" style={{ color: "#1a2035" }}>
                      <span className="font-semibold">Let AI summarise</span>
                      <span className="block text-xs text-slate-600">Generate a concise 1–3 sentence summary for each role.</span>
                    </span>
                  </label>
                </div>
                {!!candidate?.cvFile && (
                  <p className="text-xs text-slate-500 mt-2">You can change this and re-read by clicking <em>Replace</em> above or <em>Read my CV with AI</em> below.</p>
                )}
              </div>

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

              {parsingCv && (
                <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: "rgba(76,175,80,0.08)", borderColor: "rgba(76,175,80,0.3)" }}>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#4CAF50" }} />
                  <div className="text-sm">
                    <p className="font-semibold" style={{ color: "#1a2035" }}>Reading your CV…</p>
                    <p className="text-xs text-slate-600">This usually takes 5–15 seconds. We'll pre-fill the next steps for you.</p>
                  </div>
                </div>
              )}

              {!parsingCv && prefillCount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg border" style={{ backgroundColor: "rgba(76,175,80,0.08)", borderColor: "rgba(76,175,80,0.3)" }}>
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} />
                  <p className="text-sm" style={{ color: "#1a2035" }}>
                    <span className="font-semibold">Done!</span> We pre-filled {prefillCount} field{prefillCount === 1 ? "" : "s"} from your CV. Hit Continue to review them.
                  </p>
                </div>
              )}

              {!parsingCv && cvParseError && (
                <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-900">{cvParseError}</p>
                </div>
              )}

              {candidate?.cvFile && !parsingCv && (
                fromCvFlow && prefillCount === 0 && !cvParseError ? (
                  <div className="mt-3 p-3 rounded-lg border" style={{ backgroundColor: "rgba(76,175,80,0.08)", borderColor: "rgba(76,175,80,0.3)" }}>
                    <p className="text-sm mb-2" style={{ color: "#1a2035" }}>
                      Choose how you'd like your role descriptions handled above, then read your CV to pre-fill the next steps.
                    </p>
                    <Button
                      type="button"
                      onClick={() => candidateProfileId && parseCv(candidateProfileId)}
                      className="font-semibold"
                      style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                    >
                      <Sparkles className="w-4 h-4 mr-1" /> Read my CV with AI
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => candidateProfileId && parseCv(candidateProfileId)}
                    className="text-xs font-semibold inline-flex items-center gap-1 hover:underline mt-2"
                    style={{ color: "#4CAF50" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {prefillCount > 0 ? "Re-read my CV" : "Read my CV with AI to pre-fill the next steps"}
                  </button>
                )
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>The basics</h1>
              <p className="text-sm text-slate-600 mb-5">These help us match you on location and seniority.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Current job title<FieldBadge field="currentTitle" /></label>
                  <Input value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    Postcode <span className="text-red-600" aria-hidden="true">*</span>
                    <FieldBadge field="location" />
                  </label>
                  <PostcodeInput
                    value={{ postcode, country: postcodeCountry }}
                    onChange={(v) => {
                      setPostcode(v.postcode);
                      setPostcodeCountry(v.country);
                      if (postcodeError && v.postcode.trim()) setPostcodeError(null);
                    }}
                    onResolved={(info) => { if (!location) setLocationField(info.town + (info.region && info.region !== info.town ? `, ${info.region}` : "")); }}
                    className={postcodeError ? "ring-1 ring-red-500 rounded-md p-1 -m-1" : undefined}
                  />
                  {postcodeError && (
                    <p className="mt-1 text-xs text-red-600" role="alert">{postcodeError}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Years of experience<FieldBadge field="experienceYears" /></label>
                  <Input type="number" min="0" max="60" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 5" />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-600">Maximum commute radius</label>
                    <span className="text-xs font-mono font-bold" style={{ color: "#4CAF50" }}>{maxRadiusMiles} mi</span>
                  </div>
                  <Slider value={[maxRadiusMiles]} onValueChange={([v]) => setMaxRadiusMiles(v)} min={5} max={100} step={5} />
                  <p className="text-xs text-slate-500 mt-1">Jobs closer to your postcode score higher. Remote jobs always score full marks.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    Mobile Number
                  </label>
                  <Input
                    value={phone}
                    readOnly
                    disabled
                    className="bg-slate-100 text-slate-700 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Provided at sign-up. To update it, go to My Settings.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Professional Summary<FieldBadge field="summary" /></label>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Enter your professional summary here" className="h-24" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>Your skills<FieldBadge field="skills" /></h1>
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

          {step === 6 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>Education</h1>
              <p className="text-sm text-slate-600 mb-5">Your highest qualification helps with role-specific matching.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Education<FieldBadge field="education" /></label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger><SelectValue placeholder="Select education level" /></SelectTrigger>
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
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Details (institution, course, year)<FieldBadge field="educationDetails" /></label>
                  <Textarea value={educationDetails} onChange={(e) => setEducationDetails(e.target.value)} placeholder="e.g. BSc Computer Science, University College London, 2018" className="h-20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Qualifications<FieldBadge field="qualifications" /></label>
                  {qualifications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {qualifications.map((qual, i) => (
                        <span key={`${qual}-${i}`} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">
                          {qual}
                          <button
                            type="button"
                            className="rounded-full hover:bg-slate-300/60 p-0.5"
                            onClick={() => setQualifications(qualifications.filter((_, idx) => idx !== i))}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={qualificationDraft}
                      onChange={(e) => setQualificationDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = qualificationDraft.trim();
                          if (val && !qualifications.includes(val)) {
                            setQualifications([...qualifications, val]);
                          }
                          setQualificationDraft("");
                        }
                      }}
                      placeholder="Type a qualification and press Enter"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const val = qualificationDraft.trim();
                        if (val && !qualifications.includes(val)) {
                          setQualifications([...qualifications, val]);
                        }
                        setQualificationDraft("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">e.g. AAT Level 3, ACCA, PRINCE2, ITIL, AWS Solutions Architect</p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>Work experience<FieldBadge field="experience" /></h1>
              <p className="text-sm text-slate-600 mb-5">Add your previous roles. The more you share, the better we can match you. This step is optional — you can always add more later.</p>

              <div className="space-y-3">
                {experienceList.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                    <BriefcaseIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No roles added yet</p>
                  </div>
                )}

                {experienceList.map((entry, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Role {experienceList.length - index}</span>
                      <button
                        type="button"
                        onClick={() => setExperienceList(experienceList.filter((_, i) => i !== index))}
                        className="text-slate-400 hover:text-red-500 p-1 rounded"
                        aria-label="Remove role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 mb-0.5 block">Job title</label>
                        <Input
                          value={entry.jobTitle}
                          onChange={(e) => {
                            const updated = [...experienceList];
                            updated[index] = { ...updated[index], jobTitle: e.target.value };
                            setExperienceList(updated);
                          }}
                          placeholder="e.g. Senior Developer"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 mb-0.5 block">Company</label>
                        <Input
                          value={entry.company}
                          onChange={(e) => {
                            const updated = [...experienceList];
                            updated[index] = { ...updated[index], company: e.target.value };
                            setExperienceList(updated);
                          }}
                          placeholder="e.g. Acme Corp"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 mb-0.5 block">Start date</label>
                        <Input
                          type="month"
                          value={entry.startDate}
                          onChange={(e) => {
                            const updated = [...experienceList];
                            updated[index] = { ...updated[index], startDate: e.target.value };
                            setExperienceList(updated);
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 mb-0.5 block">End date</label>
                        <Input
                          type="month"
                          value={entry.endDate}
                          onChange={(e) => {
                            const updated = [...experienceList];
                            updated[index] = { ...updated[index], endDate: e.target.value };
                            setExperienceList(updated);
                          }}
                          disabled={entry.current}
                          placeholder={entry.current ? "Present" : ""}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={entry.current}
                        onChange={(e) => {
                          const updated = [...experienceList];
                          updated[index] = { ...updated[index], current: e.target.checked, endDate: e.target.checked ? "" : updated[index].endDate };
                          setExperienceList(updated);
                        }}
                        className="rounded border-slate-300"
                      />
                      I currently work here
                    </label>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-0.5 block">Description (optional)</label>
                      <Textarea
                        value={entry.description}
                        onChange={(e) => {
                          const updated = [...experienceList];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setExperienceList(updated);
                        }}
                        placeholder="Key responsibilities and achievements..."
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setExperienceList([
                    { jobTitle: "", company: "", startDate: "", endDate: "", current: false, description: "" },
                    ...experienceList,
                  ])}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add a role
                </Button>
              </div>
            </div>
          )}

          {step === 8 && (
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
                      const active = preferredWorkplaces.includes(t.value);
                      return (
                        <button key={t.value} onClick={() => toggleArr(preferredWorkplaces, setPreferredWorkplaces, t.value)} className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${active ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-300 hover:border-[#4CAF50]"}`} style={active ? { backgroundColor: "#4CAF50" } : {}}>
                          {t.label}
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
              <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2035" }}>Social media</h1>
              <p className="text-sm text-slate-600 mb-5">Adding links helps companies learn more about you. All optional.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> LinkedIn<FieldBadge field="linkedinUrl" /></label>
                  <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5" /> Facebook<FieldBadge field="facebookUrl" /></label>
                  <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/yourprofile" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5" /> X (Twitter)<FieldBadge field="twitterUrl" /></label>
                  <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/yourhandle" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Portfolio / Website<FieldBadge field="portfolioUrl" /></label>
                  <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yourwebsite.com" />
                </div>
              </div>
            </div>
          )}

          {step === 9 && (
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
                  <Camera className="w-4 h-4 text-amber-500 shrink-0" />
                  Upload a profile picture
                </div>
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
          {step > 1 ? (
            <button onClick={handleBack} disabled={saving || parsingCv} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {step < TOTAL_STEPS && step > 1 && (
              <button onClick={handleSkip} disabled={saving || parsingCv} className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Skip</button>
            )}
            {step === 1 && (
              <button onClick={handleSkip} disabled={saving || parsingCv} className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Skip for now</button>
            )}
            {step < TOTAL_STEPS ? (
              <Button onClick={handleNext} disabled={saving || parsingCv} className="font-semibold" style={{ backgroundColor: "#4CAF50" }}>
                {parsingCv ? "Reading your CV…" : step === 1 ? "Let's get started" : "Continue"} <ArrowRight className="w-4 h-4 ml-1" />
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

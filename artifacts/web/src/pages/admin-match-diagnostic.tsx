import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Microscope, Briefcase, GraduationCap, MapPin, ShieldCheck, Sliders, Sparkles, Target } from "lucide-react";

type Diagnostic = {
  candidate: {
    id: number; name: string; email: string;
    currentTitle: string; experienceYears: number; education: string; location: string; isDemo: boolean;
  };
  job: {
    id: number; title: string; company: string;
    location: string; jobType: string | null; workplace: string | null; industry: string | null;
    experienceLevel: string; educationLevel: string | null;
  };
  explanation: {
    overallScore: number;
    weights: { skills: number; experience: number; preferences: number; verification: number; location: number; education: number };
    elements: {
      skills: { score: number; jobSkills: string[]; candidateSkills: string[]; matched: string[]; missing: string[] };
      experience: { score: number; jobExperienceLevel: string; requiredYears: number; candidateTotalYears: number; candidateRelevantYears: number | null; totalYearsScore: number; relevantYearsScore: number | null };
      education: { score: number; jobEducationLevel: string | null; jobRequirementsExcerpt: string; candidateEducation: string; requiredRank: number | null; candidateRank: number | null };
      location: { score: number; jobLocation: string; candidateLocation: string };
      verification: { score: number; verifiedCount: number };
      preferences: {
        score: number;
        facets: Array<{ label: string; jobValue: string | null; candidatePreferences: string[]; weight: number; outcome: "skipped" | "neutral" | "match" | "mismatch"; contributionScore: number }>;
        matches: string[]; mismatches: string[];
      };
    };
    assessment: string;
  };
};

type CandidateOpt = { id: number; name: string; email: string };
type JobOpt = { id: number; title: string; company: string; status: string };

const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

function scoreColor(score: number) {
  if (score >= 75) return "bg-green-500 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  return "bg-gray-400 text-white";
}

function ElementHeader({ icon: Icon, title, score, weight, rule }: { icon: any; title: string; score: number; weight: number; rule: string }) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Weight: {(weight * 100).toFixed(0)}% &middot; Contributes {(score * weight).toFixed(1)} points to overall</p>
          </div>
        </div>
        <Badge className={`${scoreColor(score)} border-0 font-bold`}>{score}%</Badge>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mt-2">{rule}</p>
    </CardHeader>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-xs py-1 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground text-right">{v}</span>
    </div>
  );
}

export default function AdminMatchDiagnostic() {
  const [candidates, setCandidates] = useState<CandidateOpt[]>([]);
  const [jobs, setJobs] = useState<JobOpt[]>([]);
  const [candidateId, setCandidateId] = useState<string>("");
  const [jobId, setJobId] = useState<string>("");
  const [data, setData] = useState<Diagnostic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${apiBase}/admin/candidates`).then(r => r.json()),
      fetch(`${apiBase}/jobs`).then(r => r.json()),
    ])
      .then(([cands, jobsResp]) => {
        setCandidates((cands || []).map((c: any) => ({ id: c.id, name: c.name || c.email, email: c.email })));
        setJobs((jobsResp || []).map((j: any) => ({ id: j.id, title: j.title, company: j.company, status: j.status })));
      })
      .catch(() => setError("Failed to load lookups."));
  }, []);

  async function runDiagnostic() {
    if (!candidateId || !jobId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/admin/match-diagnostic?candidateId=${candidateId}&jobId=${jobId}`);
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  const e = data?.explanation.elements;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Microscope className="mr-3 text-primary" /> Match diagnostic
        </h1>
        <p className="text-muted-foreground mt-1">
          Pick a candidate and a job. Every element of the matching engine is shown with its inputs, the rule applied, and how it contributes to the overall score.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label className="text-xs">Candidate</Label>
            <Select value={candidateId} onValueChange={setCandidateId}>
              <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
              <SelectContent>
                {candidates.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Job</Label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
              <SelectContent>
                {jobs.map(j => (
                  <SelectItem key={j.id} value={String(j.id)}>{j.title} — {j.company} [{j.status}]</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={runDiagnostic} disabled={!candidateId || !jobId || loading}>
            {loading ? "Computing..." : "Run diagnostic"}
          </Button>
        </CardContent>
      </Card>

      {error && <Card className="border-destructive/40"><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card>}

      {data && e && (
        <>
          <Card>
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-mono font-bold text-2xl text-primary">{data.explanation.overallScore}%</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall match</p>
                  <p className="font-semibold text-foreground">{data.candidate.name} → {data.job.title}</p>
                  <p className="text-xs text-muted-foreground">{data.job.company}</p>
                </div>
              </div>
              <div className="md:ml-auto text-xs text-muted-foreground max-w-md">
                <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                {data.explanation.assessment}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <ElementHeader
                icon={Briefcase} title="Experience" score={e.experience.score} weight={data.explanation.weights.experience}
                rule="Required years are inferred from the job's experience level (junior 1, mid 3, senior 5, lead 8, executive 12). Total years and role-relevant years (from work history matching the job title or required skills) are each scored, then blended 20% total + 80% relevant. Over-qualification penalty only applies for junior roles."
              />
              <CardContent className="text-xs space-y-1">
                <KV k="Job level" v={`${e.experience.jobExperienceLevel} (≈${e.experience.requiredYears} yrs)`} />
                <KV k="Total years" v={`${e.experience.candidateTotalYears} yrs → ${e.experience.totalYearsScore}%`} />
                <KV k="Role-relevant years" v={e.experience.candidateRelevantYears == null ? "n/a (no work history)" : `${e.experience.candidateRelevantYears} yrs → ${e.experience.relevantYearsScore}%`} />
                <KV k="Final" v={`${e.experience.score}%`} />
              </CardContent>
            </Card>

            <Card>
              <ElementHeader
                icon={Target} title="Skills" score={e.skills.score} weight={data.explanation.weights.skills}
                rule="Each required job skill is matched against the candidate's skills using exact match, substring overlap, or 80%+ Levenshtein similarity. Score = matched / required × 100."
              />
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium mb-1">Job requires ({e.skills.jobSkills.length})</p>
                    <div className="flex flex-wrap gap-1">{e.skills.jobSkills.map(s => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Candidate has ({e.skills.candidateSkills.length})</p>
                    <div className="flex flex-wrap gap-1">{e.skills.candidateSkills.map(s => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1 text-green-600">Matched ({e.skills.matched.length})</p>
                  <div className="flex flex-wrap gap-1">{e.skills.matched.map(s => <Badge key={s} className="bg-green-500/10 text-green-700 border-green-500/30" variant="outline">{s}</Badge>)}</div>
                </div>
                <div>
                  <p className="font-medium mb-1 text-destructive">Missing ({e.skills.missing.length})</p>
                  <div className="flex flex-wrap gap-1">{e.skills.missing.map(s => <Badge key={s} className="bg-destructive/10 text-destructive border-destructive/30" variant="outline">{s}</Badge>)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <ElementHeader
                icon={Sliders} title="Preferences" score={e.preferences.score} weight={data.explanation.weights.preferences}
                rule="Three facets — Workplace (×1.2), Job type (×1), Industry (×0.8). Each facet: 100 if the job value is in the candidate's preferences, 25 if mismatched, 85 if the candidate stated no preference, skipped if the job didn't state it. Final = weighted average."
              />
              <CardContent className="text-xs space-y-2">
                {e.preferences.facets.map(f => (
                  <div key={f.label} className="bg-secondary/30 rounded p-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{f.label} <span className="text-muted-foreground">(×{f.weight})</span></span>
                      <Badge variant="outline" className={
                        f.outcome === "match" ? "border-green-500/40 text-green-600" :
                        f.outcome === "mismatch" ? "border-destructive/40 text-destructive" :
                        "border-muted text-muted-foreground"
                      }>{f.outcome} · {f.contributionScore}</Badge>
                    </div>
                    <KV k="Job" v={f.jobValue || "not set"} />
                    <KV k="Candidate prefers" v={f.candidatePreferences.length ? f.candidatePreferences.join(", ") : "no preference"} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <ElementHeader
                icon={ShieldCheck} title="Verification" score={e.verification.score} weight={data.explanation.weights.verification}
                rule="Based on count of verified employment records: 0→0, 1→50, 2→65, 3→80, 4→90, 5+→100."
              />
              <CardContent className="text-xs space-y-1">
                <KV k="Verified employments" v={e.verification.verifiedCount} />
                <KV k="Final" v={`${e.verification.score}%`} />
              </CardContent>
            </Card>

            <Card>
              <ElementHeader
                icon={MapPin} title="Location" score={e.location.score} weight={data.explanation.weights.location}
                rule="100 if equal · 95 if either side is remote · 90 if one contains the other · 75 if a meaningful token overlaps · 40 otherwise."
              />
              <CardContent className="text-xs space-y-1">
                <KV k="Job location" v={e.location.jobLocation || "—"} />
                <KV k="Candidate location" v={e.location.candidateLocation || "—"} />
                <KV k="Final" v={`${e.location.score}%`} />
              </CardContent>
            </Card>

            <Card>
              <ElementHeader
                icon={GraduationCap} title="Education" score={e.education.score} weight={data.explanation.weights.education}
                rule="Education levels are ranked (GCSE 1 → PhD 7). The job's education level (or requirements text) sets the required rank; if the candidate's rank ≥ required → 100. Each rank short = 75 / 55 / lower."
              />
              <CardContent className="text-xs space-y-1">
                <KV k="Job education level" v={e.education.jobEducationLevel || "—"} />
                <KV k="Required rank" v={e.education.requiredRank == null ? "no requirement" : e.education.requiredRank} />
                <KV k="Candidate education" v={e.education.candidateEducation || "—"} />
                <KV k="Candidate rank" v={e.education.candidateRank == null ? "not stated" : e.education.candidateRank} />
                <KV k="Final" v={`${e.education.score}%`} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

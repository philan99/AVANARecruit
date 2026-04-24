import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, MapPin, ShieldCheck, Sliders, Sparkles, Target } from "lucide-react";

type Importance = "high" | "medium" | "low";

export type Diagnostic = {
  candidate: {
    id: number;
    name: string;
    currentTitle: string;
    experienceYears: number;
    education: string;
    location: string;
  };
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    jobType: string | null;
    workplace: string | null;
    industry: string | null;
    experienceLevel: string;
    educationLevel: string | null;
  };
  explanation: {
    overallScore: number;
    assessment: string;
    elements: {
      skills: { score: number; importance: Importance; jobSkills: string[]; candidateSkills: string[]; matched: string[]; missing: string[] };
      experience: { score: number; importance: Importance; jobExperienceLevel: string; requiredYears: number; candidateTotalYears: number; candidateRelevantYears: number | null };
      education: { score: number; importance: Importance; jobEducationLevel: string | null; candidateEducation: string };
      location: { score: number; importance: Importance; jobLocation: string; candidateLocation: string };
      verification: { score: number; importance: Importance; verifiedCount: number };
      preferences: {
        score: number;
        importance: Importance;
        facets: Array<{ label: string; jobValue: string | null; candidatePreferences: string[]; outcome: "skipped" | "neutral" | "match" | "mismatch" }>;
        matches: string[];
        mismatches: string[];
      };
    };
  };
};

function scoreColor(score: number) {
  if (score >= 75) return "bg-green-500 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  return "bg-gray-400 text-white";
}

function importanceStyles(imp: Importance): { label: string; className: string } {
  if (imp === "high") return { label: "High", className: "border-primary/40 text-primary" };
  if (imp === "medium") return { label: "Medium", className: "border-amber-500/40 text-amber-600" };
  return { label: "Low", className: "border-muted-foreground/30 text-muted-foreground" };
}

function ElementHeader({
  icon: Icon,
  title,
  score,
  importance,
  rule,
}: {
  icon: any;
  title: string;
  score: number;
  importance: Importance;
  rule: string;
}) {
  const imp = importanceStyles(importance);
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${imp.className}`}>
                Importance: {imp.label}
              </Badge>
            </div>
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

export function MatchDiagnosticPanel({ data }: { data: Diagnostic }) {
  const e = data.explanation.elements;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="font-mono font-bold text-2xl text-primary">{data.explanation.overallScore}%</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall match</p>
              <p className="font-semibold text-foreground">
                {data.candidate.name} <span className="text-muted-foreground">→</span> {data.job.title}
              </p>
              <p className="text-xs text-muted-foreground">{data.job.company}</p>
            </div>
          </div>
          <div className="md:ml-auto text-xs text-muted-foreground max-w-md">
            <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
            {data.explanation.assessment}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground italic px-1">
        Use this as a discussion aid, not a verdict — the score is one input alongside human judgement.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <ElementHeader
            icon={Target}
            title="Skills"
            score={e.skills.score}
            importance={e.skills.importance}
            rule="Each required skill on the job is checked against the candidate's skills, including close variants."
          />
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-medium mb-1">Job requires ({e.skills.jobSkills.length})</p>
                <div className="flex flex-wrap gap-1">
                  {e.skills.jobSkills.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                </div>
              </div>
              <div>
                <p className="font-medium mb-1">Candidate has ({e.skills.candidateSkills.length})</p>
                <div className="flex flex-wrap gap-1">
                  {e.skills.candidateSkills.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium mb-1 text-green-600">Matched ({e.skills.matched.length})</p>
              <div className="flex flex-wrap gap-1">
                {e.skills.matched.map(s => (
                  <Badge key={s} className="bg-green-500/10 text-green-700 border-green-500/30" variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
            {e.skills.missing.length > 0 && (
              <div>
                <p className="font-medium mb-1 text-destructive">Missing ({e.skills.missing.length})</p>
                <div className="flex flex-wrap gap-1">
                  {e.skills.missing.map(s => (
                    <Badge key={s} className="bg-destructive/10 text-destructive border-destructive/30" variant="outline">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <ElementHeader
            icon={Briefcase}
            title="Experience"
            score={e.experience.score}
            importance={e.experience.importance}
            rule="Compares total years and role-relevant years (from work history matching the job title or required skills) against the level set on the job."
          />
          <CardContent className="text-xs space-y-1">
            <KV k="Job level" v={`${e.experience.jobExperienceLevel} (≈${e.experience.requiredYears} yrs expected)`} />
            <KV k="Candidate total" v={`${e.experience.candidateTotalYears} yrs`} />
            <KV
              k="Role-relevant years"
              v={e.experience.candidateRelevantYears == null ? "n/a (no work history captured)" : `${e.experience.candidateRelevantYears} yrs`}
            />
          </CardContent>
        </Card>

        <Card>
          <ElementHeader
            icon={Sliders}
            title="Preferences"
            score={e.preferences.score}
            importance={e.preferences.importance}
            rule="How well the role's workplace, type and industry line up with what the candidate has said they want."
          />
          <CardContent className="text-xs space-y-2">
            {e.preferences.facets.map(f => (
              <div key={f.label} className="bg-secondary/30 rounded p-2 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{f.label}</span>
                  <Badge
                    variant="outline"
                    className={
                      f.outcome === "match" ? "border-green-500/40 text-green-600" :
                      f.outcome === "mismatch" ? "border-destructive/40 text-destructive" :
                      "border-muted text-muted-foreground"
                    }
                  >
                    {f.outcome}
                  </Badge>
                </div>
                <KV k="Job" v={f.jobValue || "not set"} />
                <KV k="Candidate prefers" v={f.candidatePreferences.length ? f.candidatePreferences.join(", ") : "no preference"} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <ElementHeader
            icon={ShieldCheck}
            title="Verification"
            score={e.verification.score}
            importance={e.verification.importance}
            rule="Reflects how many of the candidate's previous employments have been verified by their former employers."
          />
          <CardContent className="text-xs space-y-1">
            <KV k="Verified employments" v={e.verification.verifiedCount} />
          </CardContent>
        </Card>

        <Card>
          <ElementHeader
            icon={MapPin}
            title="Location"
            score={e.location.score}
            importance={e.location.importance}
            rule="Compares the job's location with the candidate's, with allowances for remote roles and overlapping areas."
          />
          <CardContent className="text-xs space-y-1">
            <KV k="Job location" v={e.location.jobLocation || "—"} />
            <KV k="Candidate location" v={e.location.candidateLocation || "—"} />
          </CardContent>
        </Card>

        <Card>
          <ElementHeader
            icon={GraduationCap}
            title="Education"
            score={e.education.score}
            importance={e.education.importance}
            rule="Checks whether the candidate's highest qualification meets the level set on the job."
          />
          <CardContent className="text-xs space-y-1">
            <KV k="Job education level" v={e.education.jobEducationLevel || "not specified"} />
            <KV k="Candidate education" v={e.education.candidateEducation || "not stated"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

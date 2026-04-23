import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useRole } from "@/contexts/role-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, Target, MapPin, Building, Briefcase, ArrowLeft, Sparkles } from "lucide-react";

type Preview = {
  jobId: number;
  jobTitle: string;
  company: string;
  location: string;
  jobType: string;
  workplace: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  verificationScore: number;
  preferenceScore: number;
  assessment: string;
  matchedSkills: string[];
  missingSkills: string[];
};

type PreviewResponse = {
  candidateId: number;
  isDemo: boolean;
  jobsConsidered: number;
  previews: Preview[];
};

const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

function scoreColor(score: number) {
  if (score >= 75) return "bg-green-500 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  return "bg-gray-400 text-white";
}

export default function DemoMatches() {
  const [, params] = useRoute<{ id: string }>("/demo-matches/:id");
  const [, navigate] = useLocation();
  const { exitImpersonation, isImpersonating } = useRole();

  function handleBack() {
    if (isImpersonating) exitImpersonation();
    navigate("/candidates");
  }
  const candidateId = params?.id ? Number(params.id) : null;
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${apiBase}/candidates/${candidateId}/preview-matches`)
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<PreviewResponse>;
      })
      .then(d => { if (!cancelled) setData(d); })
      .catch(err => { if (!cancelled) setError(String(err.message || err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [candidateId]);

  if (!candidateId) {
    return <div className="p-8 text-center text-muted-foreground">Missing candidate id.</div>;
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Target className="mr-3 text-primary" /> Demo preview matches
          </h1>
          <p className="text-muted-foreground mt-1">
            Scores below are computed live from the demo profile against open jobs.
            Nothing is saved, no companies are notified, and these matches do not appear anywhere else.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to admin candidates
        </Button>
      </div>

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="p-3 flex items-center gap-2 text-sm">
          <FlaskConical className="w-4 h-4 text-amber-500" />
          <span className="text-foreground">Demo mode — preview only.</span>
          {data && (
            <span className="text-muted-foreground ml-auto">
              {data.previews.length} of {data.jobsConsidered} open job{data.jobsConsidered === 1 ? "" : "s"} scored
            </span>
          )}
        </CardContent>
      </Card>

      {loading && <div className="p-8 text-center text-muted-foreground font-mono">Computing preview matches...</div>}
      {error && <div className="p-8 text-center text-destructive">Failed to load: {error}</div>}

      {data && data.previews.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          There are no open jobs to score against right now.
        </CardContent></Card>
      )}

      {data && data.previews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.previews.map(p => (
            <Card key={p.jobId} className="bg-card border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{p.jobTitle}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3 h-3" /> {p.company}
                    </p>
                  </div>
                  <Badge className={`${scoreColor(p.overallScore)} text-sm font-bold border-0 shrink-0`}>
                    {p.overallScore}%
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location || "—"}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {p.jobType}</span>
                  <span>{p.workplace}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <ScoreChip label="Skills" v={p.skillScore} />
                  <ScoreChip label="Experience" v={p.experienceScore} />
                  <ScoreChip label="Education" v={p.educationScore} />
                  <ScoreChip label="Location" v={p.locationScore} />
                  <ScoreChip label="Verification" v={p.verificationScore} />
                  <ScoreChip label="Preferences" v={p.preferenceScore} />
                </div>

                {p.assessment && (
                  <p className="text-xs text-muted-foreground flex gap-1.5">
                    <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                    <span className="line-clamp-3">{p.assessment}</span>
                  </p>
                )}

                {(p.matchedSkills.length > 0 || p.missingSkills.length > 0) && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.matchedSkills.slice(0, 6).map(s => (
                      <Badge key={`m-${s}`} variant="outline" className="text-[10px] border-green-500/40 text-green-600">{s}</Badge>
                    ))}
                    {p.missingSkills.slice(0, 4).map(s => (
                      <Badge key={`x-${s}`} variant="outline" className="text-[10px] border-destructive/40 text-destructive">{s}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreChip({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-center justify-between bg-secondary/40 rounded px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{Math.round(v)}</span>
    </div>
  );
}

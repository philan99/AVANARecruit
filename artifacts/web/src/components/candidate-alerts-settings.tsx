import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useRole } from "@/contexts/role-context";

type AlertJob = {
  id: number;
  title: string;
  location: string;
  status: string;
  createdByUserId: number | null;
  candidateAlertEnabled: boolean;
  candidateAlertMinScore: number;
};

export function CandidateAlertsSettings() {
  const { data: profile } = useCompanyProfile();
  const companyProfileId = profile?.id;
  const { companyUserId } = useRole();
  const { toast } = useToast();
  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<AlertJob[]>([]);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const debounceRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!companyProfileId || !companyUserId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchJobs() {
      try {
        const res = await fetch(
          `${basePath}/company/${companyProfileId}/candidate-alert-jobs`,
          { headers: { "x-company-user-id": String(companyUserId) } },
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setJobs(data.jobs ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch alert jobs", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, [companyProfileId, companyUserId, basePath]);

  // Optimistically apply `nextPatch` to local state, send to API, and revert
  // on failure so the UI never silently disagrees with the server.
  const persist = async (
    jobId: number,
    body: { enabled?: boolean; minScore?: number },
    rollback: Partial<AlertJob>,
  ) => {
    setSavingIds((prev) => new Set(prev).add(jobId));
    try {
      const res = await fetch(`${basePath}/jobs/${jobId}/candidate-alert`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-company-user-id": String(companyUserId),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...rollback } : j)));
      toast({
        title: "Error",
        description: "Failed to save alert settings — your change has been reverted.",
        variant: "destructive",
      });
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const handleToggle = (jobId: number, enabled: boolean) => {
    const prev = jobs.find((j) => j.id === jobId);
    if (!prev) return;
    const previousEnabled = prev.candidateAlertEnabled;
    setJobs((cur) =>
      cur.map((j) => (j.id === jobId ? { ...j, candidateAlertEnabled: enabled } : j)),
    );
    persist(jobId, { enabled }, { candidateAlertEnabled: previousEnabled });
  };

  const handleScore = (jobId: number, minScore: number) => {
    const prev = jobs.find((j) => j.id === jobId);
    if (!prev) return;
    const previousScore = prev.candidateAlertMinScore;
    setJobs((cur) =>
      cur.map((j) => (j.id === jobId ? { ...j, candidateAlertMinScore: minScore } : j)),
    );
    // Debounce while the user drags the slider.
    const existing = debounceRef.current.get(jobId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      debounceRef.current.delete(jobId);
      persist(jobId, { minScore }, { candidateAlertMinScore: previousScore });
    }, 400);
    debounceRef.current.set(jobId, timer);
  };

  if (loading) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="p-8 text-center space-y-2">
          <BellOff className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">No jobs to configure yet</p>
          <p className="text-xs text-muted-foreground">
            Once you post a role you'll be able to switch on candidate alerts for it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeJobs = jobs.filter((j) => j.status !== "closed");
  const closedJobs = jobs.filter((j) => j.status === "closed");

  return (
    <div className="space-y-3">
      {activeJobs.map((job) => (
        <JobAlertRow
          key={job.id}
          job={job}
          saving={savingIds.has(job.id)}
          onToggle={(v) => handleToggle(job.id, v)}
          onScore={(v) => handleScore(job.id, v)}
        />
      ))}

      {closedJobs.length > 0 && (
        <div className="pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Closed roles
          </p>
          <div className="space-y-3 opacity-60">
            {closedJobs.map((job) => (
              <JobAlertRow
                key={job.id}
                job={job}
                saving={savingIds.has(job.id)}
                onToggle={(v) => handleToggle(job.id, v)}
                onScore={(v) => handleScore(job.id, v)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobAlertRow({
  job,
  saving,
  onToggle,
  onScore,
}: {
  job: AlertJob;
  saving: boolean;
  onToggle: (v: boolean) => void;
  onScore: (v: number) => void;
}) {
  return (
    <Card className="bg-card">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {job.candidateAlertEnabled ? (
                <Bell className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <h3 className="font-semibold text-sm truncate" style={{ color: "#1a2035" }}>
                {job.title}
              </h3>
            </div>
            {job.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{job.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            <Label
              htmlFor={`alert-${job.id}`}
              className="text-xs text-muted-foreground select-none"
            >
              {job.candidateAlertEnabled ? "On" : "Off"}
            </Label>
            <Switch
              id={`alert-${job.id}`}
              checked={job.candidateAlertEnabled}
              onCheckedChange={onToggle}
            />
          </div>
        </div>

        {job.candidateAlertEnabled && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Minimum Match Score
              </Label>
              <span className="text-sm font-mono font-bold text-primary">
                {Math.round(job.candidateAlertMinScore)}%
              </span>
            </div>
            <Slider
              value={[job.candidateAlertMinScore]}
              onValueChange={([v]) => onScore(v)}
              min={25}
              max={100}
              step={5}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

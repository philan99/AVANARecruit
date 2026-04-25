import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Plus, X, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/role-context";
import { TownInput } from "@/components/town-input";

export function JobAlertsSettings() {
  const { candidateProfileId } = useRole();
  const { toast } = useToast();
  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [minScore, setMinScore] = useState(50);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [centerCountry, setCenterCountry] = useState<string>("United Kingdom");
  const [centerTown, setCenterTown] = useState<string>("");
  const [centerLat, setCenterLat] = useState<number | null>(null);
  const [centerLng, setCenterLng] = useState<number | null>(null);
  const [radiusMiles, setRadiusMiles] = useState<number>(25);

  useEffect(() => {
    if (!candidateProfileId) return;
    async function fetchAlerts() {
      try {
        const res = await fetch(`${basePath}/candidates/${candidateProfileId}/job-alerts`);
        if (res.ok) {
          const data = await res.json();
          setEnabled(data.enabled ?? false);
          setMinScore(data.minScore ?? 50);
          setKeywords(data.keywords ?? []);
          setCenterTown(data.centerTown ?? "");
          setCenterLat(data.centerLat ?? null);
          setCenterLng(data.centerLng ?? null);
          setRadiusMiles(data.radiusMiles ?? 25);
        }
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [candidateProfileId, basePath]);

  const handleSave = async () => {
    if (!candidateProfileId) return;
    setSaving(true);
    try {
      const res = await fetch(`${basePath}/candidates/${candidateProfileId}/job-alerts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          minScore,
          keywords,
          centerTown: centerTown.trim() === "" ? null : centerTown,
          centerLat,
          centerLng,
          radiusMiles,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Job Alerts Updated", description: enabled ? "You'll be notified when matching jobs are posted." : "Job alerts have been turned off." });
    } catch {
      toast({ title: "Error", description: "Failed to save alert settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setNewKeyword("");
    }
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

  return (
    <Card className="bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {enabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
            Job Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="alerts-toggle" className="text-sm text-muted-foreground">
              {enabled ? "Active" : "Off"}
            </Label>
            <Switch
              id="alerts-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {enabled && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Minimum Match Score</Label>
                <span className="text-sm font-mono font-bold text-primary">{minScore}%</span>
              </div>
              <Slider
                value={[minScore]}
                onValueChange={([val]) => setMinScore(val)}
                min={25}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only receive alerts for jobs that match your profile at or above this score.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Keywords (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. React, Data Science..."
                  className="text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                />
                <Button size="sm" variant="outline" onClick={addKeyword} disabled={!newKeyword.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs gap-1 pr-1">
                      {kw}
                      <button onClick={() => setKeywords(keywords.filter((k) => k !== kw))} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Only alert for jobs containing these keywords in the title, description, or skills.
                Leave empty to match all jobs.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Search area (optional)</Label>
              <TownInput
                value={{ town: centerTown, country: centerCountry, lat: centerLat, lng: centerLng }}
                onChange={(v) => {
                  setCenterTown(v.town);
                  setCenterCountry(v.country);
                  setCenterLat(v.lat ?? null);
                  setCenterLng(v.lng ?? null);
                }}
              />
              {(() => {
                const radiusDisabled = centerTown.trim() === "" || centerLat == null || centerLng == null;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <Label className={`text-sm font-medium ${radiusDisabled ? "text-muted-foreground" : ""}`}>Radius</Label>
                      <span className={`text-sm font-mono font-bold ${radiusDisabled ? "text-muted-foreground" : "text-primary"}`}>
                        {radiusDisabled ? "All of UK" : `${radiusMiles} mi`}
                      </span>
                    </div>
                    <Slider
                      value={[radiusMiles]}
                      onValueChange={([val]) => setRadiusMiles(val)}
                      min={5}
                      max={100}
                      step={5}
                      disabled={radiusDisabled}
                      className={`w-full ${radiusDisabled ? "opacity-50 pointer-events-none" : ""}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {radiusDisabled
                        ? "No town set, so you'll receive alerts for matching jobs anywhere in the UK (remote jobs always included)."
                        : "Only alert for jobs within this distance of the town (remote jobs always included). Leave the town blank to receive alerts from anywhere in the UK."}
                    </p>
                  </>
                );
              })()}
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Check className="w-4 h-4 mr-2" /> Save Alert Settings</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

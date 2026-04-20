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
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useRole } from "@/contexts/role-context";

export function CandidateAlertsSettings() {
  const { data: profile } = useCompanyProfile();
  const companyProfileId = profile?.id;
  const { companyUserId } = useRole();
  const { toast } = useToast();
  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [minScore, setMinScore] = useState(50);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    if (!companyProfileId || !companyUserId) {
      setLoading(false);
      return;
    }
    async function fetchAlerts() {
      try {
        const res = await fetch(
          `${basePath}/company/${companyProfileId}/candidate-alerts`,
          { headers: { "x-company-user-id": String(companyUserId) } },
        );
        if (res.ok) {
          const data = await res.json();
          setEnabled(data.enabled ?? false);
          setMinScore(data.minScore ?? 50);
          setKeywords(data.keywords ?? []);
          setLocations(data.locations ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch candidate alerts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [companyProfileId, companyUserId, basePath]);

  const handleSave = async () => {
    if (!companyProfileId || !companyUserId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${basePath}/company/${companyProfileId}/candidate-alerts`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-company-user-id": String(companyUserId),
          },
          body: JSON.stringify({ enabled, minScore, keywords, locations }),
        },
      );
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Candidate Alerts Updated", description: enabled ? "You'll be notified when matching candidates register." : "Candidate alerts have been turned off." });
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

  const addLocation = () => {
    const loc = newLocation.trim();
    if (loc && !locations.includes(loc)) {
      setLocations([...locations, loc]);
      setNewLocation("");
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
          <CardTitle className="text-base flex items-center gap-2">
            {enabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
            Candidate Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="candidate-alerts-toggle" className="text-sm text-muted-foreground">
              {enabled ? "Active" : "Off"}
            </Label>
            <Switch
              id="candidate-alerts-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">
          Get notified when new candidates register who match your open roles.
        </p>
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
                Only receive alerts for candidates who match your jobs at or above this score.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Skills / Keywords (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. React, Python..."
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
                Only alert for candidates with these skills or keywords in their profile.
                Leave empty to match all candidates.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Candidate Locations (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. London, Manchester..."
                  className="text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLocation(); } }}
                />
                <Button size="sm" variant="outline" onClick={addLocation} disabled={!newLocation.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {locations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {locations.map((loc) => (
                    <Badge key={loc} variant="secondary" className="text-xs gap-1 pr-1">
                      {loc}
                      <button onClick={() => setLocations(locations.filter((l) => l !== loc))} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Only alert for candidates based in these locations.
                Leave empty to match all locations.
              </p>
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

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/role-context";
import { Loader2, Lock, User } from "lucide-react";
import { validatePassword } from "@/lib/password-policy";
import { PasswordStrength } from "@/components/password-strength";

interface InviteInfo {
  email: string;
  role: string;
  invitedByName: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
}

export default function AcceptInvite() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setRole, setCompanyProfileId, setCompanyUserId, setCompanyUserRole, setUserEmail, clearRole, setSessionToken } = useRole();

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const [token, setToken] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
    if (!t) {
      setLoadError("Missing invitation token");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${apiBase}/team-invites/${t}`);
        const data = await res.json();
        if (!res.ok) {
          setLoadError(data.error || "Invitation could not be loaded");
        } else {
          setInvite(data);
        }
      } catch {
        setLoadError("Could not reach the server");
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    {
      const { ok, failed } = validatePassword(password);
      if (!ok) {
        toast({ title: "Password doesn't meet requirements", description: failed[0].label, variant: "destructive" });
        return;
      }
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/team-invites/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to accept invitation", variant: "destructive" });
        return;
      }
      clearRole();
      setUserEmail(data.email);
      setCompanyProfileId(data.companyId);
      setCompanyUserId(data.companyUserId);
      setCompanyUserRole(data.companyUserRole);
      if (data.sessionToken) setSessionToken(data.sessionToken);
      setRole("company");
      toast({ title: `Welcome to ${data.companyName ?? "the team"}!` });
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
      window.location.assign(`${baseUrl}/`);
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 space-y-4 text-center">
            <h1 className="text-xl font-semibold">Invitation unavailable</h1>
            <p className="text-sm text-muted-foreground">{loadError ?? "This invitation could not be found."}</p>
            <Button onClick={() => setLocation("/")}>Go to AVANA Recruit</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-2">
            {invite.companyLogoUrl && (
              <img src={invite.companyLogoUrl} alt={invite.companyName ?? ""} className="h-12 mx-auto" />
            )}
            <h1 className="text-2xl font-semibold">Join {invite.companyName ?? "the team"}</h1>
            <p className="text-sm text-muted-foreground">
              {invite.invitedByName ? `${invite.invitedByName} invited you` : "You've been invited"} to join as a{" "}
              <span className="font-medium capitalize">{invite.role}</span>.
            </p>
            <p className="text-xs text-muted-foreground">
              Setting up account for <span className="font-mono">{invite.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Your name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoFocus
                required
                data-testid="input-invite-name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Create password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                minLength={8}
                data-testid="input-invite-password"
              />
              <PasswordStrength password={password} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Confirm password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                data-testid="input-invite-confirm-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting} data-testid="button-accept-invite">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

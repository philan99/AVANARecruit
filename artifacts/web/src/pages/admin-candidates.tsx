import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, MapPin, Clock, GraduationCap, KeyRound } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  currentTitle: string;
  summary: string;
  skills: string[];
  experienceYears: number;
  education: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<Candidate | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${basePath}/admin/candidates`);
        if (res.ok) setCandidates(await res.json());
      } catch (err) {
        console.error("Failed to fetch candidates", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [basePath]);

  async function handleResetPassword() {
    if (!resetTarget) return;
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`${basePath}/admin/candidates/${resetTarget.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        toast({ title: "Password Reset", description: `Password has been reset for ${resetTarget.name}.` });
        setResetTarget(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to reset password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to reset password.", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading candidates...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Users className="mr-3 text-primary" /> Candidates
        </h1>
        <p className="text-muted-foreground mt-1">{candidates.length} candidate profiles on the platform.</p>
      </div>

      <Card className="bg-card">
        <CardContent className="pt-6">
          {candidates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Candidate</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Exp</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Skills</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Created</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={(e) => { if ((e.target as HTMLElement).closest("button")) return; navigate(`/candidates/${candidate.id}`); }}>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px] shrink-0">
                            {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-foreground truncate">{candidate.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{candidate.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{candidate.currentTitle}</td>
                      <td className="py-2 px-2 text-muted-foreground">{candidate.location}</td>
                      <td className="py-2 px-2 text-muted-foreground">{candidate.experienceYears}y</td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[8px] px-1 py-0">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 2 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0">
                              +{candidate.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant={candidate.status === "active" ? "default" : "secondary"} className="text-[8px] uppercase">
                          {candidate.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] gap-1 h-7 px-2"
                          onClick={() => {
                            setResetTarget(candidate);
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                        >
                          <KeyRound className="w-3 h-3" />
                          Reset
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No candidates registered yet.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) setResetTarget(null); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-medium text-foreground">{resetTarget?.name}</span> ({resetTarget?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={resetting || !newPassword || !confirmPassword}>
              {resetting ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

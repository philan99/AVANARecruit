import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/role-context";
import { Loader2, MoreHorizontal, UserPlus, Mail, RefreshCw, X, Crown, ShieldCheck, User } from "lucide-react";

interface TeamUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  verified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface TeamInvite {
  id: number;
  email: string;
  role: string;
  invitedByName: string | null;
  expiresAt: string;
  createdAt: string;
  lastSentAt: string;
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

function RoleBadge({ role }: { role: string }) {
  const Icon = role === "owner" ? Crown : role === "admin" ? ShieldCheck : User;
  const cls =
    role === "owner"
      ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
      : role === "admin"
      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
      : "bg-slate-100 text-slate-700 hover:bg-slate-100";
  return (
    <Badge className={`${cls} gap-1 font-medium`}>
      <Icon className="w-3 h-3" />
      {ROLE_LABEL[role] ?? role}
    </Badge>
  );
}

export default function TeamMembers() {
  const { toast } = useToast();
  const { companyProfileId, companyUserId, companyUserRole } = useRole();
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);

  const [removeUser, setRemoveUser] = useState<TeamUser | null>(null);
  const [cancelInviteTarget, setCancelInviteTarget] = useState<TeamInvite | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const canManage = companyUserRole === "owner" || companyUserRole === "admin";
  const isOwner = companyUserRole === "owner";

  const authHeaders = useCallback(
    (extra?: Record<string, string>) => ({
      "Content-Type": "application/json",
      ...(companyUserId ? { "x-company-user-id": String(companyUserId) } : {}),
      ...extra,
    }),
    [companyUserId],
  );

  const load = useCallback(async () => {
    if (!companyProfileId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/companies/${companyProfileId}/team`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to load team", variant: "destructive" });
        return;
      }
      setUsers(data.users);
      setInvites(data.invites);
    } catch {
      toast({ title: "Could not load team", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [apiBase, companyProfileId, authHeaders, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`${apiBase}/companies/${companyProfileId}/invites`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to send invite", variant: "destructive" });
        return;
      }
      toast({ title: `Invitation sent to ${inviteEmail.trim()}` });
      setInviteEmail("");
      setInviteRole("member");
      setInviteOpen(false);
      load();
    } catch {
      toast({ title: "Could not send invite", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const changeRole = async (user: TeamUser, newRole: string) => {
    setBusyId(`u${user.id}`);
    try {
      const res = await fetch(`${apiBase}/companies/${companyProfileId}/users/${user.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to update role", variant: "destructive" });
        return;
      }
      toast({ title: `${user.name ?? user.email} is now ${ROLE_LABEL[newRole]}` });
      load();
    } finally {
      setBusyId(null);
    }
  };

  const confirmRemove = async () => {
    if (!removeUser) return;
    setBusyId(`u${removeUser.id}`);
    try {
      const res = await fetch(`${apiBase}/companies/${companyProfileId}/users/${removeUser.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: data.error || "Failed to remove user", variant: "destructive" });
        return;
      }
      toast({ title: "User removed" });
      setRemoveUser(null);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const resendInvite = async (invite: TeamInvite) => {
    setBusyId(`i${invite.id}`);
    try {
      const res = await fetch(
        `${apiBase}/companies/${companyProfileId}/invites/${invite.id}/resend`,
        { method: "POST", headers: authHeaders() },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: data.error || "Failed to resend invite", variant: "destructive" });
        return;
      }
      toast({ title: `Invitation re-sent to ${invite.email}` });
      load();
    } finally {
      setBusyId(null);
    }
  };

  const cancelInvite = async (invite: TeamInvite) => {
    setBusyId(`i${invite.id}`);
    try {
      const res = await fetch(
        `${apiBase}/companies/${companyProfileId}/invites/${invite.id}`,
        { method: "DELETE", headers: authHeaders() },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: data.error || "Failed to cancel invite", variant: "destructive" });
        return;
      }
      toast({
        title: "Invitation cancelled",
        description: "The link in the original email will no longer work.",
      });
      setCancelInviteTarget(null);
      load();
    } finally {
      setBusyId(null);
    }
  };

  if (!companyProfileId) {
    return <div className="p-6 text-sm text-muted-foreground">Sign in as a company to manage your team.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage who can sign in and post jobs on behalf of your company.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setInviteOpen(true)} data-testid="button-invite-member">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite member
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></CardContent>
        </Card>
      ) : (
        (["owner", "admin", "member"] as const).map((roleKey) => {
          const group = users.filter((u) => u.role === roleKey);
          return (
            <Card key={roleKey}>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[#1a2035] border-b-2 border-[#4CAF50] pb-2">
                  {ROLE_LABEL[roleKey]}s ({group.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {group.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground text-center">No {ROLE_LABEL[roleKey].toLowerCase()}s.</div>
                ) : (
                  <div className="divide-y">
                    {group.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{u.name ?? u.email}</span>
                            {u.id === companyUserId && (
                              <Badge variant="outline" className="text-[10px]">You</Badge>
                            )}
                            {!u.verified && (
                              <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                                Unverified
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                        <RoleBadge role={u.role} />
                        {canManage && u.id !== companyUserId && u.role !== "owner" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={busyId === `u${u.id}`} data-testid={`button-user-actions-${u.id}`}>
                                {busyId === `u${u.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isOwner && u.role !== "admin" && (
                                <DropdownMenuItem onClick={() => changeRole(u, "admin")}>Make admin</DropdownMenuItem>
                              )}
                              {isOwner && u.role !== "member" && u.role !== "owner" && (
                                <DropdownMenuItem onClick={() => changeRole(u, "member")}>Make member</DropdownMenuItem>
                              )}
                              {u.role !== "owner" && (
                                <>
                                  {isOwner && <DropdownMenuSeparator />}
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setRemoveUser(u)}
                                  >
                                    Remove from team
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending invites ({invites.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invites.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">No pending invitations.</div>
          ) : (
            <div className="divide-y">
              {invites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{inv.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Invited by {inv.invitedByName ?? "—"} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <RoleBadge role={inv.role} />
                  {canManage && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resendInvite(inv)}
                        disabled={busyId === `i${inv.id}`}
                        data-testid={`button-resend-invite-${inv.id}`}
                      >
                        {busyId === `i${inv.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Cancel invite (invalidates the link in the email)"
                        onClick={() => setCancelInviteTarget(inv)}
                        disabled={busyId === `i${inv.id}`}
                        data-testid={`button-cancel-invite-${inv.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>
              They'll get an email with a link to set up their own password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email address</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                data-testid="input-invite-email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member")}>
                <SelectTrigger data-testid="select-invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member — can post and manage jobs</SelectItem>
                  <SelectItem value="admin">Admin — can also manage team members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting} data-testid="button-send-invite">
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelInviteTarget !== null} onOpenChange={(o) => !o && setCancelInviteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              The invitation email to <strong>{cancelInviteTarget?.email}</strong> has already been sent and can't be recalled, but cancelling will invalidate the link inside it — if they click it, they'll see a "This invite has been cancelled" message and won't be able to join.
              <br /><br />
              You can always send a fresh invitation later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (cancelInviteTarget) cancelInvite(cancelInviteTarget);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={removeUser !== null} onOpenChange={(o) => !o && setRemoveUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeUser?.name ?? removeUser?.email} will lose access to your company immediately.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmRemove();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

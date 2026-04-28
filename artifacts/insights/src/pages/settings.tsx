import { useEffect, useState } from "react";
import { User, Building2, Users, Mail, Shield, type LucideIcon } from "lucide-react";
import { useWorkspace } from "@/components/insights-layout";
import { useRole } from "@/contexts/role-context";

type Tab = "profile" | "workspace" | "members";

interface MemberRow {
  id: number;
  workspaceId: number;
  memberEmail: string;
  role: string;
  invitedAt: string;
  acceptedAt: string | null;
}

export default function Settings() {
  const { workspace, role: workspaceRole } = useWorkspace();
  const { userEmail, sessionToken } = useRole();
  const [tab, setTab] = useState<Tab>("profile");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const apiBase = "/api";

  useEffect(() => {
    if (tab !== "members" || !workspace || !sessionToken) return;
    let cancelled = false;
    async function load() {
      if (!workspace || !sessionToken) return;
      setMembersLoading(true);
      setMembersError(null);
      try {
        const res = await fetch(`${apiBase}/insights/workspace/${workspace.id}/members`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (cancelled) return;
        if (!res.ok) {
          setMembersError("Failed to load members");
          setMembersLoading(false);
          return;
        }
        const data = await res.json();
        setMembers(data.members || []);
      } catch {
        if (!cancelled) setMembersError("Network error");
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tab, workspace, sessionToken, apiBase]);

  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "workspace", label: "Workspace", icon: Building2 },
    { id: "members", label: "Members", icon: Users },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }} data-testid="settings-title">Settings</h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Manage your profile, workspace, and team.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6" style={{ borderColor: "hsl(var(--border))" }}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
              style={{
                borderColor: active ? "hsl(var(--primary))" : "transparent",
                color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              }}
              data-testid={`tab-${id}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Profile */}
      {tab === "profile" && (
        <div className="rounded-xl border bg-card p-6 max-w-2xl" style={{ borderColor: "hsl(var(--card-border))" }} data-testid="panel-profile">
          <h2 className="text-base font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>Your Profile</h2>
          <div className="space-y-4">
            <Field label="Email" value={userEmail || "—"} icon={Mail} />
            <Field label="Role in Workspace" value={workspaceRole === "owner" ? "Owner" : "Member"} icon={Shield} />
            <p className="text-xs pt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              Profile editing will be available in a later phase. Sign-in is shared with your AVANA account.
            </p>
          </div>
        </div>
      )}

      {/* Workspace */}
      {tab === "workspace" && (
        <div className="rounded-xl border bg-card p-6 max-w-2xl" style={{ borderColor: "hsl(var(--card-border))" }} data-testid="panel-workspace">
          <h2 className="text-base font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>Workspace Settings</h2>
          <div className="space-y-4">
            <Field label="Workspace Name" value={workspace?.name || "—"} icon={Building2} />
            <Field label="Owner" value={workspace?.ownerEmail || "—"} icon={Mail} />
            <Field label="Billing Tier" value={(workspace?.billingTier || "free").toUpperCase()} icon={Shield} />
            <Field label="Workspace ID" value={workspace ? `#${workspace.id}` : "—"} icon={Building2} />
            <p className="text-xs pt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              Renaming, plan changes, and ownership transfer will arrive in a later phase.
            </p>
          </div>
        </div>
      )}

      {/* Members */}
      {tab === "members" && (
        <div className="rounded-xl border bg-card p-6" style={{ borderColor: "hsl(var(--card-border))" }} data-testid="panel-members">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>Team Members</h2>
            <button
              disabled
              className="px-4 py-2 rounded-md text-sm font-semibold opacity-50 cursor-not-allowed border"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
              title="Invitations available in a later phase"
            >
              Invite (coming soon)
            </button>
          </div>
          {membersLoading && <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Loading…</p>}
          {membersError && <p className="text-sm" style={{ color: "hsl(var(--destructive))" }}>{membersError}</p>}
          {!membersLoading && !membersError && (
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: "hsl(var(--muted))" }}>
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>Email</th>
                    <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>Role</th>
                    <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-6 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No members yet.</td></tr>
                  )}
                  {members.map((m) => (
                    <tr key={m.id} className="border-t" style={{ borderColor: "hsl(var(--border))" }}>
                      <td className="px-4 py-3" style={{ color: "hsl(var(--foreground))" }}>{m.memberEmail}</td>
                      <td className="px-4 py-3 capitalize" style={{ color: "hsl(var(--foreground))" }}>{m.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: m.acceptedAt ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
                            color: m.acceptedAt ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                          }}
                        >
                          {m.acceptedAt ? "Active" : "Invited"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(var(--muted))" }}>
        <Icon className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
        <p className="text-sm font-medium break-all" style={{ color: "hsl(var(--foreground))" }}>{value}</p>
      </div>
    </div>
  );
}

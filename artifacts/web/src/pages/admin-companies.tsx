import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { formatIndustry } from "@/lib/industries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Building2, Search, X, KeyRound, LogIn } from "lucide-react";
import { useRole } from "@/contexts/role-context";

interface CompanyTeamUser {
  id: number;
  companyProfileId: number;
  name: string | null;
  email: string;
  role: string;
  verified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface CompanyProfile {
  id: number;
  name: string;
  email: string | null;
  industry: string | null;
  website: string | null;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  size: string | null;
  founded: string | null;
  createdAt: string;
  updatedAt: string;
  users: CompanyTeamUser[];
}

interface Row {
  company: CompanyProfile;
  user: CompanyTeamUser | null;
  isFirstForCompany: boolean;
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  owner: { label: "Owner", cls: "bg-primary/15 text-primary border-primary/30" },
  admin: { label: "Admin", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40" },
  member: { label: "Member", cls: "bg-secondary text-foreground border-border" },
};

function roleBadge(role: string) {
  const meta = ROLE_BADGE[role] ?? { label: role, cls: "bg-secondary text-foreground border-border" };
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${meta.cls}`}>
      {meta.label}
    </Badge>
  );
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<{ company: CompanyProfile; user: CompanyTeamUser } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { impersonateCompanyUser } = useRole();

  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);

  const [companyQuery, setCompanyQuery] = useState(urlParams.get("company") || "");
  const [industryFilter, setIndustryFilter] = useState(urlParams.get("industry") || "all");
  const [locationFilter, setLocationFilter] = useState(urlParams.get("location") || "all");
  const [sizeFilter, setSizeFilter] = useState(urlParams.get("size") || "all");
  const [roleFilter, setRoleFilter] = useState(urlParams.get("role") || "all");

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${basePath}/admin/companies`);
        if (res.ok) setCompanies(await res.json());
      } catch (err) {
        console.error("Failed to fetch companies", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [basePath]);

  const uniqueIndustries = useMemo(() => {
    const vals = new Set(companies.map(c => c.industry).filter(Boolean) as string[]);
    return Array.from(vals).sort();
  }, [companies]);

  const uniqueLocations = useMemo(() => {
    const vals = new Set(companies.map(c => c.location).filter(Boolean) as string[]);
    return Array.from(vals).sort();
  }, [companies]);

  const uniqueSizes = useMemo(() => {
    const vals = new Set(companies.map(c => c.size).filter(Boolean) as string[]);
    return Array.from(vals).sort();
  }, [companies]);

  const filteredRows: Row[] = useMemo(() => {
    const rows: Row[] = [];
    const q = companyQuery.trim().toLowerCase();
    const sortedCompanies = [...companies].sort((a, b) => a.name.localeCompare(b.name));
    for (const company of sortedCompanies) {
      if (q && !company.name.toLowerCase().includes(q)) continue;
      if (industryFilter !== "all" && company.industry !== industryFilter) continue;
      if (locationFilter !== "all" && company.location !== locationFilter) continue;
      if (sizeFilter !== "all" && company.size !== sizeFilter) continue;

      const usersForCompany = company.users.filter(u => {
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        return true;
      });

      // If a company has no users (or all are filtered out by role), show one synthetic empty row when no role filter is active.
      const baseUsers: (CompanyTeamUser | null)[] =
        usersForCompany.length > 0 ? usersForCompany : (roleFilter === "all" ? [null] : []);

      baseUsers.forEach((u, idx) => {
        rows.push({ company, user: u, isFirstForCompany: idx === 0 });
      });
    }
    return rows;
  }, [companies, companyQuery, industryFilter, locationFilter, sizeFilter, roleFilter]);

  const totalCompaniesShown = useMemo(
    () => new Set(filteredRows.map(r => r.company.id)).size,
    [filteredRows],
  );

  const hasActiveFilters =
    !!companyQuery ||
    industryFilter !== "all" ||
    locationFilter !== "all" ||
    sizeFilter !== "all" ||
    roleFilter !== "all";

  function clearFilters() {
    setCompanyQuery("");
    setIndustryFilter("all");
    setLocationFilter("all");
    setSizeFilter("all");
    setRoleFilter("all");
  }

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
      const res = await fetch(`${basePath}/admin/company-users/${resetTarget.user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        toast({
          title: "Password Reset",
          description: `Password has been reset for ${resetTarget.user.name ?? resetTarget.user.email}.`,
        });
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
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading companies...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Building2 className="mr-3 text-primary" /> Companies
        </h1>
        <p className="text-muted-foreground mt-1">
          {companies.length} companies registered, {filteredRows.length} team members shown.
        </p>
      </div>

      <Card className="bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Company</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by company name..."
                  value={companyQuery}
                  onChange={(e) => setCompanyQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                  data-testid="input-company-search"
                />
              </div>
            </div>

            <div className="w-[140px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Industry</Label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map(ind => (
                    <SelectItem key={ind} value={ind}>{formatIndustry(ind)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[140px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Size</Label>
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {uniqueSizes.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-9 text-xs gap-1 text-muted-foreground" onClick={clearFilters}>
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <p className="text-[11px] text-muted-foreground mt-3">
              Showing {filteredRows.length} team members across {totalCompaniesShown} companies
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="pt-6">
          {filteredRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Team Member</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Industry</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Last login</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => {
                    const c = row.company;
                    const u = row.user;
                    const showCompanyMeta = row.isFirstForCompany;
                    return (
                      <tr
                        key={`${c.id}-${u?.id ?? "empty"}-${idx}`}
                        className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${showCompanyMeta ? "" : "bg-secondary/10"}`}
                        data-testid={`row-company-user-${c.id}-${u?.id ?? "empty"}`}
                      >
                        <td className="py-2 px-2 align-top">
                          <button
                            type="button"
                            onClick={() => navigate(`/companies/${c.id}`)}
                            className="flex items-center gap-2 text-left"
                          >
                            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px] shrink-0">
                              {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs text-primary hover:underline truncate">{c.name}</p>
                              {showCompanyMeta && (
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {c.users.length === 0
                                    ? "No team members"
                                    : `${c.users.length} member${c.users.length === 1 ? "" : "s"}`}
                                </p>
                              )}
                            </div>
                          </button>
                        </td>
                        <td className="py-2 px-2 align-top">
                          {u ? (
                            <div className="min-w-0">
                              <p className="font-medium text-xs text-foreground truncate">{u.name ?? u.email}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                              {!u.verified && (
                                <span className="text-[9px] text-amber-600 dark:text-amber-400">Unverified</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">No team members</span>
                          )}
                        </td>
                        <td className="py-2 px-2 align-top">{u ? roleBadge(u.role) : "—"}</td>
                        <td className="py-2 px-2 text-muted-foreground align-top">{formatIndustry(c.industry) || "—"}</td>
                        <td className="py-2 px-2 text-muted-foreground align-top">{c.location || "—"}</td>
                        <td className="py-2 px-2 text-muted-foreground align-top">
                          {u?.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-2 px-2 align-top">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] gap-1 h-7 px-2"
                              disabled={!u}
                              data-testid={u ? `button-login-as-${u.id}` : undefined}
                              onClick={() => {
                                if (!u) return;
                                impersonateCompanyUser(c.id, u.id, u.role, u.email);
                                navigate("/");
                              }}
                            >
                              <LogIn className="w-3 h-3" />
                              Login
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] gap-1 h-7 px-2"
                              disabled={!u}
                              data-testid={u ? `button-reset-password-${u.id}` : undefined}
                              onClick={() => {
                                if (!u) return;
                                setResetTarget({ company: c, user: u });
                                setNewPassword("");
                                setConfirmPassword("");
                              }}
                            >
                              <KeyRound className="w-3 h-3" />
                              Reset
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {hasActiveFilters ? "No team members match your filters." : "No companies registered yet."}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) setResetTarget(null); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-medium text-foreground">
                {resetTarget?.user.name ?? resetTarget?.user.email}
              </span>{" "}
              ({resetTarget?.user.email}) on{" "}
              <span className="font-medium text-foreground">{resetTarget?.company.name}</span>.
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

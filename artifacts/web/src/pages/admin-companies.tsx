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
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<CompanyProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { impersonateCompany } = useRole();

  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);

  const [searchQuery, setSearchQuery] = useState(urlParams.get("search") || "");
  const [industryFilter, setIndustryFilter] = useState(urlParams.get("industry") || "all");
  const [locationFilter, setLocationFilter] = useState(urlParams.get("location") || "all");
  const [sizeFilter, setSizeFilter] = useState(urlParams.get("size") || "all");

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

  const filtered = useMemo(() => {
    return companies.filter(c => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = c.name.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.industry && c.industry.toLowerCase().includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (industryFilter !== "all" && c.industry !== industryFilter) return false;
      if (locationFilter !== "all" && c.location !== locationFilter) return false;
      if (sizeFilter !== "all" && c.size !== sizeFilter) return false;
      return true;
    });
  }, [companies, searchQuery, industryFilter, locationFilter, sizeFilter]);

  const hasActiveFilters = searchQuery || industryFilter !== "all" || locationFilter !== "all" || sizeFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setIndustryFilter("all");
    setLocationFilter("all");
    setSizeFilter("all");
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
      const res = await fetch(`${basePath}/admin/companies/${resetTarget.id}/reset-password`, {
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
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading companies...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Building2 className="mr-3 text-primary" /> Companies
        </h1>
        <p className="text-muted-foreground mt-1">{companies.length} companies registered on the platform.</p>
      </div>

      <Card className="bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Name, email, industry, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
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
              Showing {filtered.length} of {companies.length} companies
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="pt-6">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Industry</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Size</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Website</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Founded</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Created</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((company) => (
                    <tr key={company.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={(e) => { if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return; navigate(`/companies/${company.id}`); }}>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px] shrink-0">
                            {company.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-foreground truncate text-primary hover:underline">{company.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{company.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{formatIndustry(company.industry) || "—"}</td>
                      <td className="py-2 px-2 text-muted-foreground">{company.location || "—"}</td>
                      <td className="py-2 px-2 text-muted-foreground">{company.size || "—"}</td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {company.website ? (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {(() => { try { return new URL(company.website).hostname; } catch { return company.website; } })()}
                          </a>
                        ) : "—"}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{company.founded || "—"}</td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] gap-1 h-7 px-2"
                            onClick={() => {
                              impersonateCompany(company.id, company.email || "");
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
                            onClick={() => {
                              setResetTarget(company);
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {hasActiveFilters ? "No companies match your filters." : "No companies registered yet."}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) setResetTarget(null); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-medium text-foreground">{resetTarget?.name}</span> ({resetTarget?.email || "no email"})
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

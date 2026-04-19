import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Mail, Lock, User, Phone, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/role-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PHONE_CODES = [
  { code: "+44", flag: "🇬🇧" }, { code: "+1", flag: "🇺🇸" }, { code: "+353", flag: "🇮🇪" },
  { code: "+33", flag: "🇫🇷" }, { code: "+49", flag: "🇩🇪" }, { code: "+34", flag: "🇪🇸" },
  { code: "+39", flag: "🇮🇹" }, { code: "+31", flag: "🇳🇱" }, { code: "+32", flag: "🇧🇪" },
  { code: "+41", flag: "🇨🇭" }, { code: "+46", flag: "🇸🇪" }, { code: "+47", flag: "🇳🇴" },
  { code: "+45", flag: "🇩🇰" }, { code: "+358", flag: "🇫🇮" }, { code: "+48", flag: "🇵🇱" },
  { code: "+43", flag: "🇦🇹" }, { code: "+351", flag: "🇵🇹" }, { code: "+61", flag: "🇦🇺" },
  { code: "+64", flag: "🇳🇿" }, { code: "+91", flag: "🇮🇳" }, { code: "+81", flag: "🇯🇵" },
  { code: "+82", flag: "🇰🇷" }, { code: "+86", flag: "🇨🇳" }, { code: "+65", flag: "🇸🇬" },
  { code: "+852", flag: "🇭🇰" }, { code: "+971", flag: "🇦🇪" }, { code: "+966", flag: "🇸🇦" },
  { code: "+27", flag: "🇿🇦" }, { code: "+55", flag: "🇧🇷" }, { code: "+52", flag: "🇲🇽" },
];

const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

interface Account {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  accountType: "candidate" | "company";
}

export default function MySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role, candidateProfileId, companyProfileId, setUserEmail } = useRole();
  const accountType = role === "company" ? "company" : "candidate";
  const accountId = accountType === "company" ? companyProfileId : candidateProfileId;

  const { data: account, isLoading } = useQuery<Account>({
    queryKey: ["my-account", accountType, accountId],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/account?accountType=${accountType}&accountId=${accountId}`);
      if (!res.ok) throw new Error("Failed to load account");
      return res.json();
    },
    enabled: !!accountId,
  });

  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [phoneForm, setPhoneForm] = useState({ dialCode: "+44", number: "" });
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);

  useEffect(() => {
    if (account?.email) {
      setEmailForm(f => (f.newEmail ? f : { ...f, newEmail: account.email }));
    }
    if (accountType === "candidate") {
      const raw = account?.phone || "";
      const match = raw.match(/^(\+\d+)\s*(.*)$/);
      setPhoneForm(f => {
        if (f.number) return f;
        return {
          dialCode: match?.[1] || "+44",
          number: match?.[2] || raw,
        };
      });
    }
  }, [account?.email, account?.phone, accountType]);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId || accountType !== "candidate") return;
    const trimmedNumber = phoneForm.number.trim();
    const fullPhone = trimmedNumber ? `${phoneForm.dialCode} ${trimmedNumber}` : "";
    setPhoneSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/account/change-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType, accountId, phone: fullPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: "Failed to update phone", description: data.error || "Please try again", variant: "destructive" });
        return;
      }
      toast({
        title: trimmedNumber ? "Phone number updated" : "Phone number cleared",
        description: trimmedNumber ? "Your contact phone number has been changed." : "Your phone number has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-account"] });
    } catch {
      toast({ title: "Failed to update phone", variant: "destructive" });
    } finally {
      setPhoneSubmitting(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) return;
    if (!emailForm.newEmail.trim() || !emailForm.currentPassword) {
      toast({ title: "Please fill in both fields", variant: "destructive" });
      return;
    }
    setEmailSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/account/change-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType,
          accountId,
          currentPassword: emailForm.currentPassword,
          newEmail: emailForm.newEmail.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: "Failed to update email", description: data.error || "Please try again", variant: "destructive" });
        return;
      }
      toast({ title: "Email updated", description: "Your email address has been changed." });
      setUserEmail(data.email);
      setEmailForm({ newEmail: data.email, currentPassword: "" });
      queryClient.invalidateQueries({ queryKey: ["my-account"] });
    } catch {
      toast({ title: "Failed to update email", variant: "destructive" });
    } finally {
      setEmailSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) return;
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast({ title: "Please fill in all password fields", variant: "destructive" });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast({ title: "New password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" });
      return;
    }
    setPwSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/account/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType,
          accountId,
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: "Failed to change password", description: data.error || "Please try again", variant: "destructive" });
        return;
      }
      toast({ title: "Password changed", description: "Your password has been updated." });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast({ title: "Failed to change password", variant: "destructive" });
    } finally {
      setPwSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
        >
          <SettingsIcon className="w-6 h-6" style={{ color: "#4CAF50" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account email and password.
          </p>
        </div>
      </div>

      <div className="rounded-xl p-6 lg:p-8 bg-card border mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account Details</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : account ? (
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground flex items-center gap-2 mb-1">
                {accountType === "company" ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {accountType === "company" ? "Company" : "Name"}
              </dt>
              <dd className="font-medium text-foreground">{account.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" /> Email
              </dt>
              <dd className="font-medium text-foreground break-all">{account.email}</dd>
            </div>
            {account.phone && (
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" /> Phone
                </dt>
                <dd className="font-medium text-foreground">{account.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground flex items-center gap-2 mb-1">
                <SettingsIcon className="w-4 h-4" /> Account Type
              </dt>
              <dd className="font-medium text-foreground capitalize">{accountType}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-destructive">Could not load account.</p>
        )}
      </div>

      <div className="rounded-xl p-6 lg:p-8 bg-card border mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <Mail className="w-5 h-5" style={{ color: "#4CAF50" }} /> Change Email
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          We'll use this email for login and notifications.
        </p>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Email</label>
            <Input
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <Input
              type="password"
              placeholder="Enter your current password to confirm"
              value={emailForm.currentPassword}
              onChange={(e) => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            disabled={emailSubmitting}
            className="px-5 py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90"
            style={{ backgroundColor: "#4CAF50", color: "#fff" }}
          >
            {emailSubmitting ? "Updating..." : "Update Email"}
          </button>
        </form>
      </div>

      {accountType === "candidate" && (
        <div className="rounded-xl p-6 lg:p-8 bg-card border mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Phone className="w-5 h-5" style={{ color: "#4CAF50" }} /> Change Phone Number
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Optional. Leave the number blank to remove your phone number.
          </p>
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="flex gap-2">
                <Select
                  value={phoneForm.dialCode}
                  onValueChange={(code) => setPhoneForm(f => ({ ...f, dialCode: code }))}
                >
                  <SelectTrigger className="w-[120px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_CODES.map(p => (
                      <SelectItem key={p.code} value={p.code}>{p.flag} {p.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={phoneForm.number}
                  onChange={(e) => setPhoneForm(f => ({ ...f, number: e.target.value }))}
                  placeholder="Phone number"
                  className="flex-1"
                  inputMode="tel"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={phoneSubmitting}
              className="px-5 py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              {phoneSubmitting ? "Updating..." : "Update Phone"}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-xl p-6 lg:p-8 bg-card border">
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5" style={{ color: "#4CAF50" }} /> Change Password
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use at least 8 characters. Choose something you don't use elsewhere.
        </p>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <Input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <Input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm New Password</label>
              <Input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={pwSubmitting}
            className="px-5 py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90"
            style={{ backgroundColor: "#4CAF50", color: "#fff" }}
          >
            {pwSubmitting ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

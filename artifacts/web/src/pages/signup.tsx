import { useState } from "react";
import { Building2, UserCircle, UserPlus, Sparkles, Target, Users, BarChart3 } from "lucide-react";
import logoUrl from "@assets/Screenshot_2026-04-11_151121_1775917058507.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useRole, type UserRole } from "@/contexts/role-context";
import { useCreateCandidate, useCreateCompanyProfile } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

type SignUpRole = "company" | "candidate";

export default function SignUp() {
  const { setRole, setCandidateProfileId } = useRole();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selected, setSelected] = useState<SignUpRole | null>(null);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const createCompany = useCreateCompanyProfile();
  const createCandidate = useCreateCandidate();

  const handleCompanySignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name.trim() || !companyForm.email.trim() || !companyForm.password) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (companyForm.password !== companyForm.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (companyForm.password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    createCompany.mutate(
      { data: { name: companyForm.name, email: companyForm.email } },
      {
        onSuccess: () => {
          toast({ title: "Company account created!" });
          setRole("company");
          navigate("/company-profile");
        },
        onError: (err: any) => {
          toast({ title: "Failed to create company", description: err?.message || "Unknown error", variant: "destructive" });
        },
      }
    );
  };

  const handleCandidateSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = candidateForm;
    if (!name.trim() || !email.trim() || !password) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    createCandidate.mutate(
      {
        data: {
          name: name.trim(),
          email: email.trim(),
          password,
          currentTitle: "Not specified",
          summary: "No summary provided",
          skills: ["General"],
          experienceYears: 0,
          education: "Not specified",
          location: "Not specified",
        },
      },
      {
        onSuccess: (data: any) => {
          toast({ title: "Candidate account created!" });
          if (data?.id) {
            setCandidateProfileId(data.id);
          }
          setRole("candidate");
          navigate("/");
        },
        onError: (err: any) => {
          toast({ title: "Failed to create account", description: err?.message || "Unknown error", variant: "destructive" });
        },
      }
    );
  };

  const highlights = [
    { icon: Sparkles, text: "AI-powered candidate matching" },
    { icon: Target, text: "Skills-based scoring engine" },
    { icon: Users, text: "Smart talent pipeline management" },
    { icon: BarChart3, text: "Real-time recruitment analytics" },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div>
          <div className="flex items-center mb-2">
            <img src={logoUrl} alt="Avana Talent" className="h-8" />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-sidebar-foreground leading-tight mb-3">
              {selected === "company"
                ? "Start building your dream team."
                : selected === "candidate"
                  ? "Find your next career move."
                  : "Join the talent revolution."}
            </h1>
            <p className="text-sidebar-foreground/60 text-sm leading-relaxed max-w-sm">
              {selected === "company"
                ? "Create your company profile to post jobs and discover top candidates matched by our AI engine."
                : selected === "candidate"
                  ? "Set up your profile and let our AI match you with the best opportunities aligned to your skills and experience."
                  : "Whether you're hiring or looking — Avana Talent connects the right people with the right roles."}
            </p>
          </div>

          <div className="space-y-4">
            {highlights.map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-sidebar-primary" />
                </div>
                <span className="text-sm text-sidebar-foreground/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-sidebar-foreground/40">
          Avana Talent Platform
        </p>
      </div>

      <div className="flex-1 bg-background flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img src={logoUrl} alt="Avana Talent" className="h-8" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">Create an account</h2>
            <p className="text-sm text-muted-foreground">Choose your account type to get started</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelected("company")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                    selected === "company"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Company
                </button>
                <button
                  type="button"
                  onClick={() => setSelected("candidate")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                    selected === "candidate"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <UserCircle className="w-4 h-4" />
                  Candidate
                </button>
              </div>
            </div>

            {selected === "company" && (
              <form onSubmit={handleCompanySignUp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Company Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Acme Inc."
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-card"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@acme.com"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-card"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm(f => ({ ...f, password: e.target.value }))}
                    className="bg-card"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Re-Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={companyForm.confirmPassword}
                    onChange={(e) => setCompanyForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="bg-card"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createCompany.isPending}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {createCompany.isPending ? "Creating..." : "Create Company Account"}
                </Button>
              </form>
            )}

            {selected === "candidate" && (
              <form onSubmit={handleCandidateSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Jane Doe"
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-card"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-card"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={candidateForm.password}
                    onChange={(e) => setCandidateForm(f => ({ ...f, password: e.target.value }))}
                    className="bg-card"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Re-Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={candidateForm.confirmPassword}
                    onChange={(e) => setCandidateForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="bg-card"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createCandidate.isPending}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {createCandidate.isPending ? "Creating..." : "Create Candidate Account"}
                </Button>
              </form>
            )}

            {!selected && (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                Select your account type above to see the signup form.
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium cursor-pointer hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

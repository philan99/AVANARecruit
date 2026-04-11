import { useState } from "react";
import { Building2, UserCircle, TerminalSquare, UserPlus, Sparkles, Target, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    industry: "",
    website: "",
    location: "",
    description: "",
    size: "",
    founded: "",
  });

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentTitle: "",
    summary: "",
    skills: "",
    experienceYears: "",
    education: "",
    location: "",
  });

  const createCompany = useCreateCompanyProfile();
  const createCandidate = useCreateCandidate();

  const handleCompanySignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name.trim() || !companyForm.email.trim()) {
      toast({ title: "Company name and email are required", variant: "destructive" });
      return;
    }
    createCompany.mutate(
      { data: { ...companyForm } },
      {
        onSuccess: () => {
          toast({ title: "Company account created!" });
          setRole("company");
          navigate("/");
        },
        onError: (err: any) => {
          toast({ title: "Failed to create company", description: err?.message || "Unknown error", variant: "destructive" });
        },
      }
    );
  };

  const handleCandidateSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, currentTitle, summary, skills, experienceYears, education, location } = candidateForm;
    if (!name.trim() || !email.trim() || !currentTitle.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
    const expYears = parseInt(experienceYears) || 0;

    createCandidate.mutate(
      {
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: candidateForm.phone.trim() || undefined,
          currentTitle: currentTitle.trim(),
          summary: summary.trim() || "No summary provided",
          skills: skillsArray.length > 0 ? skillsArray : ["General"],
          experienceYears: expYears,
          education: education.trim() || "Not specified",
          location: location.trim() || "Remote",
        },
      },
      {
        onSuccess: (data: any) => {
          toast({ title: "Candidate profile created!" });
          if (data?.id) {
            setCandidateProfileId(data.id);
          }
          setRole("candidate");
          navigate("/");
        },
        onError: (err: any) => {
          toast({ title: "Failed to create profile", description: err?.message || "Unknown error", variant: "destructive" });
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
            <TerminalSquare className="w-8 h-8 text-sidebar-primary mr-2" />
            <span className="font-mono font-bold text-xl tracking-tight text-sidebar-foreground">
              AVANA <span className="text-sidebar-primary">TALENT</span>
            </span>
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
            <TerminalSquare className="w-8 h-8 text-primary mr-2" />
            <span className="font-mono font-bold text-xl tracking-tight text-foreground">
              AVANA <span className="text-primary">TALENT</span>
            </span>
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
                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Industry</label>
                    <Input
                      placeholder="Technology"
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm(f => ({ ...f, industry: e.target.value }))}
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company Size</label>
                    <Select
                      value={companyForm.size}
                      onValueChange={(val) => setCompanyForm(f => ({ ...f, size: val }))}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="501-1000">501-1000</SelectItem>
                        <SelectItem value="1000+">1000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <Input
                      placeholder="San Francisco, CA"
                      value={companyForm.location}
                      onChange={(e) => setCompanyForm(f => ({ ...f, location: e.target.value }))}
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Founded</label>
                    <Input
                      placeholder="2020"
                      value={companyForm.founded}
                      onChange={(e) => setCompanyForm(f => ({ ...f, founded: e.target.value }))}
                      className="bg-card"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Website</label>
                  <Input
                    placeholder="https://example.com"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm(f => ({ ...f, website: e.target.value }))}
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Tell candidates about your company..."
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm(f => ({ ...f, description: e.target.value }))}
                    className="bg-card min-h-[80px]"
                    rows={3}
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
                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Current Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Software Engineer"
                      value={candidateForm.currentTitle}
                      onChange={(e) => setCandidateForm(f => ({ ...f, currentTitle: e.target.value }))}
                      className="bg-card"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={candidateForm.phone}
                      onChange={(e) => setCandidateForm(f => ({ ...f, phone: e.target.value }))}
                      className="bg-card"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Experience (years)</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="5"
                      value={candidateForm.experienceYears}
                      onChange={(e) => setCandidateForm(f => ({ ...f, experienceYears: e.target.value }))}
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <Input
                      placeholder="New York, NY"
                      value={candidateForm.location}
                      onChange={(e) => setCandidateForm(f => ({ ...f, location: e.target.value }))}
                      className="bg-card"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Education</label>
                  <Input
                    placeholder="B.S. Computer Science, MIT"
                    value={candidateForm.education}
                    onChange={(e) => setCandidateForm(f => ({ ...f, education: e.target.value }))}
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Skills</label>
                  <Input
                    placeholder="React, TypeScript, Node.js (comma-separated)"
                    value={candidateForm.skills}
                    onChange={(e) => setCandidateForm(f => ({ ...f, skills: e.target.value }))}
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Professional Summary</label>
                  <Textarea
                    placeholder="A brief summary of your experience and goals..."
                    value={candidateForm.summary}
                    onChange={(e) => setCandidateForm(f => ({ ...f, summary: e.target.value }))}
                    className="bg-card min-h-[80px]"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createCandidate.isPending}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {createCandidate.isPending ? "Creating..." : "Create Candidate Profile"}
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

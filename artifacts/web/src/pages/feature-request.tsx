import { useState, useEffect } from "react";
import { Lightbulb, Send } from "lucide-react";
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
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useQuery } from "@tanstack/react-query";

const COMPANY_CATEGORIES = [
  "Job posting & matching",
  "Candidate pipeline",
  "Verification",
  "Reporting & analytics",
  "Company profile",
  "Notifications & emails",
  "Other",
];

const CANDIDATE_CATEGORIES = [
  "Profile & CV",
  "Job matching",
  "Job applications",
  "Browse jobs & companies",
  "Verification",
  "Notifications & emails",
  "Other",
];

const PRIORITIES: Array<{ value: "nice-to-have" | "important" | "critical"; label: string }> = [
  { value: "nice-to-have", label: "Nice to have" },
  { value: "important", label: "Important" },
  { value: "critical", label: "Critical to me" },
];

export default function FeatureRequest() {
  const { toast } = useToast();
  const { role, userEmail, candidateProfileId } = useRole();
  const isCompany = role === "company";
  const requesterType = isCompany ? "company" : "candidate";
  const categories = isCompany ? COMPANY_CATEGORIES : CANDIDATE_CATEGORIES;

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const { data: companyProfile } = useCompanyProfile({ enabled: isCompany });
  const { data: candidateProfile } = useQuery({
    queryKey: ["candidate-profile-feature-request", candidateProfileId],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}`);
      if (!res.ok) throw new Error("Failed to fetch candidate profile");
      return res.json();
    },
    enabled: !isCompany && !!candidateProfileId,
  });

  const [form, setForm] = useState({
    name: "",
    email: userEmail || "",
    company: "",
    title: "",
    category: "",
    priority: "important" as "nice-to-have" | "important" | "critical",
    problem: "",
    proposal: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isCompany && companyProfile) {
      setForm(f => ({
        ...f,
        company: f.company || companyProfile.name || "",
        name: f.name || companyProfile.contactName || "",
      }));
    }
    if (!isCompany && candidateProfile) {
      setForm(f => ({ ...f, name: f.name || candidateProfile.name || "" }));
    }
  }, [isCompany, companyProfile, candidateProfile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.title.trim() || !form.proposal.trim()) {
      toast({ title: "Please fill in name, email, title and proposed feature", variant: "destructive" });
      return;
    }
    if (isCompany && !form.company.trim()) {
      toast({ title: "Company name is required", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/feature-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, requesterType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ title: "Failed to send request", description: data.error || "Please try again", variant: "destructive" });
        return;
      }
      toast({
        title: "Feature request submitted",
        description: "Thanks for your idea — our team will take a look.",
      });
      setForm(f => ({ ...f, title: "", category: "", problem: "", proposal: "" }));
    } catch {
      toast({ title: "Failed to send request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
        >
          <Lightbulb className="w-6 h-6" style={{ color: "#4CAF50" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feature Request</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Got an idea that would make AVANA Recruit better for {isCompany ? "your hiring" : "your job search"}?
            Share it with us — we read every request.
          </p>
        </div>
      </div>

      <div className="rounded-xl p-6 lg:p-8 bg-card border">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Your Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Your name"
                value={form.name}
                readOnly
                className="bg-muted cursor-not-allowed"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                readOnly
                className="bg-muted cursor-not-allowed"
                required
              />
            </div>
          </div>

          {isCompany && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Company Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Your company name"
                value={form.company}
                onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Feature Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder={isCompany
                ? "e.g. Bulk message shortlisted candidates"
                : "e.g. Save jobs for later"}
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
              maxLength={120}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm(f => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">How important is this to you?</label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm(f => ({ ...f, priority: v as typeof f.priority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What problem are you trying to solve?
            </label>
            <textarea
              placeholder="What are you doing today, and where does it fall short?"
              value={form.problem}
              onChange={(e) => setForm(f => ({ ...f, problem: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your proposed feature <span className="text-destructive">*</span>
            </label>
            <textarea
              placeholder="Describe how this should work, what it should let you do, and any examples that would help."
              value={form.proposal}
              onChange={(e) => setForm(f => ({ ...f, proposal: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90"
            style={{ backgroundColor: "#4CAF50", color: "#fff" }}
          >
            <Send className="w-4 h-4 mr-2 inline" />
            {submitting ? "Sending..." : "Submit Feature Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

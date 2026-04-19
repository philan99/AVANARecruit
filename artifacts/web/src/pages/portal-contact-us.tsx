import { useState, useEffect } from "react";
import {
  Send,
  Mail,
  LifeBuoy,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Settings,
  UserCircle,
  FileText,
  Search,
  HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/role-context";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useQuery } from "@tanstack/react-query";

type Topic = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
};

const COMPANY_TOPICS: Topic[] = [
  { id: "jobs", label: "Posting & managing jobs", description: "Create, edit, or close job listings.", icon: Briefcase },
  { id: "matching", label: "AI matching results", description: "Questions about scores, ranking or re-running matches.", icon: Sparkles },
  { id: "verification", label: "Candidate verification", description: "Reference checks and employment verification.", icon: ShieldCheck },
  { id: "billing", label: "Billing & subscription", description: "Plans, invoices, payment methods.", icon: CreditCard },
  { id: "account", label: "Account & company profile", description: "Logo, company details, team access.", icon: Settings },
  { id: "other", label: "Something else", description: "Anything not covered above.", icon: HelpCircle },
];

const CANDIDATE_TOPICS: Topic[] = [
  { id: "profile", label: "My profile & CV", description: "Update your details, CV or skills.", icon: UserCircle },
  { id: "applications", label: "Job applications", description: "Track or manage jobs you've applied to.", icon: FileText },
  { id: "matches", label: "Job matches", description: "How matches are generated and shown.", icon: Search },
  { id: "verification", label: "Employment verification", description: "Add or chase up reference checks.", icon: ShieldCheck },
  { id: "account", label: "Account & email settings", description: "Login, notifications and privacy.", icon: Settings },
  { id: "other", label: "Something else", description: "Anything not covered above.", icon: HelpCircle },
];

export default function PortalContactUs() {
  const { toast } = useToast();
  const { role, userEmail, candidateProfileId } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCompany = role === "company";
  const contactType = isCompany ? "company" : "candidate";
  const topics = isCompany ? COMPANY_TOPICS : CANDIDATE_TOPICS;

  const { data: companyProfile } = useCompanyProfile({ enabled: isCompany });

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const { data: candidateProfile } = useQuery({
    queryKey: ["candidate-profile-contact", candidateProfileId],
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
    subject: "",
    message: "",
    company: "",
    topic: "",
  });

  useEffect(() => {
    if (isCompany && companyProfile) {
      setForm(f => ({ ...f, company: f.company || companyProfile.name || "" }));
    }
    if (!isCompany && candidateProfile) {
      setForm(f => ({ ...f, name: f.name || candidateProfile.name || "" }));
    }
  }, [isCompany, companyProfile, candidateProfile]);

  const selectTopic = (topic: Topic) => {
    setForm(f => ({
      ...f,
      topic: topic.id,
      subject: topic.label,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (isCompany && !form.company.trim()) {
      toast({ title: "Company name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, contactType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ title: "Failed to send message", description: data.error || "Please try again", variant: "destructive" });
        return;
      }
      toast({ title: "Support request sent", description: "Our team will get back to you shortly." });
      setForm(f => ({ ...f, subject: "", message: "", topic: "" }));
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const heading = isCompany ? "Get Support" : "Get Support";
  const intro = isCompany
    ? "Need a hand running your hiring on AVANA Recruit? Tell us what's going on and our team will get back to you fast."
    : "Stuck on your profile, an application, or something else? Tell us what's happening and we'll get back to you as soon as we can.";

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8 flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
        >
          <LifeBuoy className="w-6 h-6" style={{ color: "#4CAF50" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{heading}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{intro}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl p-6 bg-card border">
            <h2 className="text-lg font-semibold text-foreground mb-1">What do you need help with?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Pick a topic so the right person on our {isCompany ? "employer success" : "candidate success"} team can reply.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {topics.map((t) => {
                const Icon = t.icon;
                const selected = form.topic === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTopic(t)}
                    className={`text-left rounded-lg border p-3 transition-all hover:border-primary/60 hover:bg-primary/5 ${
                      selected ? "border-primary bg-primary/5 ring-1 ring-primary/40" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: "#4CAF50" }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">{t.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl p-8 bg-card border">
            <h2 className="text-lg font-semibold mb-1 text-foreground">Send your support request</h2>
            <p className="text-sm mb-6 text-muted-foreground">
              The more detail you give us, the faster we can help.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Name <span className="text-destructive">*</span>
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
                    readOnly
                    className="bg-muted cursor-not-allowed"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Subject <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder={isCompany ? "e.g. Trouble re-running matching on a job" : "e.g. Can't update my CV"}
                  value={form.subject}
                  onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  How can we help? <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder={
                    isCompany
                      ? "Describe what you're trying to do, what happened, and any job/candidate IDs that are relevant."
                      : "Describe what you're trying to do, what happened, and any job titles or company names that are relevant."
                  }
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 bg-background border-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                <Send className="w-4 h-4 mr-2 inline" />
                {isSubmitting ? "Sending..." : "Send Support Request"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl p-6 bg-card border">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
              >
                <Mail className="w-5 h-5" style={{ color: "#4CAF50" }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1 text-foreground">Email support</h3>
                <a
                  href={`mailto:${isCompany ? "employers@avanarecruit.ai" : "candidates@avanarecruit.ai"}`}
                  className="text-sm hover:underline"
                  style={{ color: "#4CAF50" }}
                >
                  {isCompany ? "employers@avanarecruit.ai" : "candidates@avanarecruit.ai"}
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  We typically reply within 1 business day, Mon–Fri.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-card border">
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              {isCompany ? "Tips for faster help" : "Before you write to us"}
            </h3>
            {isCompany ? (
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li>Include the affected job title or job ID.</li>
                <li>If a candidate is involved, include their name.</li>
                <li>Tell us what you expected and what actually happened.</li>
                <li>Screenshots help — attach them in your reply email.</li>
              </ul>
            ) : (
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li>Make sure your profile and CV are saved.</li>
                <li>Mention the job title or company you're asking about.</li>
                <li>Tell us what you expected to happen.</li>
                <li>Include any error messages you saw.</li>
              </ul>
            )}
          </div>

          <div className="rounded-xl p-6 border bg-primary/5">
            <h3 className="text-sm font-semibold mb-1 text-foreground">
              {isCompany ? "Hiring on AVANA Recruit" : "New to AVANA Recruit?"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isCompany
                ? "Looking for tips on writing better job posts and getting stronger matches? Our team can share best practice — just ask in your message."
                : "Have a quick look at your profile and applications first — most questions are answered there. Still stuck? We're happy to help."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

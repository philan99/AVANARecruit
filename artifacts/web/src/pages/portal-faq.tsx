import { Link } from "wouter";
import { HelpCircle, LifeBuoy, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRole } from "@/contexts/role-context";

type FAQ = { q: string; a: React.ReactNode };

const CANDIDATE_FAQS: FAQ[] = [
  {
    q: "How do I update my profile or CV?",
    a: (
      <>
        Open <strong>My Profile</strong> from the sidebar. You can edit your
        details, paste in a new summary, update your skills and re-upload your
        CV. Your changes are saved when you hit <em>Save</em>, and they feed
        straight into the matching engine.
      </>
    ),
  },
  {
    q: "How are my job matches generated?",
    a: (
      <>
        We compare your skills, experience, qualifications, location and
        preferences (job type, workplace, industry) against every open job on
        the platform. Each match gets an overall score plus a breakdown so you
        can see where you're strong and where there's a gap.
      </>
    ),
  },
  {
    q: "Why aren't I seeing many matches?",
    a: (
      <>
        The most common reasons are an incomplete profile or very narrow
        preferences. Make sure your skills, experience and location are filled
        in, and check that your preferred job types, workplaces and industries
        aren't too restrictive.
      </>
    ),
  },
  {
    q: "Can companies see my profile?",
    a: (
      <>
        Yes — when you appear as a match for one of their jobs, the hiring team
        can view the same profile information you've added. They can't see your
        contact details until you accept a match or apply.
      </>
    ),
  },
  {
    q: "What is employment verification and do I have to do it?",
    a: (
      <>
        Employment verification lets a previous manager confirm a role you've
        listed. It's optional, but verified roles carry more weight with hiring
        teams. Add a verifier from the <strong>Verifications</strong> page and
        we'll email them a secure link.
      </>
    ),
  },
  {
    q: "How do I change my email address or password?",
    a: (
      <>
        Go to <strong>My Settings</strong> from the sidebar. From there you can
        update your login email, change your password and manage your
        notification preferences.
      </>
    ),
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        Send us a request from <Link href="/contact-us"><a className="underline" style={{ color: "#4CAF50" }}>Get Support</a></Link>{" "}
        and pick "Account & email settings" as the topic. We'll confirm your
        identity and remove your profile and data within a few business days.
      </>
    ),
  },
  {
    q: "I never received my verification or login email — what now?",
    a: (
      <>
        Check your spam or junk folder first. If it's not there, contact us
        and we'll resend it manually or help you fix the email on your
        account.
      </>
    ),
  },
];

const COMPANY_FAQS: FAQ[] = [
  {
    q: "How do I post a new job?",
    a: (
      <>
        Click <strong>Jobs</strong> in the sidebar, then <em>New Job</em>. Fill
        in the role details and the "Ideal Candidate" section — the more
        specific you are about skills, experience and preferences, the better
        the matches you'll get back.
      </>
    ),
  },
  {
    q: "How does the AI matching work?",
    a: (
      <>
        For each open job we score every active candidate on skills,
        experience, qualifications, location and preferences. You'll see an
        overall score plus a breakdown so you can understand exactly why a
        candidate ranked where they did.
      </>
    ),
  },
  {
    q: "How do I re-run matching after editing a job?",
    a: (
      <>
        Open the job and use <strong>Re-run matching</strong> at the top of the
        Matches panel. We'll regenerate scores against the latest version of
        your job and the current candidate pool.
      </>
    ),
  },
  {
    q: "Can I close or pause a job listing?",
    a: (
      <>
        Yes. From the job detail page you can mark a job as closed at any time.
        Closed jobs stop generating new matches but stay in your records so you
        can reopen or duplicate them later.
      </>
    ),
  },
  {
    q: "How do I add another team member to my company?",
    a: (
      <>
        Go to <strong>Team</strong> in the sidebar and invite a colleague by
        email. They'll receive a sign-up link and join your company workspace
        with shared access to your jobs, candidates and matches.
      </>
    ),
  },
  {
    q: "What is candidate verification and how do I trust it?",
    a: (
      <>
        Verifications are confirmations from a candidate's previous manager
        that a role on their CV is genuine. Verified roles are flagged on the
        candidate profile with the verifier's name and the date verified, so
        you can weigh the evidence yourself.
      </>
    ),
  },
  {
    q: "How do I update my company profile or logo?",
    a: (
      <>
        Open <strong>Company Profile</strong> from the sidebar. You can update
        your name, industry, location, description and logo. Candidates see
        this when reviewing matches, so it's worth keeping current.
      </>
    ),
  },
  {
    q: "Where do I see billing or invoices?",
    a: (
      <>
        Billing isn't self-serve in-app yet. Send us a request from{" "}
        <Link href="/contact-us"><a className="underline" style={{ color: "#4CAF50" }}>Get Support</a></Link>{" "}
        with topic "Billing & subscription" and we'll send you the latest
        invoice or update your plan.
      </>
    ),
  },
];

export default function PortalFAQ() {
  const { role } = useRole();
  const isCompany = role === "company";
  const faqs = isCompany ? COMPANY_FAQS : CANDIDATE_FAQS;
  const supportEmail = isCompany
    ? "employers@avanarecruit.ai"
    : "candidates@avanarecruit.ai";

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
        >
          <HelpCircle className="w-6 h-6" style={{ color: "#4CAF50" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {isCompany
              ? "Quick answers to the things employers ask us most. Still stuck? Our team is one click away."
              : "Quick answers to the things candidates ask us most. Still stuck? Our team is one click away."}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-2 sm:p-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <Link href="/contact-us">
          <a className="rounded-xl border bg-card p-5 hover:border-primary/60 hover:bg-primary/5 transition-all flex items-start gap-3 cursor-pointer">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
            >
              <LifeBuoy className="w-5 h-5" style={{ color: "#4CAF50" }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Didn't find your answer?
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Open a support request and our team will get back to you fast.
              </div>
            </div>
          </a>
        </Link>

        <a
          href={`mailto:${supportEmail}`}
          className="rounded-xl border bg-card p-5 hover:border-primary/60 hover:bg-primary/5 transition-all flex items-start gap-3 cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "#4CAF50" }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Email us directly
            </div>
            <div
              className="text-xs mt-1 underline"
              style={{ color: "#4CAF50" }}
            >
              {supportEmail}
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

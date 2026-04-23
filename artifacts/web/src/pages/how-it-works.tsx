import { useEffect } from "react";
import { Link } from "wouter";
import logoUrl from "@assets/Full_Logo_-_GREEN_1776492081935.png";
import { MarketingNav } from "@/components/marketing-nav";
import {
  Building2,
  UserCircle,
  Upload,
  Search,
  Sparkles,
  BarChart3,
  Send,
  KanbanSquare,
  Users,
  ShieldCheck,
  Target,
  BriefcaseBusiness,
  FileText,
  Bell,
  Globe,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function HowItWorks() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const companySteps = [
    {
      icon: Building2,
      title: "Create Your Company Profile",
      description: "Set up your company page with your logo, industry details, and company information. This helps candidates learn about your organisation and builds trust.",
    },
    {
      icon: Upload,
      title: "Post Jobs Three Ways",
      description: "Create a job listing the way that suits you: describe the role in a sentence and let AI draft it, upload an existing job description (PDF, DOCX or TXT) and let AI fill the form, or fill it in manually. You stay in full control of the final wording.",
    },
    {
      icon: Sparkles,
      title: "Run AI Matching",
      description: "Our AI engine analyses every candidate in the system against your job requirements, scoring them across six weighted dimensions: Skills (30%), Experience (20%), Preferences (15%), Verification (15%), Location (10%) and Education (10%).",
    },
    {
      icon: BarChart3,
      title: "Review Match Scores",
      description: "See ranked candidates with detailed breakdowns — overall match percentage, individual category scores, matched and missing skills, and a written AI assessment for each candidate.",
    },
    {
      icon: KanbanSquare,
      title: "Manage Your Pipeline",
      description: "Track candidates through your hiring process with a visual pipeline: Pending, Shortlisted, Screened, Interviewed, Offered, and Hired. Drag and drop to update stages.",
    },
    {
      icon: Send,
      title: "Contact & Hire",
      description: "Reach out to top candidates directly through the platform. When a candidate applies, you receive an email notification with their details and match score.",
    },
  ];

  const candidateSteps = [
    {
      icon: Upload,
      title: "Upload Your CV",
      description: "Sign up and upload your CV as the first step of our guided 5-minute setup. Your CV is shared with companies when you're shortlisted, so they can review your full background.",
    },
    {
      icon: Sparkles,
      title: "AI Pre-Fills Your Profile",
      description: "Our AI reads your CV and fills in your skills, experience, education and more. Keep your own wording or let AI summarise it — anything uncertain is flagged for you to verify.",
    },
    {
      icon: UserCircle,
      title: "Review & Complete Your Profile",
      description: "Walk through 7 quick steps — basics, skills, education, experience, preferences and social links. Your progress saves automatically, and you can come back later to finish any time.",
    },
    {
      icon: Target,
      title: "See Your AI Matches Instantly",
      description: "As soon as you finish setup, you'll see live jobs ranked by how well you fit them — with a detailed score breakdown showing exactly why each role matches you.",
    },
    {
      icon: Search,
      title: "Browse Jobs & Companies",
      description: "Explore open positions and company profiles. Filter by industry, location, and job type to find opportunities that interest you, even beyond your top AI matches.",
    },
    {
      icon: FileText,
      title: "Apply with One Click",
      description: "When you find a role you like, apply directly through the platform. Your profile, match score, and a personalised cover message are sent to the company.",
    },
    {
      icon: ShieldCheck,
      title: "Verify Your Experience",
      description: "Request verification from past employers to confirm your work history, qualifications, and certifications. Even one or two verified references can boost your match score by up to 30%, helping you stand out to employers.",
    },
    {
      icon: BarChart3,
      title: "Track Your Performance",
      description: "Monitor your match performance with a personal dashboard showing average scores, score distributions, a radar chart of your strengths, and your top matches.",
    },
    {
      icon: MessageSquare,
      title: "Get AI Career Advice",
      description: "Use the built-in AI assistant to get personalised tips on improving your match scores. It analyses your skills gaps and suggests how to strengthen your profile.",
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Matching",
      description: "Advanced algorithms score candidates across six weighted dimensions — including the candidate's own workplace, job-type and industry preferences — for accurate, unbiased matching.",
    },
    {
      icon: ShieldCheck,
      title: "Credential Verification",
      description: "Built-in verification system for qualifications, employment history, and certifications with email-based workflows.",
    },
    {
      icon: KanbanSquare,
      title: "Visual Pipeline",
      description: "Drag-and-drop hiring pipeline with stages from initial match through to hired, giving companies full visibility.",
    },
    {
      icon: Globe,
      title: "Location Intelligence",
      description: "Smart location matching handles remote work, exact city matches, and regional proximity for flexible hiring.",
    },
    {
      icon: Bell,
      title: "Email Notifications",
      description: "Automated email alerts for applications, verification requests, and status changes keep everyone informed.",
    },
    {
      icon: BriefcaseBusiness,
      title: "Company Profiles",
      description: "Rich company pages with logos, descriptions, and job listings help candidates research potential employers.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <MarketingNav active="how-it-works" />

      <section className="relative" style={{ backgroundColor: "#1a2035", paddingTop: "72px" }}>
        <div className="absolute inset-0 overflow-hidden" style={{ paddingTop: "72px" }}>
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: "#4CAF50" }}>
              How It Works
            </p>
            <h1 className="text-4xl lg:text-[52px] font-bold leading-[1.08] mb-6" style={{ color: "#ffffff" }}>
              Smarter Recruitment,
              <br />Step by Step
            </h1>
            <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              Whether you're a company looking to hire or a candidate searching for your next role, here's exactly how AVANA Recruit works for you.
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
          <div className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #1a2035 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.2)" }}>
                <Building2 className="w-3.5 h-3.5" style={{ color: "#4CAF50" }} />
                <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: "#4CAF50" }}>For Companies</span>
              </div>
              <h2 className="text-3xl lg:text-[44px] font-bold leading-[1.1] mb-5" style={{ color: "#1a2035" }}>
                Hire with <span style={{ color: "#4CAF50" }}>Confidence</span>
              </h2>
              <p className="text-base lg:text-lg leading-relaxed" style={{ color: "#6b7280" }}>
                From posting your first job to signing your next hire — everything you need to find the right talent, powered by AI.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:gap-5 lg:max-w-md w-full">
              {[
                { value: "6", label: "Scoring dimensions" },
                { value: "3", label: "Ways to post jobs" },
                { value: "1-click", label: "Verified hires" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#f8f9fb", border: "1px solid #e5e7eb" }}>
                  <div className="text-xl lg:text-2xl font-bold mb-1" style={{ color: "#1a2035" }}>{stat.value}</div>
                  <div className="text-[11px] leading-tight font-medium" style={{ color: "#6b7280" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companySteps.map((step, index) => {
              const isFeatured = index === 0;
              return (
                <div
                  key={step.title}
                  className={`relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(26,32,53,0.18)] group overflow-hidden ${isFeatured ? "md:col-span-2 lg:col-span-1" : ""}`}
                  style={
                    isFeatured
                      ? { background: "linear-gradient(135deg, #1a2035 0%, #232a45 100%)", border: "1px solid rgba(76, 175, 80, 0.25)" }
                      : { backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }
                  }
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(90deg, #4CAF50 0%, #6dcf72 100%)" }}
                  />
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle, rgba(76,175,80,0.15) 0%, transparent 70%)" }} />

                  <div className="relative flex items-center gap-3 mb-5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg, #4CAF50 0%, #43a047 100%)" }}>
                        <step.icon className="w-5 h-5" style={{ color: "#ffffff" }} />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm" style={{ backgroundColor: isFeatured ? "#4CAF50" : "#1a2035", color: "#ffffff", border: "2px solid #ffffff" }}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: isFeatured ? "rgba(76, 175, 80, 0.9)" : "#9ca3af" }}>
                      Step {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <h3 className="relative text-lg font-bold mb-2.5 leading-snug" style={{ color: isFeatured ? "#ffffff" : "#1a2035" }}>{step.title}</h3>
                  <p className="relative text-sm leading-relaxed" style={{ color: isFeatured ? "rgba(255,255,255,0.7)" : "#6b7280" }}>{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: "#f8f9fb" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #1a2035 0%, transparent 70%)" }} />
          <div className="absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ backgroundColor: "rgba(26, 32, 53, 0.08)", border: "1px solid rgba(26, 32, 53, 0.15)" }}>
                <UserCircle className="w-3.5 h-3.5" style={{ color: "#1a2035" }} />
                <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: "#1a2035" }}>For Candidates</span>
              </div>
              <h2 className="text-3xl lg:text-[44px] font-bold leading-[1.1] mb-5" style={{ color: "#1a2035" }}>
                Find Your <span style={{ color: "#4CAF50" }}>Perfect Role</span>
              </h2>
              <p className="text-base lg:text-lg leading-relaxed" style={{ color: "#6b7280" }}>
                Build your profile, let AI find your best matches, and apply to roles where you're most likely to succeed.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:gap-5 lg:max-w-md w-full">
              {[
                { value: "5 min", label: "Guided setup" },
                { value: "+30%", label: "Score from verifying" },
                { value: "1-click", label: "Apply to roles" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                  <div className="text-xl lg:text-2xl font-bold mb-1" style={{ color: "#1a2035" }}>{stat.value}</div>
                  <div className="text-[11px] leading-tight font-medium" style={{ color: "#6b7280" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidateSteps.map((step, index) => {
              const isFeatured = index === 0;
              return (
                <div
                  key={step.title}
                  className={`relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(26,32,53,0.18)] group overflow-hidden ${isFeatured ? "md:col-span-2 lg:col-span-1" : ""}`}
                  style={
                    isFeatured
                      ? { background: "linear-gradient(135deg, #1a2035 0%, #232a45 100%)", border: "1px solid rgba(76, 175, 80, 0.25)" }
                      : { backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }
                  }
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(90deg, #1a2035 0%, #4CAF50 100%)" }}
                  />
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle, rgba(26,32,53,0.12) 0%, transparent 70%)" }} />

                  <div className="relative flex items-center gap-3 mb-5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: isFeatured ? "linear-gradient(135deg, #4CAF50 0%, #43a047 100%)" : "linear-gradient(135deg, #1a2035 0%, #2c3454 100%)" }}>
                        <step.icon className="w-5 h-5" style={{ color: "#ffffff" }} />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm" style={{ backgroundColor: isFeatured ? "#4CAF50" : "#1a2035", color: "#ffffff", border: "2px solid #ffffff" }}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: isFeatured ? "rgba(76, 175, 80, 0.9)" : "#9ca3af" }}>
                      Step {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <h3 className="relative text-lg font-bold mb-2.5 leading-snug" style={{ color: isFeatured ? "#ffffff" : "#1a2035" }}>{step.title}</h3>
                  <p className="relative text-sm leading-relaxed" style={{ color: isFeatured ? "rgba(255,255,255,0.7)" : "#6b7280" }}>{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 right-0 w-[520px] h-[520px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
          <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #1a2035 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.2)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#4CAF50" }} />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: "#4CAF50" }}>Platform Features</span>
            </div>
            <h2 className="text-3xl lg:text-[44px] font-bold leading-[1.1] mb-5" style={{ color: "#1a2035" }}>
              Everything You <span style={{ color: "#4CAF50" }}>Need</span>
            </h2>
            <p className="text-base lg:text-lg leading-relaxed" style={{ color: "#6b7280" }}>
              Built-in tools that make recruitment smarter, faster, and more transparent for everyone involved.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const isFeatured = index === 0;
              return (
                <div
                  key={feature.title}
                  className="relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(26,32,53,0.18)] group overflow-hidden"
                  style={
                    isFeatured
                      ? { background: "linear-gradient(135deg, #1a2035 0%, #232a45 100%)", border: "1px solid rgba(76, 175, 80, 0.25)" }
                      : { backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }
                  }
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(90deg, #4CAF50 0%, #6dcf72 100%)" }}
                  />
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle, rgba(76,175,80,0.15) 0%, transparent 70%)" }} />

                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm" style={{ background: "linear-gradient(135deg, #4CAF50 0%, #43a047 100%)" }}>
                    <feature.icon className="w-5 h-5" style={{ color: "#ffffff" }} />
                  </div>
                  <h3 className="relative text-lg font-bold mb-2.5 leading-snug" style={{ color: isFeatured ? "#ffffff" : "#1a2035" }}>{feature.title}</h3>
                  <p className="relative text-sm leading-relaxed" style={{ color: isFeatured ? "rgba(255,255,255,0.7)" : "#6b7280" }}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28" style={{ backgroundColor: "#1a2035" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#4CAF50" }}>
              The AI Behind the Match
            </p>
            <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-4" style={{ color: "#ffffff" }}>
              How We Score Every Match
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              Every candidate-job match is scored across six weighted dimensions, producing an overall percentage and a detailed assessment.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {[
              { label: "Experience", weight: "25%", desc: "Total and role-relevant years weighed against the job's seniority level" },
              { label: "Skills", weight: "25%", desc: "Candidate skills compared against the role's required skills" },
              { label: "Preferences", weight: "15%", desc: "Workplace, job type and industry alignment with candidate preferences" },
              { label: "Verification", weight: "15%", desc: "Number of verified employment records and credentials" },
              { label: "Location", weight: "10%", desc: "Remote, exact city match, or regional proximity" },
              { label: "Education", weight: "10%", desc: "Candidate's qualification level versus the role's requirement" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-5 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-2xl font-bold font-mono mb-1" style={{ color: "#4CAF50" }}>{item.weight}</div>
                <div className="text-sm font-semibold mb-2" style={{ color: "#ffffff" }}>{item.label}</div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20" style={{ backgroundColor: "#f8f9fb" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4" style={{ color: "#1a2035" }}>
            Ready to Get Started?
          </h2>
          <p className="text-base mb-8" style={{ color: "#6b7280" }}>
            Join AVANA Recruit today — whether you're hiring or looking for your next opportunity.
          </p>
          <Link href="/">
            <button
              className="px-8 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer hover:opacity-90 inline-flex items-center gap-2"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <footer style={{ backgroundColor: "#1a2035", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={logoUrl} alt="AVANA Recruit" className="h-6" />
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-xs hover:text-white/60 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                Terms & Conditions
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <Link href="/privacy-policy" className="text-xs hover:text-white/60 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                Privacy Policy
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                © 2026 AVANA Services Limited. Company Number: 15268633
              </p>
            </div>
          </div>
          <div className="mt-1 text-right">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Registered Office: 85 Great Portland Street, London, W1W 7LT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

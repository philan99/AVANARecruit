import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, UserCircle, LogIn, ArrowRight, Lightbulb, TrendingUp, Heart, ChevronRight, Sparkles, Target, Users, BarChart3, Globe, Lock, Check, UserPlus, ShieldCheck, Mail, CheckCircle2, Eye, EyeOff } from "lucide-react";
import logoUrl from "@assets/Full_Logo_-_GREEN_1776492081935.png";
import { MarketingNav } from "@/components/marketing-nav";
import { Input } from "@/components/ui/input";
import { useRole, type UserRole } from "@/contexts/role-context";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useCreateCandidate, useCreateCompanyProfile } from "@workspace/api-client-react";

type SignUpRole = "company" | "candidate";

export default function RoleSelect() {
  const { setRole } = useRole();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
    if (window.location.pathname !== baseUrl && window.location.pathname !== `${baseUrl}/`) {
      window.history.replaceState(null, "", baseUrl);
    }
    if (hash === "#login") {
      setShowLogin(true);
      window.history.replaceState(null, "", baseUrl);
    } else if (hash === "#signup") {
      setShowSignup(true);
      window.history.replaceState(null, "", baseUrl);
    } else if (hash === "#pricing") {
      setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }), 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);
  const [signupRole, setSignupRole] = useState<SignUpRole | null>(null);
  const [companyForm, setCompanyForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [candidateForm, setCandidateForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showCompanyPassword, setShowCompanyPassword] = useState(false);
  const [showCompanyConfirm, setShowCompanyConfirm] = useState(false);
  const [showCandidatePassword, setShowCandidatePassword] = useState(false);
  const [showCandidateConfirm, setShowCandidateConfirm] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const createCompany = useCreateCompanyProfile();
  const createCandidate = useCreateCandidate();

  const { setCandidateProfileId, setCompanyProfileId, setUserEmail } = useRole();
  const [, setLocation] = useLocation();

  const handleCompanySignUp = async (e: React.FormEvent) => {
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
    const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
    try {
      const res = await fetch(`${basePath}/company-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyForm.name.trim(), email: companyForm.email.trim(), password: companyForm.password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ title: "Failed to create company", description: data.error || "Unknown error", variant: "destructive" });
        return;
      }
      toast({ title: "Company account created! Please check your email to verify." });
      setVerificationEmail(companyForm.email.trim());
      setVerificationSent(true);
      setShowSignup(false);
    } catch {
      toast({ title: "Failed to create company", variant: "destructive" });
    }
  };

  const handleCandidateSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email: cEmail, password: cPass, confirmPassword } = candidateForm;
    if (!name.trim() || !cEmail.trim() || !cPass) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (cPass !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (cPass.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    createCandidate.mutate(
      {
        data: {
          name: name.trim(),
          email: cEmail.trim(),
          password: cPass,
          currentTitle: "Not specified",
          summary: "",
          skills: [],
          experienceYears: 0,
          education: "Not specified",
          location: "Not specified",
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Account created! Please check your email to verify." });
          setVerificationEmail(candidateForm.email.trim());
          setVerificationSent(true);
          setShowSignup(false);
        },
        onError: (err: any) => {
          toast({ title: "Failed to create account", description: err?.message || "Unknown error", variant: "destructive" });
        },
      }
    );
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Please enter your email address", variant: "destructive" });
      return;
    }
    setForgotSending(true);
    try {
      const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
      const res = await fetch(`${basePath}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (res.ok) {
        setForgotSent(true);
      } else {
        toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setForgotSending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }

    const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
    setIsLoading(true);

    try {
      const res = await fetch(`${basePath}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserEmail(email);

        if (data.role === "admin") {
          setRole("admin");
        } else if (data.role === "candidate") {
          setCandidateProfileId(data.candidateId);
          setRole("candidate");
        } else if (data.role === "company") {
          setCompanyProfileId(data.companyId);
          setRole("company");
        }

        setLocation("/");
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.unverified) {
          setUnverifiedEmail(data.email || email);
          setShowLogin(false);
        } else {
          setLoginErrorMsg(data.error || "Invalid email or password");
        }
      }
    } catch {
      setLoginErrorMsg("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (emailToResend: string) => {
    setResending(true);
    try {
      const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
      const res = await fetch(`${basePath}/verify-email/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToResend }),
      });
      const data = await res.json();
      toast({ title: data.message || "Verification email sent!" });
    } catch {
      toast({ title: "Failed to resend verification email", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  const services = [
    {
      icon: Sparkles,
      title: "AI Matching",
      subtitle: "Intelligent Candidate Matching",
      description: "Our AI engine analyses skills, experience, education and location to deliver precise candidate-to-job matches.",
    },
    {
      icon: Target,
      title: "Skills Scoring",
      subtitle: "Competency-Based Assessment",
      description: "Detailed scoring breakdowns help you understand exactly how well candidates align with your role requirements.",
    },
    {
      icon: Users,
      title: "Talent Pipeline",
      subtitle: "Smart Pipeline Management",
      description: "Build and manage a pipeline of pre-matched candidates, ready for your current and future positions.",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      subtitle: "Recruitment Intelligence",
      description: "Real-time dashboards and reporting to track performance, identify trends, and optimise your hiring strategy.",
    },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We drive strategic recruitment innovation by harnessing the latest in AI and data science.",
    },
    {
      icon: TrendingUp,
      title: "Value Driven",
      description: "Our approach delivers tangible results — faster hires, better matches, and reduced recruitment costs.",
    },
    {
      icon: Heart,
      title: "People First",
      description: "Every solution is built around people, ensuring candidates and companies find their perfect match.",
    },
  ];

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f3f4f6" }}>
        <div className="w-full max-w-md mx-4 rounded-xl shadow-lg p-8" style={{ backgroundColor: "#fff" }}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
              <Mail className="w-8 h-8" style={{ color: "#4CAF50" }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#1a2035" }}>Check Your Email</h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              We've sent a verification link to <strong>{verificationEmail}</strong>. Please click the link in the email to activate your account.
            </p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>The link will expire in 24 hours.</p>
            <div className="pt-2 space-y-3">
              <button
                onClick={() => handleResendVerification(verificationEmail)}
                disabled={resending}
                className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#f3f4f6", color: "#1a2035", border: "1px solid #e5e7eb" }}
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
              <button
                onClick={() => { setVerificationSent(false); setVerificationEmail(""); }}
                className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: "#1a2035", color: "#fff" }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (unverifiedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f3f4f6" }}>
        <div className="w-full max-w-md mx-4 rounded-xl shadow-lg p-8" style={{ backgroundColor: "#fff" }}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#fef3c7" }}>
              <Mail className="w-8 h-8" style={{ color: "#f59e0b" }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#1a2035" }}>Email Not Verified</h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Your account <strong>{unverifiedEmail}</strong> hasn't been verified yet. Please check your inbox for the verification email, or request a new one below.
            </p>
            <div className="pt-2 space-y-3">
              <button
                onClick={() => handleResendVerification(unverifiedEmail)}
                disabled={resending}
                className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
              <button
                onClick={() => { setUnverifiedEmail(""); setShowLogin(true); }}
                className="w-full py-3 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: "#1a2035", color: "#fff" }}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <MarketingNav
        active="home"
        onSignIn={() => setShowLogin(true)}
        onGetStarted={() => setShowSignup(true)}
        onPricing={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
      />

      <section className="relative" style={{ backgroundColor: "#1a2035", paddingTop: "72px" }}>
        <div className="absolute inset-0 overflow-hidden" style={{ paddingTop: "72px" }}>
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-28 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: "#4CAF50" }}>
              AI-Powered Recruitment Platform
            </p>
            <h1 className="text-4xl lg:text-[56px] font-bold leading-[1.08] mb-6" style={{ color: "#ffffff" }}>
              Connecting the Right Talent
              <br />with the Right Opportunity.
            </h1>
            <p className="text-lg leading-relaxed max-w-xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
              AVANA Recruit uses artificial intelligence to match candidates and companies based on skills, experience, education and location — making recruitment smarter and faster.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                Sign In
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="px-8 py-3.5 text-sm font-semibold rounded-md border transition-all cursor-pointer hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", backgroundColor: "transparent" }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 lg:py-28" style={{ backgroundColor: "#f8f9fb" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#4CAF50" }}>
              Platform Capabilities
            </p>
            <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-4" style={{ color: "#1a2035" }}>
              Expertise That Transforms
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: "#6b7280" }}>
              Tailored AI-powered recruitment solutions for real results
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-xl p-7 transition-all hover:-translate-y-1"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                  <service.icon className="w-5 h-5" style={{ color: "#4CAF50" }} />
                </div>
                <h3 className="text-base font-bold mb-1" style={{ color: "#1a2035" }}>{service.title}</h3>
                <p className="text-xs font-medium mb-3" style={{ color: "#4CAF50" }}>{service.subtitle}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#4CAF50" }}>
                Built For Everyone
              </p>
              <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-6" style={{ color: "#1a2035" }}>
                Your Strategic Partner in Talent Acquisition
              </h2>
              <p className="text-base leading-relaxed mb-10" style={{ color: "#6b7280" }}>
                Whether you're looking to hire top talent or find your next career move, AVANA Recruit's AI engine works for both sides of the recruitment equation.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <Building2 className="w-5 h-5" style={{ color: "#4CAF50" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: "#1a2035" }}>For Companies</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>Post jobs, receive AI-ranked candidate matches, and manage your recruitment pipeline from a single dashboard.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <UserCircle className="w-5 h-5" style={{ color: "#4CAF50" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: "#1a2035" }}>For Candidates</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>Create your profile, browse opportunities, and see how well you match against each role with detailed AI scoring.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <Lock className="w-5 h-5" style={{ color: "#4CAF50" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: "#1a2035" }}>Secure & Private</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>Your data is protected with enterprise-grade security. We never share your information without consent.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:mt-[104px]">
              <div className="rounded-2xl p-8 w-full max-w-md" style={{ backgroundColor: "#1a2035" }}>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(76, 175, 80, 0.15)" }}>
                      <Globe className="w-5 h-5" style={{ color: "#4CAF50" }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#ffffff" }}>AI Match Report</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Sample candidate analysis</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Skills Match", value: 92 },
                      { label: "Experience Fit", value: 85 },
                      { label: "Education Score", value: 78 },
                      { label: "Location Match", value: 95 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span style={{ color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                          <span className="font-mono font-semibold" style={{ color: "#ffffff" }}>{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.value}%`, backgroundColor: "#4CAF50" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Overall Score</span>
                      <span className="text-3xl font-bold font-mono" style={{ color: "#4CAF50" }}>87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28" style={{ backgroundColor: "#f8f9fb" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#4CAF50" }}>
                Trusted Verification
              </p>
              <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-6" style={{ color: "#1a2035" }}>
                Verified Candidates,
                <br />Confident Hiring
              </h2>
              <p className="text-base leading-relaxed mb-10" style={{ color: "#6b7280" }}>
                Our built-in employment verification system lets candidates request references directly through the platform. Verifiers receive a secure email link to confirm employment history — giving companies the confidence they need.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: "#4CAF50" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: "#1a2035" }}>One-Click Verification</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>Candidates send verification requests to previous employers or colleagues with a single click from their profile.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <Mail className="w-5 h-5" style={{ color: "#4CAF50" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: "#1a2035" }}>Secure Email Links</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>Verifiers receive a branded, secure link — no account needed. They simply confirm or decline the employment claim.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}>
                    <CheckCircle2 className="w-5 h-5" style={{ color: "#4CAF50" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: "#1a2035" }}>Transparent Status</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>Verification status is tracked on the candidate profile — Pending, Verified, or Declined — visible to both candidates and companies.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:mt-[140px]">
              <div className="rounded-2xl p-8 w-full max-w-md" style={{ backgroundColor: "#1a2035" }}>
                <div className="flex items-center gap-3 pb-5 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(76, 175, 80, 0.15)" }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: "#4CAF50" }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#ffffff" }}>Employment Verification</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Sample verification status</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { role: "Senior Developer", company: "Acme Corp", verifier: "J. Smith", status: "Verified" },
                    { role: "Tech Lead", company: "Nova Tech", verifier: "S. Williams", status: "Verified" },
                    { role: "Full Stack Engineer", company: "StartupXYZ", verifier: "M. Johnson", status: "Pending" },
                  ].map((item) => (
                    <div key={item.role} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                      <div className="shrink-0">
                        {item.status === "Verified" ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: "#4CAF50" }} />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 animate-pulse" style={{ borderColor: "rgba(251, 191, 36, 0.6)" }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate" style={{ color: "#ffffff" }}>{item.role}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{item.company} &middot; {item.verifier}</div>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: item.status === "Verified" ? "rgba(76, 175, 80, 0.15)" : "rgba(251, 191, 36, 0.15)",
                          color: item.status === "Verified" ? "#4CAF50" : "#FBBF24",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28" style={{ backgroundColor: "#1a2035" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#4CAF50" }}>
              Our Core Values
            </p>
            <h2 className="text-3xl lg:text-[40px] font-bold leading-tight" style={{ color: "#ffffff" }}>
              Everything We Do is Underpinned
              <br className="hidden lg:block" />by Our Core Values
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "rgba(76, 175, 80, 0.12)" }}>
                  <value.icon className="w-6 h-6" style={{ color: "#4CAF50" }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#ffffff" }}>{value.title}</h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 lg:py-28" style={{ backgroundColor: "#f8f9fb" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#4CAF50" }}>
              Pricing
            </p>
            <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-4" style={{ color: "#1a2035" }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: "#6b7280" }}>
              Choose a plan that fits your recruitment needs. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="rounded-xl p-8 flex flex-col" style={{ backgroundColor: "#eef6ee", border: "1px solid #c8e6c9" }}>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: "#4CAF50" }}>Candidate</p>
              <div className="mb-1">
                <span className="text-4xl font-bold" style={{ color: "#1a2035" }}>£10</span>
                <span className="text-sm" style={{ color: "#6b7280" }}>/year</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "#6b7280" }}>Unlock premium AI matching to land your ideal role faster</p>
              <ul className="space-y-3 mb-8 flex-1">
                {["Full candidate profile with CV upload", "AI-powered job matching & scoring", "Priority visibility to employers", "Save & track favourite jobs", "Application status notifications", "Verified profile badge"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setSignupRole("candidate"); setShowSignup(true); }}
                className="w-full py-3 rounded-md text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                Get Started
              </button>
            </div>

            <div className="rounded-xl p-8 flex flex-col relative" style={{ backgroundColor: "#354168", border: "1px solid #4a5a82" }}>
              <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-2 whitespace-nowrap" style={{ color: "#4CAF50" }}>Company Professional</p>
              <div className="mb-1">
                <span className="text-4xl font-bold" style={{ color: "#ffffff" }}>£199</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>/month</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>For growing businesses hiring regularly</p>
              <ul className="space-y-3 mb-8 flex-1">
                {["Up to 10 active job listings", "AI candidate matching & scoring", "Candidate pipeline management", "Skills-based shortlisting engine", "Priority email support", "Branded company profile page"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setSignupRole("company"); setShowSignup(true); }}
                className="w-full py-3 rounded-md text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                Get Started
              </button>
            </div>

            <div className="rounded-xl p-8 flex flex-col" style={{ backgroundColor: "#354168", border: "1px solid #4a5a82" }}>
              <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-2 whitespace-nowrap" style={{ color: "#4CAF50" }}>Company Enterprise</p>
              <div className="mb-1">
                <span className="text-4xl font-bold" style={{ color: "#ffffff" }}>Custom</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>For large organisations with high-volume hiring needs</p>
              <ul className="space-y-3 mb-8 flex-1">
                {["Unlimited job listings", "Advanced AI matching algorithms", "Dedicated account manager", "Custom integrations & API access", "Analytics & reporting dashboard", "SLA-backed support"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setLocation("/contact-us?type=company")}
                className="w-full py-3 rounded-md text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28" style={{ backgroundColor: "#1a2035" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#4CAF50" }}>
            Get Started Today
          </p>
          <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-4" style={{ color: "#ffffff" }}>
            Ready to Transform Your Recruitment?
          </h2>
          <p className="text-base mb-10 max-w-lg mx-auto" style={{ color: "#6b7280" }}>
            Join AVANA Recruit and experience the future of intelligent recruitment — powered by AI, built for people.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer hover:opacity-90"
              style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            >
              Sign In
            </button>
            <button
              onClick={() => setShowSignup(true)}
              className="px-8 py-3.5 text-sm font-semibold rounded-md border transition-all cursor-pointer hover:bg-gray-50"
              style={{ borderColor: "#d1d5db", color: "#1a2035", backgroundColor: "#ffffff" }}
            >
              Create Account
              <ChevronRight className="w-4 h-4 ml-1 inline" />
            </button>
          </div>
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

      {showLogin && !loginErrorMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(26, 32, 53, 0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowLogin(false)} />
          <div className="relative w-full max-w-md mx-4 rounded-xl shadow-2xl p-8" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-5 transition-colors text-xl leading-none cursor-pointer"
              style={{ color: "#9ca3af" }}
            >
              &times;
            </button>

            {forgotMode ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a2035" }}>Reset Password</h2>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    {forgotSent ? "Check your email for the reset link" : "Enter your email to receive a password reset link"}
                  </p>
                </div>

                {forgotSent ? (
                  <div className="space-y-5">
                    <div className="rounded-lg p-4 text-center" style={{ backgroundColor: "rgba(76, 175, 80, 0.08)", border: "1px solid rgba(76, 175, 80, 0.2)" }}>
                      <p className="text-sm font-medium" style={{ color: "#4CAF50" }}>
                        If an account with that email exists, we've sent a password reset link. Please check your inbox.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setForgotMode(false); setForgotSent(false); }}
                      className="w-full py-3 rounded-md text-sm font-semibold transition-all cursor-pointer"
                      style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="forgot-email" className="text-sm font-medium" style={{ color: "#1a2035" }}>Email</label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotSending || !forgotEmail}
                      className="w-full py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                    >
                      {forgotSending ? "Sending..." : "Send Reset Link"}
                    </button>

                    <p className="text-center text-xs pt-2" style={{ color: "#6b7280" }}>
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => setForgotMode(false)}
                        className="font-medium cursor-pointer hover:underline"
                        style={{ color: "#4CAF50" }}
                      >
                        Back to Sign In
                      </button>
                    </p>
                  </form>
                )}
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a2035" }}>Welcome Back</h2>
                  <p className="text-sm" style={{ color: "#6b7280" }}>Sign in to your AVANA Recruit account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium" style={{ color: "#1a2035" }}>Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium" style={{ color: "#1a2035" }}>Password</label>
                      <button type="button" onClick={() => { setForgotMode(true); setForgotEmail(email); setForgotSent(false); }} className="text-xs cursor-pointer hover:underline bg-transparent border-none p-0" style={{ color: "#4CAF50" }}>Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb", paddingRight: "2.5rem" }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer" style={{ color: "#6b7280" }} title={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                  >
                    <LogIn className="w-4 h-4 mr-2 inline" />
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>

                  <p className="text-center text-xs pt-2" style={{ color: "#6b7280" }}>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setShowLogin(false); setShowSignup(true); }}
                      className="font-medium cursor-pointer hover:underline"
                      style={{ color: "#4CAF50" }}
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {showSignup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(26, 32, 53, 0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowSignup(false)} />
          <div className="relative w-full max-w-md mx-4 rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
            <button
              onClick={() => setShowSignup(false)}
              className="absolute top-4 right-5 transition-colors text-xl leading-none cursor-pointer"
              style={{ color: "#9ca3af" }}
            >
              &times;
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a2035" }}>Create an account</h2>
              <p className="text-sm" style={{ color: "#6b7280" }}>Choose your account type to get started</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "#1a2035" }}>I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSignupRole("company")}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer"
                    style={{
                      borderColor: signupRole === "company" ? "#4CAF50" : "#e5e7eb",
                      backgroundColor: signupRole === "company" ? "rgba(76, 175, 80, 0.08)" : "#f9fafb",
                      color: signupRole === "company" ? "#4CAF50" : "#6b7280",
                    }}
                  >
                    <Building2 className="w-4 h-4" />
                    Company
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole("candidate")}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer"
                    style={{
                      borderColor: signupRole === "candidate" ? "#4CAF50" : "#e5e7eb",
                      backgroundColor: signupRole === "candidate" ? "rgba(76, 175, 80, 0.08)" : "#f9fafb",
                      color: signupRole === "candidate" ? "#4CAF50" : "#6b7280",
                    }}
                  >
                    <UserCircle className="w-4 h-4" />
                    Candidate
                  </button>
                </div>
              </div>

              {signupRole === "company" && (
                <form onSubmit={handleCompanySignUp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Company Name <span style={{ color: "#ef4444" }}>*</span></label>
                    <Input placeholder="Acme Inc." value={companyForm.name} onChange={(e) => setCompanyForm(f => ({ ...f, name: e.target.value }))} style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                    <Input type="email" placeholder="admin@acme.com" value={companyForm.email} onChange={(e) => setCompanyForm(f => ({ ...f, email: e.target.value }))} style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Password <span style={{ color: "#ef4444" }}>*</span></label>
                    <div className="relative">
                      <Input type={showCompanyPassword ? "text" : "password"} placeholder="Minimum 8 characters" value={companyForm.password} onChange={(e) => setCompanyForm(f => ({ ...f, password: e.target.value }))} style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb", paddingRight: "2.5rem" }} required />
                      <button type="button" onClick={() => setShowCompanyPassword(!showCompanyPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer" style={{ color: "#6b7280" }} title={showCompanyPassword ? "Hide password" : "Show password"}>
                        {showCompanyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Confirm Password <span style={{ color: "#ef4444" }}>*</span></label>
                    <div className="relative">
                      <Input type={showCompanyConfirm ? "text" : "password"} placeholder="Re-enter your password" value={companyForm.confirmPassword} onChange={(e) => setCompanyForm(f => ({ ...f, confirmPassword: e.target.value }))} style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb", paddingRight: "2.5rem" }} required />
                      <button type="button" onClick={() => setShowCompanyConfirm(!showCompanyConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer" style={{ color: "#6b7280" }} title={showCompanyConfirm ? "Hide password" : "Show password"}>
                        {showCompanyConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 rounded-md text-sm font-semibold transition-all cursor-pointer hover:opacity-90" style={{ backgroundColor: "#4CAF50", color: "#fff" }}>
                    <UserPlus className="w-4 h-4 mr-2 inline" />
                    Create Company Account
                  </button>
                </form>
              )}

              {signupRole === "candidate" && (
                <form onSubmit={handleCandidateSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                    <Input placeholder="Jane Doe" value={candidateForm.name} onChange={(e) => setCandidateForm(f => ({ ...f, name: e.target.value }))} style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                    <Input type="email" placeholder="jane@example.com" value={candidateForm.email} onChange={(e) => setCandidateForm(f => ({ ...f, email: e.target.value }))} style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Password <span style={{ color: "#ef4444" }}>*</span></label>
                    <div className="relative">
                      <Input type={showCandidatePassword ? "text" : "password"} placeholder="Minimum 8 characters" value={candidateForm.password} onChange={(e) => setCandidateForm(f => ({ ...f, password: e.target.value }))} style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb", paddingRight: "2.5rem" }} required />
                      <button type="button" onClick={() => setShowCandidatePassword(!showCandidatePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer" style={{ color: "#6b7280" }} title={showCandidatePassword ? "Hide password" : "Show password"}>
                        {showCandidatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "#1a2035" }}>Confirm Password <span style={{ color: "#ef4444" }}>*</span></label>
                    <div className="relative">
                      <Input type={showCandidateConfirm ? "text" : "password"} placeholder="Re-enter your password" value={candidateForm.confirmPassword} onChange={(e) => setCandidateForm(f => ({ ...f, confirmPassword: e.target.value }))} style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb", paddingRight: "2.5rem" }} required />
                      <button type="button" onClick={() => setShowCandidateConfirm(!showCandidateConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer" style={{ color: "#6b7280" }} title={showCandidateConfirm ? "Hide password" : "Show password"}>
                        {showCandidateConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={createCandidate.isPending} className="w-full py-3 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90" style={{ backgroundColor: "#4CAF50", color: "#fff" }}>
                    <UserPlus className="w-4 h-4 mr-2 inline" />
                    {createCandidate.isPending ? "Creating..." : "Create Candidate Account"}
                  </button>
                </form>
              )}

              {!signupRole && (
                <div className="text-center py-6 text-sm rounded-lg border border-dashed" style={{ color: "#6b7280", borderColor: "#d1d5db" }}>
                  Select your account type above to see the signup form.
                </div>
              )}

              <p className="text-center text-xs pt-2" style={{ color: "#6b7280" }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setShowSignup(false); setShowLogin(true); }}
                  className="font-medium cursor-pointer hover:underline"
                  style={{ color: "#4CAF50" }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!loginErrorMsg} onOpenChange={(open) => { if (!open) setLoginErrorMsg(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign In Failed</AlertDialogTitle>
            <AlertDialogDescription>
              {loginErrorMsg}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setLoginErrorMsg(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

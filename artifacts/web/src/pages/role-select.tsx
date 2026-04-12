import { useState } from "react";
import { Building2, UserCircle, LogIn, Sparkles, Target, Users, BarChart3, Shield, ArrowRight, Zap, Globe, Lock } from "lucide-react";
import logoUrl from "@assets/Screenshot_2026-04-11_151121_1775917058507.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole, type UserRole } from "@/contexts/role-context";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

export default function RoleSelect() {
  const { setRole } = useRole();
  const { toast } = useToast();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { setCandidateProfileId, setCompanyProfileId, setUserEmail } = useRole();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    if (!email || !password) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }

    const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
    setIsLoading(true);

    try {
      if (selected === "admin") {
        const res = await fetch(`${basePath}/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          setUserEmail(email);
          setRole("admin");
          setLocation("/");
        } else {
          toast({ title: "Invalid admin credentials", variant: "destructive" });
        }
      } else if (selected === "candidate") {
        const res = await fetch(`${basePath}/candidates/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          setCandidateProfileId(data.candidateId);
          setUserEmail(email);
          setRole("candidate");
          setLocation("/");
        } else {
          const data = await res.json().catch(() => ({}));
          toast({ title: data.error || "Invalid email or password", variant: "destructive" });
        }
      } else if (selected === "company") {
        const res = await fetch(`${basePath}/companies/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          setCompanyProfileId(data.companyId);
          setUserEmail(email);
          setRole("company");
          setLocation("/");
        } else {
          const data = await res.json().catch(() => ({}));
          toast({ title: data.error || "Invalid email or password", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "Login failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Matching",
      description: "Our intelligent engine analyses skills, experience, education and location to find the perfect fit.",
    },
    {
      icon: Target,
      title: "Skills-Based Scoring",
      description: "Detailed scoring breakdowns help you understand exactly how well candidates align with your roles.",
    },
    {
      icon: Users,
      title: "Talent Pipeline",
      description: "Build and manage a smart pipeline of pre-matched candidates ready for your open positions.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Real-time dashboards and reporting to track your recruitment performance at a glance.",
    },
  ];

  const stats = [
    { value: "95%", label: "Match Accuracy" },
    { value: "3x", label: "Faster Hiring" },
    { value: "500+", label: "Skills Tracked" },
    { value: "24/7", label: "AI Processing" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={logoUrl} alt="Avana Talent" className="h-7" />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent text-sm"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </Button>
            <Link href="/signup">
              <Button size="sm" className="text-sm">
                Get Started
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-16">
        <div className="bg-sidebar">
          <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-sidebar-accent/60 rounded-full px-4 py-1.5 mb-6">
                <Zap className="w-3.5 h-3.5 text-sidebar-primary" />
                <span className="text-xs font-medium text-sidebar-foreground/70 tracking-wide uppercase">AI-Powered Recruitment Platform</span>
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-sidebar-foreground leading-[1.1] mb-6">
                Connecting the right talent with the right opportunity.
              </h1>
              <p className="text-lg text-sidebar-foreground/60 leading-relaxed max-w-xl mb-10">
                Avana Talent uses artificial intelligence to match candidates and companies based on skills, experience, education and location — making recruitment smarter and faster.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="text-base px-8"
                  onClick={() => setShowLogin(true)}
                >
                  Sign In
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="text-base px-8 border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-accent">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything you need to hire smarter
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From AI matching to real-time analytics, Avana Talent provides the tools to streamline your entire recruitment process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-sidebar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-sidebar-foreground mb-6">
                Built for companies and candidates alike
              </h2>
              <p className="text-sidebar-foreground/60 mb-8 leading-relaxed">
                Whether you're looking to hire top talent or find your next career move, Avana Talent's AI engine works for both sides of the recruitment equation.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5 text-sidebar-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sidebar-foreground mb-1">For Companies</h4>
                    <p className="text-sm text-sidebar-foreground/60">Post jobs, receive AI-ranked candidate matches, and manage your recruitment pipeline from a single dashboard.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0 mt-0.5">
                    <UserCircle className="w-5 h-5 text-sidebar-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sidebar-foreground mb-1">For Candidates</h4>
                    <p className="text-sm text-sidebar-foreground/60">Create your profile, browse opportunities, and see how well you match against each role with our AI scoring.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-5 h-5 text-sidebar-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sidebar-foreground mb-1">Secure & Private</h4>
                    <p className="text-sm text-sidebar-foreground/60">Your data is protected with enterprise-grade security. We never share your information without consent.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-sidebar-accent/30 rounded-2xl p-8 border border-sidebar-border w-full max-w-md">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-sidebar-foreground">Global Reach</div>
                      <div className="text-xs text-sidebar-foreground/50">Match talent across regions</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Skills Match", value: 92 },
                      { label: "Experience Fit", value: 85 },
                      { label: "Education Score", value: 78 },
                      { label: "Location Match", value: 95 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-sidebar-foreground/70">{item.label}</span>
                          <span className="font-mono font-semibold text-sidebar-foreground">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-sidebar-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sidebar-foreground/50">Overall Score</span>
                      <span className="text-2xl font-bold font-mono text-primary">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join Avana Talent today and experience the future of intelligent recruitment.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="text-base px-8" onClick={() => setShowLogin(true)}>
              Sign In
            </Button>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="text-base px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-sidebar border-t border-sidebar-border py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={logoUrl} alt="Avana Talent" className="h-6" />
            <p className="text-xs text-sidebar-foreground/40">
              © 2026 AVANA Services Limited. Company Number: 15268633
            </p>
          </div>
        </div>
      </footer>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
          <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-md mx-4 p-8">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-xl leading-none cursor-pointer"
            >
              &times;
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to your Avana Talent account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">I am a</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelected("company")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                      selected === "company"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
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
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <UserCircle className="w-4 h-4" />
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected("admin")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                      selected === "admin"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                  <span className="text-xs text-primary cursor-pointer hover:underline">Forgot password?</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!selected || isLoading || !email || !password}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary font-medium cursor-pointer hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

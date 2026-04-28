import { Sparkles, Database, BarChart3, Brain, Zap, ShieldCheck } from "lucide-react";
import logoUrl from "@assets/AVANA_Insights_Logo_1777405980691.png";

interface LandingProps {
  onSignIn: () => void;
}

const NAVY = "#1a2035";
const GREEN = "#4CAF50";

export function Landing({ onSignIn }: LandingProps) {
  const features = [
    { icon: Database, title: "Connect Anything", desc: "Plug in databases, APIs, files and SaaS tools — Insights ingests them all." },
    { icon: Brain, title: "Ask in Plain English", desc: "Pose business questions in natural language and get evidence-backed answers." },
    { icon: BarChart3, title: "Live Dashboards", desc: "Build dashboards in seconds and watch them update as your data flows in." },
    { icon: Zap, title: "Decision Reports", desc: "Generate structured reports for any decision, with risks, options, and confidence." },
    { icon: ShieldCheck, title: "Workspace Isolation", desc: "Every workspace is isolated. Your data never leaves your tenant." },
    { icon: Sparkles, title: "AI Native", desc: "Powered by frontier reasoning models — analysis, drafting and forecasting built in." },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* Top nav — branded navy */}
      <nav
        className="sticky top-0 z-30"
        style={{ backgroundColor: NAVY }}
        data-testid="brand-navbar"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3 shrink-0">
            <img src={logoUrl} alt="AVANA Insights" className="h-8 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="#features"
              className="font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              Features
            </a>
            <a
              href="/services-ai/"
              className="font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              AVANA Services
            </a>
            <a
              href="/"
              className="font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              AVANA Recruit
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="px-5 py-2 text-sm font-semibold rounded-md transition-all"
              style={{ backgroundColor: GREEN, color: "#fff", boxShadow: "0 4px 14px rgba(76,175,80,0.35)" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              data-testid="nav-sign-in"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>
      <span id="top" />


      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#1a2035" }}>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-28 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: "#4CAF50" }}>
              AI-Native Data Intelligence
            </p>
            <h1 className="text-4xl lg:text-[56px] font-bold leading-[1.08] mb-6" style={{ color: "#ffffff" }}>
              Turn your data into <span style={{ color: "#4CAF50" }}>decisions</span>,
              <br />not just <span style={{ color: "#4CAF50" }}>dashboards</span>.
            </h1>
            <p className="text-lg leading-relaxed max-w-xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
              AVANA Insights connects to all your data sources, lets you ask questions in plain English, and produces structured decision reports — backed by evidence and confidence scores.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onSignIn}
                className="px-8 py-3.5 text-sm font-semibold rounded-md hover:opacity-90 transition-all"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                data-testid="hero-sign-in"
              >
                Sign In to Continue
              </button>
              <a
                href="#features"
                className="px-8 py-3.5 text-sm font-semibold rounded-md border transition-all hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: "#4CAF50" }}>
              Capabilities
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: "#1a2035" }}>
              Everything you need to make data-driven decisions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl p-6 border transition-all hover:shadow-md" style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}>
                <div className="w-11 h-11 rounded-md flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(76,175,80,0.12)" }}>
                  <Icon className="w-5 h-5" style={{ color: "#4CAF50" }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "#1a2035" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — branded navy */}
      <footer
        className="relative overflow-hidden"
        style={{ backgroundColor: NAVY, color: "rgba(255,255,255,0.7)" }}
        data-testid="brand-footer"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)` }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            <div className="md:col-span-5">
              <img src={logoUrl} alt="AVANA Insights" className="h-7 w-auto mb-4" />
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                AI-native data intelligence — connect your data, ask in plain English, and turn answers into structured decisions.
              </p>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mt-6" style={{ color: GREEN }}>
                Part of the AVANA Suite
              </p>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
                Product
              </h4>
              <ul className="space-y-3 text-sm">
                <li><FooterLink href="#features">Features</FooterLink></li>
                <li><FooterLink href="#features">Data Sources</FooterLink></li>
                <li><FooterLink href="#features">Decisions</FooterLink></li>
                <li><FooterLink href="#features">Dashboards</FooterLink></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
                AVANA Suite
              </h4>
              <ul className="space-y-3 text-sm">
                <li><FooterLink href="/">AVANA Recruit</FooterLink></li>
                <li><FooterLink href="/services-ai/#onboard">AVANA Onboard</FooterLink></li>
                <li><FooterLink href="/services-ai/#docs">AVANA Docs</FooterLink></li>
                <li><FooterLink href="/insights/">AVANA Insights</FooterLink></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
                Get Started
              </h4>
              <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                Already have an AVANA account? Sign in and your workspace is provisioned automatically.
              </p>
              <button
                onClick={onSignIn}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all"
                style={{ backgroundColor: GREEN, color: "#fff" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                data-testid="footer-sign-in"
              >
                Sign In
              </button>
            </div>
          </div>

          <div
            className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              © {new Date().getFullYear()} AVANA. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs">
              <a href="#" className="transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}
                 onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
                 onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                Privacy
              </a>
              <a href="#" className="transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}
                 onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
                 onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                Terms
              </a>
              <a href="#" className="transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}
                 onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
                 onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="transition-colors"
      style={{ color: "rgba(255,255,255,0.6)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
    >
      {children}
    </a>
  );
}

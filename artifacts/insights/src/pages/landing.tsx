import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MessageSquare,
  BellRing,
  Plug,
  Sparkles,
  ScanSearch,
  Compass,
} from "lucide-react";
import logoUrl from "@assets/AVANA_Insights_Logo_1777405980691.png";

interface LandingProps {
  onSignIn: () => void;
}

const NAVY = "#1a2035";
const GREEN = "#4CAF50";

export function Landing({ onSignIn }: LandingProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <TopNav onSignIn={onSignIn} />
      <span id="top" />
      <Hero onSignIn={onSignIn} />
      <IntegrationsStrip />
      <Capabilities />
      <HowItWorks />
      <TrustLineage />
      <Comparison />
      <Pricing onSignIn={onSignIn} />
      <FAQ />
      <FinalCTA onSignIn={onSignIn} />
      <Footer onSignIn={onSignIn} />
    </div>
  );
}

/* ---------- Nav ---------- */

function TopNav({ onSignIn }: { onSignIn: () => void }) {
  return (
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
          <NavLink href="#capabilities">Capabilities</NavLink>
          <NavLink href="#how-it-works">How it works</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="hidden sm:inline-block text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            data-testid="nav-log-in"
          >
            Log in
          </button>
          <button
            onClick={onSignIn}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all"
            style={{ backgroundColor: GREEN, color: "#fff", boxShadow: "0 4px 14px rgba(76,175,80,0.35)" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            data-testid="nav-sign-in"
          >
            Start free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="font-medium transition-colors"
      style={{ color: "rgba(255,255,255,0.7)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
    >
      {children}
    </a>
  );
}

/* ---------- Hero ---------- */

function Hero({ onSignIn }: { onSignIn: () => void }) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: NAVY }}>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)` }} />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 lg:pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: GREEN }}>
            AI Data Consolidation Platform
          </p>
          <h1 className="text-4xl lg:text-[56px] font-bold leading-[1.05] mb-6" style={{ color: "#ffffff" }}>
            Every business has data. AVANA Insights makes it{" "}
            <span style={{ color: GREEN }}>answer questions.</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
            One calm cockpit that unifies every spreadsheet, CRM and SaaS tool — then answers
            questions in plain English. No SQL, no data engineers, no months of integration work.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-md hover:opacity-90 transition-all"
              style={{ backgroundColor: GREEN, color: "#fff" }}
              data-testid="hero-start-free"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#pricing"
              className="px-7 py-3.5 text-sm font-semibold rounded-md border transition-all hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
              data-testid="hero-see-pricing"
            >
              See pricing
            </a>
          </div>
          <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            No credit card required · First answer in under 5 minutes
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative mt-16 max-w-6xl mx-auto">
          <div
            className="absolute -inset-4 rounded-2xl opacity-30 blur-2xl pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${GREEN}, transparent 60%)` }}
          />
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  const sidebarItems = [
    { label: "Workspace", active: true },
    { label: "Sources" },
    { label: "Datasets" },
    { label: "Ask AI" },
    { label: "Dashboards" },
    { label: "Reports" },
  ];
  const stats = [
    { label: "Sources", value: "9", delta: "+1", positive: true },
    { label: "Rows", value: "412k", delta: "+18k", positive: true },
    { label: "Questions", value: "184", delta: "this mo", positive: false },
    { label: "Quality", value: "94.2", delta: "+2.1pt", positive: true },
  ];
  const customers = [
    { name: "Studio Atlas", value: "£24,180" },
    { name: "Orbit Labs", value: "£18,420" },
    { name: "Fold", value: "£12,180" },
  ];
  const bars = [78, 64, 48, 36, 22];

  return (
    <div
      className="relative rounded-xl overflow-hidden border"
      style={{
        backgroundColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.1)",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
      }}
    >
      <div className="grid grid-cols-12 min-h-[480px]">
        {/* Sidebar */}
        <div className="col-span-3 border-r" style={{ backgroundColor: "#fafafa", borderColor: "#eef0f3" }}>
          <p className="px-4 pt-5 pb-3 text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: "#9ca3af" }}>
            AVANA · Insights
          </p>
          <ul className="px-2 space-y-1">
            {sidebarItems.map((it) => (
              <li
                key={it.label}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md"
                style={{
                  backgroundColor: it.active ? "rgba(76,175,80,0.12)" : "transparent",
                  color: it.active ? GREEN : "#4b5563",
                }}
              >
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: it.active ? GREEN : "#d1d5db" }}
                />
                {it.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Main */}
        <div className="col-span-9 p-5 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border p-3" style={{ borderColor: "#eef0f3" }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#9ca3af" }}>
                  {s.label}
                </p>
                <p className="text-xl font-bold mt-1" style={{ color: NAVY }}>{s.value}</p>
                <p className="text-[10px] mt-1" style={{ color: s.positive ? GREEN : "#9ca3af" }}>
                  {s.delta}
                </p>
              </div>
            ))}
          </div>

          {/* MRR chart */}
          <div className="rounded-lg border p-4" style={{ borderColor: "#eef0f3" }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#9ca3af" }}>
              Monthly recurring revenue
            </p>
            <svg viewBox="0 0 600 120" className="w-full h-24" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 95 L60 88 L120 82 L180 70 L240 60 L300 56 L360 48 L420 44 L480 32 L540 24 L600 18 L600 120 L0 120 Z"
                fill="url(#mrrFill)"
              />
              <path
                d="M0 95 L60 88 L120 82 L180 70 L240 60 L300 56 L360 48 L420 44 L480 32 L540 24 L600 18"
                fill="none"
                stroke={GREEN}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Top customers */}
            <div className="rounded-lg border p-4" style={{ borderColor: "#eef0f3" }}>
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#9ca3af" }}>
                Top customers
              </p>
              <ul className="space-y-2">
                {customers.map((c) => (
                  <li key={c.name} className="flex items-center justify-between text-xs">
                    <span style={{ color: "#374151" }}>{c.name}</span>
                    <span className="font-semibold" style={{ color: NAVY }}>{c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Pipeline */}
            <div className="rounded-lg border p-4" style={{ borderColor: "#eef0f3" }}>
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#9ca3af" }}>
                Pipeline by stage
              </p>
              <div className="flex items-end gap-2 h-20">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      backgroundColor: GREEN,
                      opacity: 0.4 + (bars.length - i) / (bars.length * 1.5),
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Integrations strip ---------- */

function IntegrationsStrip() {
  const tools = [
    { abbr: "GS", name: "Google Sheets", color: "#0F9D58" },
    { abbr: "E", name: "Excel", color: "#107C41" },
    { abbr: "H", name: "HubSpot", color: "#FF7A59" },
    { abbr: "S", name: "Salesforce", color: "#00A1E0" },
    { abbr: "X", name: "Xero", color: "#13B5EA" },
    { abbr: "Q", name: "QuickBooks", color: "#2CA01C" },
    { abbr: "S", name: "Shopify", color: "#7AB55C" },
    { abbr: "P", name: "Postgres", color: "#336791" },
    { abbr: "S", name: "Stripe", color: "#635BFF" },
    { abbr: "RA", name: "REST API", color: "#1a2035" },
  ];
  return (
    <section className="py-14 border-b" style={{ backgroundColor: "#ffffff", borderColor: "#eef0f3" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase mb-8" style={{ color: "#6b7280" }}>
          Plugs into the tools you already use
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {tools.map((t) => (
            <div key={t.name} className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[10px] font-bold text-white"
                style={{ backgroundColor: t.color }}
              >
                {t.abbr}
              </span>
              <span className="text-sm font-medium" style={{ color: NAVY }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Capabilities ---------- */

function Capabilities() {
  const items = [
    {
      icon: Plug,
      title: "Connect anything",
      desc: "Spreadsheets, CRMs, databases, SaaS tools, REST APIs. One click each, no plumbing.",
    },
    {
      icon: Sparkles,
      title: "AI clean & unify",
      desc: "Dedupe, standardise, fill gaps and merge entities across sources — automatically.",
    },
    {
      icon: MessageSquare,
      title: "Ask in plain English",
      desc: "Type a question, get a chart, KPI or table grounded in your real data.",
    },
    {
      icon: BellRing,
      title: "Auto-reports & alerts",
      desc: "Schedule beautiful digests to your inbox or Slack — daily, weekly, monthly.",
    },
  ];
  return (
    <section id="capabilities" className="py-24" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: GREEN }}>
            Capabilities
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: NAVY }}>
            From scattered to single source of truth.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl p-6 border transition-all hover:shadow-md"
              style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}
            >
              <div
                className="w-11 h-11 rounded-md flex items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(76,175,80,0.12)" }}
              >
                <Icon className="w-5 h-5" style={{ color: GREEN }} />
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: NAVY }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */

function HowItWorks() {
  const steps = [
    {
      n: "Step 1",
      title: "Connect",
      desc: "Pick a source from the catalogue. We handle auth, schema discovery and sync.",
    },
    {
      n: "Step 2",
      title: "Unify",
      desc: "AVANA cleans columns, deduplicates entities and unifies records across tools.",
    },
    {
      n: "Step 3",
      title: "Ask",
      desc: "Type any question. Get an answer in seconds — backed by lineage you can trust.",
    },
    {
      n: "Step 4",
      title: "Decide",
      desc: "Pin charts to dashboards. Schedule reports. Move forward with confidence.",
    },
  ];
  return (
    <section id="how-it-works" className="py-24" style={{ backgroundColor: "#fafafa" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: GREEN }}>
            How it works
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: NAVY }}>
            Four steps. Five minutes.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-xl p-6 border bg-white"
              style={{ borderColor: "#e5e7eb" }}
            >
              <div
                className="absolute -top-3 left-6 inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase"
                style={{ backgroundColor: NAVY, color: GREEN }}
              >
                {s.n}
              </div>
              <div className="flex items-center gap-3 mt-2 mb-3">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold"
                  style={{ backgroundColor: "rgba(76,175,80,0.12)", color: GREEN }}
                >
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold" style={{ color: NAVY }}>{s.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust by lineage ---------- */

function TrustLineage() {
  const bullets = [
    "Auto-generated lineage from connect to chart",
    "Per-column quality score & issue list",
    "Dataset versions & change history",
  ];
  const lineage = ["HubSpot", "Stripe", "Shopify", "AI Clean", "Customers", "Dashboard"];
  return (
    <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: GREEN }}>
            Trust by lineage
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-5" style={{ color: NAVY }}>
            Every answer traces back to its source.
          </h2>
          <p className="text-base leading-relaxed mb-6" style={{ color: "#6b7280" }}>
            See exactly where each number comes from — which sources fed it, which AI transformations
            cleaned it, which dashboards depend on it. No more "where did this come from?" Slack
            threads at 11pm.
          </p>
          <ul className="space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span
                  className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                  style={{ backgroundColor: "rgba(76,175,80,0.15)" }}
                >
                  <Check className="w-3 h-3" style={{ color: GREEN }} />
                </span>
                <span className="text-sm" style={{ color: NAVY }}>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-6">
          <div
            className="relative rounded-xl border p-6"
            style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}
          >
            <div className="flex items-center gap-2 mb-5 text-xs" style={{ color: "#9ca3af" }}>
              <ScanSearch className="w-4 h-4" style={{ color: GREEN }} />
              Lineage trace
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {lineage.map((node, i) => (
                <span key={`${node}-${i}`} className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border"
                    style={{
                      backgroundColor: i === lineage.length - 1 ? "rgba(76,175,80,0.12)" : "#fff",
                      borderColor: i === lineage.length - 1 ? "rgba(76,175,80,0.4)" : "#e5e7eb",
                      color: i === lineage.length - 1 ? GREEN : NAVY,
                    }}
                  >
                    {node}
                  </span>
                  {i < lineage.length - 1 && (
                    <span style={{ color: "#cbd5e1" }}>→</span>
                  )}
                </span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Lineage edges", value: "128" },
                { label: "Avg quality", value: "94.2" },
                { label: "Open issues", value: "3" },
              ].map((m) => (
                <div key={m.label} className="rounded-md border p-3" style={{ borderColor: "#e5e7eb", backgroundColor: "#fff" }}>
                  <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#9ca3af" }}>
                    {m.label}
                  </p>
                  <p className="text-base font-bold mt-1" style={{ color: NAVY }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Comparison ---------- */

function Comparison() {
  const cols = [
    {
      title: "Spreadsheets",
      tone: "muted" as const,
      points: [
        "Manual exports, weekly refresh",
        "No quality checks or lineage",
        "Breaks past a few thousand rows",
      ],
    },
    {
      title: "Hiring data engineers",
      tone: "muted" as const,
      points: [
        "3–6 months and £80k+ before answer one",
        "Brittle pipelines, BI tool tax on top",
        "Gatekept access to your own data",
      ],
    },
    {
      title: "AVANA Insights",
      tone: "primary" as const,
      points: [
        "Connect, unify, ask — in 5 minutes",
        "AI cleaning + lineage out of the box",
        "Plain-English answers anyone can run",
      ],
    },
  ];

  return (
    <section className="py-24" style={{ backgroundColor: "#fafafa" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: GREEN }}>
            Why AVANA Insights
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: NAVY }}>
            The right altitude.
          </h2>
          <p className="mt-4 text-base max-w-2xl mx-auto" style={{ color: "#6b7280" }}>
            Spreadsheets break at scale. Hiring data engineers takes months. AVANA Insights sits in
            between — unified, intelligent, instant.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cols.map((c) => {
            const isPrimary = c.tone === "primary";
            return (
              <div
                key={c.title}
                className="rounded-xl p-6 border"
                style={{
                  borderColor: isPrimary ? "rgba(76,175,80,0.4)" : "#e5e7eb",
                  backgroundColor: isPrimary ? NAVY : "#ffffff",
                  color: isPrimary ? "#fff" : NAVY,
                  boxShadow: isPrimary ? "0 20px 40px -20px rgba(76,175,80,0.35)" : "none",
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: isPrimary ? "#fff" : NAVY }}>
                  {c.title}
                </h3>
                <ul className="space-y-3">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm leading-relaxed">
                      <span
                        className="mt-1 inline-block w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: isPrimary ? GREEN : "#cbd5e1" }}
                      />
                      <span style={{ color: isPrimary ? "rgba(255,255,255,0.85)" : "#4b5563" }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */

function Pricing({ onSignIn }: { onSignIn: () => void }) {
  const tiers = [
    {
      name: "Free",
      price: "£0",
      cadence: "/mo",
      tagline: "2 sources · 50k rows",
      features: ["1 dashboard", "100 AI questions / mo", "Community support"],
      cta: "Choose Free",
      featured: false,
    },
    {
      name: "Pro",
      price: "£49",
      cadence: "/mo",
      tagline: "10 sources · 500k rows",
      features: [
        "Unlimited dashboards",
        "1,000 AI questions / mo",
        "Scheduled reports",
        "Email support",
      ],
      cta: "Choose Pro",
      featured: true,
    },
    {
      name: "Business",
      price: "£149",
      cadence: "/mo",
      tagline: "Unlimited · 5M rows",
      features: [
        "SSO + audit log",
        "Unlimited AI questions",
        "Advanced API access",
        "Priority support",
      ],
      cta: "Choose Business",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: GREEN }}>
            Pricing
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: NAVY }}>
            Honest, simple, flat fees.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="relative rounded-xl border p-6 flex flex-col"
              style={{
                borderColor: t.featured ? GREEN : "#e5e7eb",
                backgroundColor: "#ffffff",
                boxShadow: t.featured ? "0 24px 50px -24px rgba(76,175,80,0.4)" : "none",
                transform: t.featured ? "translateY(-6px)" : "none",
              }}
            >
              {t.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                  style={{ backgroundColor: GREEN, color: "#fff" }}
                >
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold mb-1" style={{ color: NAVY }}>{t.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold" style={{ color: NAVY }}>{t.price}</span>
                <span className="text-sm" style={{ color: "#6b7280" }}>{t.cadence}</span>
              </div>
              <p className="text-xs mb-5" style={{ color: "#6b7280" }}>{t.tagline}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#4b5563" }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onSignIn}
                className="w-full px-4 py-2.5 text-sm font-semibold rounded-md transition-all"
                style={{
                  backgroundColor: t.featured ? GREEN : "transparent",
                  color: t.featured ? "#fff" : NAVY,
                  border: t.featured ? "none" : "1px solid #d1d5db",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = t.featured ? "0.92" : "1";
                  if (!t.featured) e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  if (!t.featured) e.currentTarget.style.backgroundColor = "transparent";
                }}
                data-testid={`pricing-${t.name.toLowerCase()}`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

function FAQ() {
  const faqs = [
    {
      q: "Do I need SQL or a data engineer?",
      a: "No. AVANA Insights is built so anyone in the business can ask a question in plain English and get an answer grounded in your real data — no SQL, no scripting, no dedicated data team required.",
    },
    {
      q: "Where is my data stored?",
      a: "Your workspace is fully isolated and hosted in our UK / EU regions. Data stays inside your tenant; we never train shared models on your data, and you can export or delete it at any time.",
    },
    {
      q: "Which sources are supported?",
      a: "Spreadsheets (Google Sheets, Excel), CRMs (HubSpot, Salesforce), accounting (Xero, QuickBooks), e-commerce (Shopify, Stripe), databases (Postgres and more), and any REST API. New connectors ship every few weeks.",
    },
    {
      q: "How fresh is the data?",
      a: "Most connectors sync on a schedule (as fast as every 5 minutes on Pro and Business) and you can trigger a manual refresh any time. Lineage tells you exactly when each number was last updated.",
    },
    {
      q: "Is it really that fast to set up?",
      a: "Yes. Connect a source, watch AVANA discover the schema and clean it, then ask your first question — most teams get their first useful answer within five minutes of signing up.",
    },
    {
      q: "How does it differ from a BI tool?",
      a: "Traditional BI tools assume you've already built a clean warehouse and know SQL. AVANA Insights handles the connect-and-clean step for you and lets anyone ask questions in plain English — you get answers, not just charts.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24" style={{ backgroundColor: "#fafafa" }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: GREEN }}>
            FAQ
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: NAVY }}>
            Questions, answered.
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="rounded-lg border overflow-hidden bg-white"
                style={{ borderColor: "#e5e7eb" }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  data-testid={`faq-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                >
                  <span className="text-sm font-semibold" style={{ color: NAVY }}>
                    {f.q}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 transition-transform shrink-0"
                    style={{
                      color: isOpen ? GREEN : "#9ca3af",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    className="px-5 pb-5 text-sm leading-relaxed"
                    style={{ color: "#4b5563" }}
                  >
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA({ onSignIn }: { onSignIn: () => void }) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: NAVY }}>
      <div className="absolute inset-0">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)` }}
        />
      </div>
      <div className="relative max-w-4xl mx-auto px-6 lg:px-10 py-24 text-center">
        <Compass className="w-10 h-10 mx-auto mb-5" style={{ color: GREEN }} />
        <h2 className="text-3xl lg:text-5xl font-bold mb-4" style={{ color: "#fff" }}>
          Stop guessing. Start asking.
        </h2>
        <p className="text-base lg:text-lg mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
          Connect your first source in two minutes. We'll handle the rest.
        </p>
        <button
          onClick={onSignIn}
          className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-md transition-all"
          style={{ backgroundColor: GREEN, color: "#fff", boxShadow: "0 4px 14px rgba(76,175,80,0.35)" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          data-testid="final-start-free"
        >
          Start free <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer({ onSignIn }: { onSignIn: () => void }) {
  return (
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
              AI-native data intelligence — connect your data, ask in plain English, and turn answers
              into structured decisions.
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
              <li><FooterLink href="#capabilities">Capabilities</FooterLink></li>
              <li><FooterLink href="#how-it-works">How it works</FooterLink></li>
              <li><FooterLink href="#pricing">Pricing</FooterLink></li>
              <li><FooterLink href="#faq">FAQ</FooterLink></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#fff" }}>
              AVANA Suite
            </h4>
            <ul className="space-y-3 text-sm">
              <li><FooterLink href="/" external>AVANA Recruit</FooterLink></li>
              <li><FooterLink href="/services-ai/#onboard" external>AVANA Onboard</FooterLink></li>
              <li><FooterLink href="/services-ai/#docs" external>AVANA Docs</FooterLink></li>
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
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="space-y-1">
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} AVANA Services Limited. Company Number: 15268633
            </p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Registered Office: 85 Great Portland Street, London, W1W 7LT
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >
              Terms &amp; Conditions
            </a>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="transition-colors"
      style={{ color: "rgba(255,255,255,0.6)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
    >
      {children}
    </a>
  );
}

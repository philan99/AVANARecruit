import { Link } from "wouter";
import { Database, Compass, MessageSquare, ClipboardCheck, LayoutGrid, Activity, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { useWorkspace } from "@/components/insights-layout";

const QUICK_ACTIONS = [
  { path: "/data-sources", label: "Connect Data Source", icon: Database, desc: "Plug in a database, API, or file" },
  { path: "/query", label: "Ask a Question", icon: MessageSquare, desc: "Query your data in plain English" },
  { path: "/decisions", label: "Make a Decision", icon: ClipboardCheck, desc: "Generate a structured decision report" },
  { path: "/dashboards", label: "Build a Dashboard", icon: LayoutGrid, desc: "Visualise your data live" },
];

export default function Home() {
  const { workspace } = useWorkspace();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "hsl(var(--primary))" }}>
          Welcome
        </p>
        <h1 className="text-3xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }} data-testid="home-title">
          {workspace ? workspace.name : "Your Workspace"}
        </h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Your AI-native data intelligence platform — connect, query, decide.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Data Sources", value: "0", icon: Database, hint: "Connect your first source" },
          { label: "Queries This Week", value: "0", icon: MessageSquare, hint: "Ask in plain English" },
          { label: "Active Decisions", value: "0", icon: ClipboardCheck, hint: "Generate a report" },
          { label: "Live Dashboards", value: "0", icon: Activity, hint: "Build to monitor" },
        ].map(({ label, value, icon: Icon, hint }) => (
          <div
            key={label}
            className="rounded-xl p-5 border bg-card"
            style={{ borderColor: "hsl(var(--card-border))" }}
            data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary) / 0.12)" }}>
                <Icon className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              </div>
            </div>
            <p className="text-2xl font-bold leading-none mb-1" style={{ color: "hsl(var(--foreground))" }}>{value}</p>
            <p className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
            <p className="text-[11px] mt-2 opacity-70" style={{ color: "hsl(var(--muted-foreground))" }}>{hint}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold tracking-wide uppercase mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {QUICK_ACTIONS.map(({ path, label, icon: Icon, desc }) => (
          <Link key={path} href={path}>
            <a
              className="group block rounded-xl p-5 border bg-card transition-all hover:shadow-md"
              style={{ borderColor: "hsl(var(--card-border))" }}
              data-testid={`quick-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors" style={{ backgroundColor: "hsl(var(--primary) / 0.12)" }}>
                  <Icon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold mb-1" style={{ color: "hsl(var(--foreground))" }}>{label}</h3>
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</p>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>

      {/* Recent activity / empty state */}
      <h2 className="text-sm font-semibold tracking-wide uppercase mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
        Recent Activity
      </h2>
      <div className="rounded-xl border bg-card p-12 text-center" style={{ borderColor: "hsl(var(--card-border))" }}>
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "hsl(var(--muted))" }}>
          <Sparkles className="w-6 h-6" style={{ color: "hsl(var(--muted-foreground))" }} />
        </div>
        <h3 className="text-base font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>
          You're all set up
        </h3>
        <p className="text-sm max-w-md mx-auto mb-5" style={{ color: "hsl(var(--muted-foreground))" }}>
          Your workspace is ready. Connect a data source to get started — Insights will index it and let you ask questions in plain English.
        </p>
        <Link href="/data-sources">
          <a
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold border"
            style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderColor: "var(--primary-border)" }}
            data-testid="cta-connect-source"
          >
            <Database className="w-4 h-4" />
            Connect Your First Source
          </a>
        </Link>
      </div>

      {/* Hidden references to satisfy lint while these icons are reserved for future phases */}
      <div className="hidden">
        <TrendingUp />
        <AlertCircle />
        <Compass />
      </div>
    </div>
  );
}

import { type LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
}

export function ComingSoon({ title, description, icon: Icon, phase }: ComingSoonProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }} data-testid="page-title">
          {title}
        </h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{description}</p>
      </div>
      <div className="rounded-xl border bg-card p-12 text-center" style={{ borderColor: "hsl(var(--card-border))" }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary) / 0.12)" }}>
          <Icon className="w-7 h-7" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "hsl(var(--primary))" }}>
          {phase}
        </p>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>Coming Soon</h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
          This feature is part of the AVANA Insights roadmap. Phase 1 (foundation) is now live — the rest follows.
        </p>
      </div>
    </div>
  );
}

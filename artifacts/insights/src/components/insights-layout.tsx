import { type ReactNode, useEffect, useState, createContext, useContext } from "react";
import { InsightsSidebar } from "./insights-sidebar";
import { useRole } from "@/contexts/role-context";

interface Workspace {
  id: number;
  name: string;
  ownerEmail: string;
  billingTier: string;
  createdAt: string;
}

interface BootstrapState {
  loading: boolean;
  workspace: Workspace | null;
  role: "owner" | "member" | null;
  error: string | null;
}

const WorkspaceContext = createContext<BootstrapState>({
  loading: true,
  workspace: null,
  role: null,
  error: null,
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function InsightsLayout({ children }: { children: ReactNode }) {
  const { sessionToken, clearRole } = useRole();
  const [state, setState] = useState<BootstrapState>({ loading: true, workspace: null, role: null, error: null });

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!sessionToken) {
        setState({ loading: false, workspace: null, role: null, error: "Not signed in" });
        return;
      }
      try {
        const apiBase = "/api";
        const res = await fetch(`${apiBase}/insights/bootstrap`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionToken }),
        });
        if (cancelled) return;
        if (res.status === 401) {
          clearRole();
          return;
        }
        if (!res.ok) {
          setState({ loading: false, workspace: null, role: null, error: "Failed to load workspace" });
          return;
        }
        const data = await res.json();
        setState({
          loading: false,
          workspace: data.workspace,
          role: data.role,
          error: null,
        });
      } catch {
        if (!cancelled) setState({ loading: false, workspace: null, role: null, error: "Network error" });
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, [sessionToken, clearRole]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "hsl(var(--primary))", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (state.error || !state.workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>Couldn't load workspace</h2>
          <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>{state.error || "Please sign in again."}</p>
          <button
            onClick={() => clearRole()}
            className="px-5 py-2.5 rounded-md text-sm font-semibold"
            style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={state}>
      <div className="flex min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
        <InsightsSidebar workspaceName={state.workspace.name} />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </WorkspaceContext.Provider>
  );
}

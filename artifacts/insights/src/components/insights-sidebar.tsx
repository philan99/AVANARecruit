import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Database,
  Compass,
  MessageSquare,
  ClipboardCheck,
  LayoutGrid,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import logoUrl from "@assets/AVANA_Insights_Logo_1777405980691.png";
import { useRole } from "@/contexts/role-context";

const NAV = [
  { path: "/", label: "Home", icon: Home },
  { path: "/data-sources", label: "Data Sources", icon: Database },
  { path: "/explorer", label: "Data Explorer", icon: Compass },
  { path: "/query", label: "Ask Questions", icon: MessageSquare },
  { path: "/decisions", label: "Decisions", icon: ClipboardCheck },
  { path: "/dashboards", label: "Dashboards", icon: LayoutGrid },
];

interface InsightsSidebarProps {
  workspaceName?: string;
}

export function InsightsSidebar({ workspaceName }: InsightsSidebarProps) {
  const [location] = useLocation();
  const { userEmail, clearRole, sessionToken, setSessionToken } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  const apiBase = "/api";

  async function handleLogout() {
    if (sessionToken) {
      try {
        await fetch(`${apiBase}/sessions/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionToken }),
          keepalive: true,
        });
      } catch {
        // best effort
      }
    }
    setSessionToken(null);
    clearRole();
  }

  function isActive(path: string) {
    if (path === "/") return location === "/" || location === "";
    return location === path || location.startsWith(path + "/");
  }

  return (
    <aside
      className="flex flex-col border-r transition-[width] duration-200"
      style={{
        width: collapsed ? 72 : 248,
        backgroundColor: "hsl(var(--sidebar))",
        color: "hsl(var(--sidebar-foreground))",
        borderColor: "hsl(var(--sidebar-border))",
        minHeight: "100vh",
      }}
      data-testid="insights-sidebar"
    >
      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoUrl} alt="AVANA Insights" className="h-7 w-auto shrink-0" />
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-testid="sidebar-toggle"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace label */}
      {!collapsed && workspaceName && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <p className="text-[10px] font-semibold tracking-widest uppercase opacity-50">Workspace</p>
          <p className="text-sm font-semibold truncate mt-0.5" data-testid="workspace-name">{workspaceName}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link key={path} href={path}>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? "hsl(var(--sidebar-primary))" : "transparent",
                  color: active ? "hsl(var(--sidebar-primary-foreground))" : "hsl(var(--sidebar-foreground))",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "hsl(var(--sidebar-accent))"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
                title={collapsed ? label : undefined}
                data-testid={`nav-${path === "/" ? "home" : path.slice(1)}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Footer: settings + user */}
      <div className="px-2 py-3 border-t space-y-0.5" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <Link href="/settings">
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: isActive("/settings") ? "hsl(var(--sidebar-primary))" : "transparent",
              color: isActive("/settings") ? "hsl(var(--sidebar-primary-foreground))" : "hsl(var(--sidebar-foreground))",
            }}
            onMouseEnter={(e) => { if (!isActive("/settings")) e.currentTarget.style.backgroundColor = "hsl(var(--sidebar-accent))"; }}
            onMouseLeave={(e) => { if (!isActive("/settings")) e.currentTarget.style.backgroundColor = "transparent"; }}
            title={collapsed ? "Settings" : undefined}
            data-testid="nav-settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </a>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10"
          style={{ color: "hsl(var(--sidebar-foreground))" }}
          title={collapsed ? "Sign out" : undefined}
          data-testid="nav-logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!collapsed && userEmail && (
          <p className="text-[11px] truncate px-3 pt-2 opacity-60" data-testid="user-email">{userEmail}</p>
        )}
      </div>
    </aside>
  );
}

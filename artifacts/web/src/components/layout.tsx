import { Link, useLocation } from "wouter";
import logoUrl from "@assets/Screenshot_2026-04-11_151121_1775917058507.png";
import { useState } from "react";
import { 
  Briefcase, 
  Users, 
  Network, 
  LayoutDashboard,
  Settings,
  TerminalSquare,
  UserCircle,
  Target,
  Search,
  LogOut,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/role-context";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { role, clearRole } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const companyNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/matches", label: "Matches", icon: Network },
    { href: "/company-profile", label: "Company Profile", icon: Settings },
  ];

  const candidateNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "My Profile", icon: UserCircle },
    { href: "/my-matches", label: "My Matches", icon: Target },
    { href: "/browse-jobs", label: "Browse Jobs", icon: Search },
  ];

  const adminNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Users },
  ];

  const navItems = role === "admin" ? adminNavItems : role === "candidate" ? candidateNavItems : companyNavItems;

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <header className="border-b border-sidebar-border bg-sidebar sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center">
            <img src={logoUrl} alt="Avana Talent" className="h-7" />
          </div>

          <nav className={cn("hidden md:flex items-center gap-1", role === "admin" && "md:hidden")}>
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-mono">
              {role === "admin" ? "Admin Console" : role === "candidate" ? "Candidate Portal" : "Company Portal"}
            </span>
            <button
              onClick={clearRole}
              className="hidden sm:flex items-center px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn("md:hidden p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent rounded-md transition-colors", role === "admin" && "hidden")}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sidebar-border px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-sidebar-border mt-2">
              <button
                onClick={clearRole}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

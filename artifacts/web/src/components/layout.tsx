import { Link, useLocation } from "wouter";
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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/role-context";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { role, clearRole } = useRole();

  const companyNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/matches", label: "Matches", icon: Network },
  ];

  const candidateNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "My Profile", icon: UserCircle },
    { href: "/my-matches", label: "My Matches", icon: Target },
    { href: "/browse-jobs", label: "Browse Jobs", icon: Search },
  ];

  const navItems = role === "candidate" ? candidateNavItems : companyNavItems;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <TerminalSquare className="w-6 h-6 text-sidebar-primary mr-2" />
          <span className="font-mono font-bold text-lg tracking-tight text-sidebar-foreground">
            AVANA <span className="text-sidebar-primary">TALENT</span>
          </span>
        </div>

        <div className="px-4 py-3 border-b border-sidebar-border">
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-mono">
            {role === "candidate" ? "Candidate Portal" : "Company Portal"}
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
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
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={clearRole}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
          <div className="mt-4 px-3 flex items-center">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary font-bold text-xs">
              {role === "candidate" ? "CA" : "CO"}
            </div>
            <div className="ml-3 flex flex-col">
              <span className="text-xs font-medium text-sidebar-foreground">
                {role === "candidate" ? "Candidate" : "Hiring Manager"}
              </span>
              <span className="text-[10px] text-sidebar-foreground/60">
                {role === "candidate" ? "Job Seeker" : "Company Admin"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center">
            <TerminalSquare className="w-5 h-5 text-primary mr-2" />
            <span className="font-mono font-bold text-base tracking-tight text-foreground">
              AVANA <span className="text-primary">TALENT</span>
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

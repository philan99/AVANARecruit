import { Link, useLocation } from "wouter";
import logoUrl from "@assets/AVANA_Recruit_1776280304155.png";
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
  KanbanSquare,
  Code2,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/role-context";
import { ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, navigate] = useLocation();
  const { role, clearRole, userEmail, isImpersonating, exitImpersonation } = useRole();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const companyNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/matches", label: "Matches", icon: Network },
    { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
    { href: "/company-profile", label: "Company Profile", icon: Settings },
    { href: "/contact-us", label: "Contact Us", icon: Mail },
  ];

  const candidateNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "My Profile", icon: UserCircle },
    { href: "/my-matches", label: "My Matches", icon: Target },
    { href: "/browse-jobs", label: "Browse Jobs", icon: Search },
    { href: "/browse-companies", label: "Browse Companies", icon: Building2 },
    { href: "/contact-us", label: "Contact Us", icon: Mail },
  ];

  const adminNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/development", label: "Development", icon: Code2 },
  ];

  const navItems = role === "admin" ? adminNavItems : role === "candidate" ? candidateNavItems : companyNavItems;

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <header className="border-b border-sidebar-border bg-sidebar sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 h-14 px-4 sm:px-6">
          <Link href="/" className="flex items-center cursor-pointer shrink-0">
            <img src={logoUrl} alt="AVANA Recruit" className="h-7" />
          </Link>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden xl:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-mono">
                {role === "admin" ? "Admin Console" : role === "candidate" ? "Candidate Portal" : "Company Portal"}
              </span>
              {userEmail && (
                <span className="text-[10px] text-sidebar-foreground/40 truncate max-w-[180px]">
                  {userEmail}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowSignOutDialog(true)}
              className="hidden lg:flex items-center px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-sidebar-border px-4 py-3 space-y-1">
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
                onClick={() => { setMobileMenuOpen(false); setShowSignOutDialog(true); }}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {isImpersonating && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-medium">Admin View:</span>
            <span>You are viewing the platform as {userEmail}</span>
          </div>
          <button
            onClick={() => { exitImpersonation(); navigate("/"); }}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            Return to Admin Console
          </button>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        {children}
      </main>

      <footer className="border-t border-sidebar-border bg-sidebar">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 px-6 py-4">
          <img src={logoUrl} alt="AVANA Recruit" className="h-5" />
          <div className="flex items-center gap-3">
            <Link href="/terms" className="text-[11px] text-sidebar-foreground/30 hover:text-sidebar-foreground/50 transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-[11px] text-sidebar-foreground/15">|</span>
            <Link href="/privacy-policy" className="text-[11px] text-sidebar-foreground/30 hover:text-sidebar-foreground/50 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[11px] text-sidebar-foreground/15">|</span>
            <p className="text-[11px] text-sidebar-foreground/30">
              © 2026 AVANA Services Limited. Company Number: 15268633
            </p>
          </div>
        </div>
      </footer>
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearRole}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

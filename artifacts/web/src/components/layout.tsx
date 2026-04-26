import { Link, useLocation } from "wouter";
import logoUrl from "@assets/Full_Logo_-_GREEN_1776492081935.png";
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
  Lightbulb,
  ChevronDown,
  UsersRound,
  Bell,
  Microscope,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/role-context";
import { PostcodeMissingBanner } from "@/components/postcode-missing-banner";
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
    { href: "/matches", label: "Matches", icon: Network },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  ];

  const candidateNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-matches", label: "My Matches", icon: Target },
    { href: "/browse-jobs", label: "Browse Jobs", icon: Search },
    { href: "/browse-companies", label: "Browse Companies", icon: Building2 },
  ];

  const adminNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Users },
  ];

  const adminPortalMenuItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/match-diagnostic", label: "Match Diagnostic", icon: Microscope },
    { href: "/development", label: "Development", icon: Code2 },
  ];

  const navItems = role === "admin" ? adminNavItems : role === "candidate" ? candidateNavItems : companyNavItems;

  const portalLabel = role === "admin" ? "Admin Console" : role === "candidate" ? "Candidate Portal" : "Company Portal";
  const settingsItem =
    role === "company" || role === "candidate"
      ? { href: "/my-settings", label: "My Settings", icon: Settings }
      : null;

  const teamItem =
    role === "company"
      ? { href: "/team", label: "Team Members", icon: UsersRound }
      : null;

  const jobAlertsItem =
    role === "candidate"
      ? { href: "/job-alerts", label: "Job Alerts", icon: Bell }
      : role === "company"
      ? { href: "/candidate-alerts", label: "Candidate Alerts", icon: Bell }
      : null;

  const profileItem =
    role === "company"
      ? { href: "/company-profile", label: "Company Profile", icon: Building2 }
      : role === "candidate"
      ? { href: "/profile", label: "My Profile", icon: UserCircle }
      : null;

  const supportItem =
    role === "company" || role === "candidate"
      ? { href: "/contact-us", label: "Get Support", icon: Mail }
      : null;

  const featureRequestItem =
    role === "company" || role === "candidate"
      ? { href: "/feature-request", label: "Feature Request", icon: Lightbulb }
      : null;

  const portalMenuExtras = role === "admin" ? adminPortalMenuItems : [];

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <header className="border-b border-sidebar-border bg-sidebar sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 h-14 px-4 sm:px-6">
          <Link href="/" className="flex items-center cursor-pointer shrink-0">
            <img src={logoUrl} alt="AVANA Recruit" className="h-7" />
          </Link>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 xl:gap-3 2xl:gap-6 min-w-0">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 xl:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
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

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/faq"
              title="Frequently asked questions"
              aria-label="Open FAQ"
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 font-mono leading-tight">
                      {portalLabel}
                    </span>
                    {userEmail && (
                      <span className="text-[10px] text-sidebar-foreground/45 truncate max-w-[180px] leading-tight">
                        {userEmail}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                      {portalLabel}
                    </span>
                    {userEmail && (
                      <span className="text-xs text-foreground truncate">{userEmail}</span>
                    )}
                  </div>
                </DropdownMenuLabel>
                {(settingsItem || profileItem || jobAlertsItem || supportItem || featureRequestItem || portalMenuExtras.length > 0) && <DropdownMenuSeparator />}
                {settingsItem && (
                  <DropdownMenuItem asChild>
                    <Link href={settingsItem.href} className="flex items-center cursor-pointer">
                      <settingsItem.icon className="w-4 h-4 mr-2" />
                      {settingsItem.label}
                    </Link>
                  </DropdownMenuItem>
                )}
                {profileItem && (
                  <DropdownMenuItem asChild>
                    <Link href={profileItem.href} className="flex items-center cursor-pointer">
                      <profileItem.icon className="w-4 h-4 mr-2" />
                      {profileItem.label}
                    </Link>
                  </DropdownMenuItem>
                )}
                {teamItem && (
                  <DropdownMenuItem asChild>
                    <Link href={teamItem.href} className="flex items-center cursor-pointer" data-testid="link-team-members">
                      <teamItem.icon className="w-4 h-4 mr-2" />
                      {teamItem.label}
                    </Link>
                  </DropdownMenuItem>
                )}
                {jobAlertsItem && (
                  <DropdownMenuItem asChild>
                    <Link href={jobAlertsItem.href} className="flex items-center cursor-pointer" data-testid="link-job-alerts">
                      <jobAlertsItem.icon className="w-4 h-4 mr-2" />
                      {jobAlertsItem.label}
                    </Link>
                  </DropdownMenuItem>
                )}
                {(profileItem || teamItem || jobAlertsItem) && supportItem && <DropdownMenuSeparator />}
                {supportItem && (
                  <DropdownMenuItem asChild>
                    <Link href={supportItem.href} className="flex items-center cursor-pointer">
                      <supportItem.icon className="w-4 h-4 mr-2" />
                      {supportItem.label}
                    </Link>
                  </DropdownMenuItem>
                )}
                {featureRequestItem && (
                  <DropdownMenuItem asChild>
                    <Link href={featureRequestItem.href} className="flex items-center cursor-pointer">
                      <featureRequestItem.icon className="w-4 h-4 mr-2" />
                      {featureRequestItem.label}
                    </Link>
                  </DropdownMenuItem>
                )}
                {portalMenuExtras.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center cursor-pointer">
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowSignOutDialog(true)}
                  className="cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
            <div className="pt-2 border-t border-sidebar-border mt-2 space-y-1">
              <div className="px-3 pb-1 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-mono">{portalLabel}</p>
                  {userEmail && (
                    <p className="text-[11px] text-sidebar-foreground/40 truncate">{userEmail}</p>
                  )}
                </div>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  title="Frequently asked questions"
                  aria-label="Open FAQ"
                  className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </Link>
              </div>
              {settingsItem && (
                <Link
                  href={settingsItem.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                  <settingsItem.icon className="w-4 h-4 mr-3" />
                  {settingsItem.label}
                </Link>
              )}
              {profileItem && (
                <Link
                  href={profileItem.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                  <profileItem.icon className="w-4 h-4 mr-3" />
                  {profileItem.label}
                </Link>
              )}
              {teamItem && (
                <Link
                  href={teamItem.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                  <teamItem.icon className="w-4 h-4 mr-3" />
                  {teamItem.label}
                </Link>
              )}
              {supportItem && (
                <Link
                  href={supportItem.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                  <supportItem.icon className="w-4 h-4 mr-3" />
                  {supportItem.label}
                </Link>
              )}
              {featureRequestItem && (
                <Link
                  href={featureRequestItem.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                  <featureRequestItem.icon className="w-4 h-4 mr-3" />
                  {featureRequestItem.label}
                </Link>
              )}
              {portalMenuExtras.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground/70 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              ))}
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
        <PostcodeMissingBanner />
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

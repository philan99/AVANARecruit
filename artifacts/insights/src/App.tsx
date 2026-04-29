import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Database, Compass, MessageSquare, ClipboardCheck, LayoutGrid } from "lucide-react";
import { RoleProvider, useRole } from "@/contexts/role-context";
import { InactivityWarning } from "@/components/inactivity-warning";
import { LoginModal } from "@/components/login-modal";
import { InsightsLayout } from "@/components/insights-layout";
import { Landing } from "@/pages/landing";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import { ComingSoon } from "@/pages/coming-soon";
import Terms from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy-policy";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
  },
});

function AuthedRoutes() {
  return (
    <InsightsLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/data-sources">
          <ComingSoon
            title="Data Sources"
            description="Connect databases, APIs, files, and SaaS tools to power your insights."
            icon={Database}
            phase="Phase 2"
          />
        </Route>
        <Route path="/explorer">
          <ComingSoon
            title="Data Explorer"
            description="Browse your indexed datasets, inspect rows, and preview schemas."
            icon={Compass}
            phase="Phase 3"
          />
        </Route>
        <Route path="/query">
          <ComingSoon
            title="Ask Questions"
            description="Pose natural-language questions and get evidence-backed answers."
            icon={MessageSquare}
            phase="Phase 4"
          />
        </Route>
        <Route path="/decisions">
          <ComingSoon
            title="Decisions"
            description="Generate structured decision reports with options, risks, and confidence."
            icon={ClipboardCheck}
            phase="Phase 5"
          />
        </Route>
        <Route path="/dashboards">
          <ComingSoon
            title="Dashboards"
            description="Build live dashboards from your data sources and queries."
            icon={LayoutGrid}
            phase="Phase 6"
          />
        </Route>
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </InsightsLayout>
  );
}

function AppRouter() {
  const { role } = useRole();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <Switch>
      <Route path="/terms" component={Terms} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route>
        {!role ? (
          <>
            <Landing onSignIn={() => setShowLogin(true)} />
            <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
          </>
        ) : (
          <AuthedRoutes />
        )}
      </Route>
    </Switch>
  );
}

function App() {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <WouterRouter base={baseUrl}>
          <AppRouter />
        </WouterRouter>
        <InactivityWarning />
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;

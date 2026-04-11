import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { RoleProvider, useRole } from "@/contexts/role-context";

import RoleSelect from "@/pages/role-select";
import SignUp from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import CandidateDashboard from "@/pages/candidate-dashboard";
import CandidateProfile from "@/pages/candidate-profile";
import CandidateMatches from "@/pages/candidate-matches";
import BrowseJobs from "@/pages/browse-jobs";
import JobsList from "@/pages/jobs/list";
import JobDetail from "@/pages/jobs/detail";
import CandidatesList from "@/pages/candidates/list";
import CandidateDetail from "@/pages/candidates/detail";
import MatchesList from "@/pages/matches/list";
import CompanyProfile from "@/pages/company-profile";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCompanies from "@/pages/admin-companies";
import AdminCandidates from "@/pages/admin-candidates";
import AdminJobs from "@/pages/admin-jobs";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function CompanyRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/jobs" component={JobsList} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/candidates" component={CandidatesList} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/matches" component={MatchesList} />
        <Route path="/company-profile" component={CompanyProfile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function CandidateRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={CandidateDashboard} />
        <Route path="/profile" component={CandidateProfile} />
        <Route path="/my-matches" component={CandidateMatches} />
        <Route path="/browse-jobs" component={BrowseJobs} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AdminRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={AdminDashboard} />
        <Route path="/companies" component={AdminCompanies} />
        <Route path="/candidates" component={AdminCandidates} />
        <Route path="/jobs" component={AdminJobs} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppRouter() {
  const { role } = useRole();

  if (!role) {
    return (
      <Switch>
        <Route path="/signup" component={SignUp} />
        <Route component={RoleSelect} />
      </Switch>
    );
  }

  if (role === "admin") {
    return <AdminRoutes />;
  }

  if (role === "candidate") {
    return <CandidateRoutes />;
  }

  return <CompanyRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

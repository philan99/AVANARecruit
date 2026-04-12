import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { RoleProvider, useRole } from "@/contexts/role-context";

import RoleSelect from "@/pages/role-select";
import ContactUs from "@/pages/contact-us";
import Dashboard from "@/pages/dashboard";
import CandidateDashboard from "@/pages/candidate-dashboard";
import CandidateProfile from "@/pages/candidate-profile";
import CandidateMatches from "@/pages/candidate-matches";
import BrowseJobs from "@/pages/browse-jobs";
import CandidateJobDetail from "@/pages/candidate-job-detail";
import JobsList from "@/pages/jobs/list";
import CreateJob from "@/pages/jobs/create";
import EditJob from "@/pages/jobs/edit";
import JobDetail from "@/pages/jobs/detail";
import CandidatesList from "@/pages/candidates/list";
import CandidateDetail from "@/pages/candidates/detail";
import MatchesList from "@/pages/matches/list";
import CompanyProfile from "@/pages/company-profile";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCompanies from "@/pages/admin-companies";
import AdminCandidates from "@/pages/admin-candidates";
import AdminJobs from "@/pages/admin-jobs";
import AdminCompanyDetail from "@/pages/admin-company-detail";
import AdminJobDetail from "@/pages/admin-job-detail";
import AdminCandidateDetail from "@/pages/admin-candidate-detail";
import AdminSettings from "@/pages/admin-settings";
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
        <Route path="/jobs/new" component={CreateJob} />
        <Route path="/jobs/:id/edit" component={EditJob} />
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
        <Route path="/jobs/:id" component={CandidateJobDetail} />
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
        <Route path="/companies/:id" component={AdminCompanyDetail} />
        <Route path="/companies" component={AdminCompanies} />
        <Route path="/candidates/:id" component={AdminCandidateDetail} />
        <Route path="/candidates" component={AdminCandidates} />
        <Route path="/jobs/:id" component={AdminJobDetail} />
        <Route path="/jobs" component={AdminJobs} />
        <Route path="/settings" component={AdminSettings} />
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
        <Route path="/contact-us" component={ContactUs} />
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

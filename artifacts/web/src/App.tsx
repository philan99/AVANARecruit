import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { RoleProvider, useRole } from "@/contexts/role-context";
import { Chatbot } from "@/components/chatbot";
import { InactivityWarning } from "@/components/inactivity-warning";

import RoleSelect from "@/pages/role-select";
import ContactUs from "@/pages/contact-us";
import Dashboard from "@/pages/dashboard";
import CandidateDashboard from "@/pages/candidate-dashboard";
import CandidateJobAlerts from "@/pages/candidate-job-alerts";
import CandidateProfile from "@/pages/candidate-profile";
import CandidateMatches from "@/pages/candidate-matches";
import CandidateShortlisted from "@/pages/candidate-shortlisted";
import CandidateVerifications from "@/pages/candidate-verifications";
import CompanyCandidateVerifications from "@/pages/company-candidate-verifications";
import BrowseJobs from "@/pages/browse-jobs";
import BrowseCompanies from "@/pages/browse-companies";
import BrowseCompanyDetail from "@/pages/browse-company-detail";
import CandidateJobDetail from "@/pages/candidate-job-detail";
import JobsList from "@/pages/jobs/list";
import CreateJob from "@/pages/jobs/create";
import EditJob from "@/pages/jobs/edit";
import JobDetail from "@/pages/jobs/detail";
import CandidatesList from "@/pages/candidates/list";
import CandidateDetail from "@/pages/candidates/detail";
import MatchesList from "@/pages/matches/list";
import Pipeline from "@/pages/pipeline";
import CompanyProfile from "@/pages/company-profile";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCompanies from "@/pages/admin-companies";
import AdminCandidates from "@/pages/admin-candidates";
import AdminMatchDiagnostic from "@/pages/admin-match-diagnostic";
import DemoMatches from "@/pages/demo-matches";
import AdminJobs from "@/pages/admin-jobs";
import AdminCompanyDetail from "@/pages/admin-company-detail";
import AdminJobDetail from "@/pages/admin-job-detail";
import AdminJobMatches from "@/pages/admin-job-matches";
import AdminMatches from "@/pages/admin-matches";
import AdminCandidateDetail from "@/pages/admin-candidate-detail";
import AdminCandidateMatches from "@/pages/admin-candidate-matches";
import AdminSettings from "@/pages/admin-settings";
import AdminDevelopment from "@/pages/admin-development";
import VerifyPage from "@/pages/verify";
import Terms from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy-policy";
import HowItWorks from "@/pages/how-it-works";
import ResetPassword from "@/pages/reset-password";
import VerifyEmailPage from "@/pages/verify-email";
import PortalContactUs from "@/pages/portal-contact-us";
import PortalFAQ from "@/pages/portal-faq";
import FeatureRequest from "@/pages/feature-request";
import MySettings from "@/pages/my-settings";
import TeamMembers from "@/pages/team-members";
import CompanyCandidateAlerts from "@/pages/company-candidate-alerts";
import AcceptInvite from "@/pages/accept-invite";
import Onboarding from "@/pages/onboarding";
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
        <Route path="/candidates/:id/verifications" component={CompanyCandidateVerifications} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/matches" component={MatchesList} />
        <Route path="/pipeline" component={Pipeline} />
        <Route path="/company-profile" component={CompanyProfile} />
        <Route path="/my-settings" component={MySettings} />
        <Route path="/team" component={TeamMembers} />
        <Route path="/candidate-alerts" component={CompanyCandidateAlerts} />
        <Route path="/contact-us" component={PortalContactUs} />
        <Route path="/faq" component={PortalFAQ} />
        <Route path="/feature-request" component={FeatureRequest} />
        <Route path="/verify/:token" component={VerifyPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function CandidateRoutes() {
  return (
    <Switch>
      <Route path="/onboarding" component={Onboarding} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={CandidateDashboard} />
        <Route path="/profile" component={CandidateProfile} />
        <Route path="/my-matches" component={CandidateMatches} />
        <Route path="/demo-matches/:id" component={DemoMatches} />
        <Route path="/shortlisted" component={CandidateShortlisted} />
        <Route path="/verifications" component={CandidateVerifications} />
        <Route path="/browse-jobs" component={BrowseJobs} />
        <Route path="/browse-companies/:id" component={BrowseCompanyDetail} />
        <Route path="/browse-companies" component={BrowseCompanies} />
        <Route path="/jobs/:id" component={CandidateJobDetail} />
        <Route path="/my-settings" component={MySettings} />
        <Route path="/job-alerts" component={CandidateJobAlerts} />
        <Route path="/contact-us" component={PortalContactUs} />
        <Route path="/faq" component={PortalFAQ} />
        <Route path="/feature-request" component={FeatureRequest} />
        <Route path="/verify/:token" component={VerifyPage} />
        <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function AdminRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={AdminDashboard} />
        <Route path="/companies/:id" component={AdminCompanyDetail} />
        <Route path="/companies" component={AdminCompanies} />
        <Route path="/demo-matches/:id" component={DemoMatches} />
        <Route path="/candidates/:id/matches" component={AdminCandidateMatches} />
        <Route path="/candidates/:id" component={AdminCandidateDetail} />
        <Route path="/candidates" component={AdminCandidates} />
        <Route path="/jobs/:id/matches" component={AdminJobMatches} />
        <Route path="/jobs/:id" component={AdminJobDetail} />
        <Route path="/jobs" component={AdminJobs} />
        <Route path="/matches" component={AdminMatches} />
        <Route path="/match-diagnostic" component={AdminMatchDiagnostic} />
        <Route path="/settings" component={AdminSettings} />
        <Route path="/development" component={AdminDevelopment} />
        <Route path="/verify/:token" component={VerifyPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppRouter() {
  const { role } = useRole();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isAcceptInvite = pathname.endsWith("/accept-invite");
  const isPublicAuthPath =
    pathname.endsWith("/verify-email") ||
    pathname.includes("/verify/") ||
    pathname.endsWith("/reset-password");

  if (isAcceptInvite) {
    return (
      <Switch>
        <Route path="/accept-invite" component={AcceptInvite} />
      </Switch>
    );
  }

  if (isPublicAuthPath) {
    return (
      <Switch>
        <Route path="/verify/:token" component={VerifyPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        <Route path="/reset-password" component={ResetPassword} />
      </Switch>
    );
  }

  if (!role) {
    return (
      <Switch>
        <Route path="/verify/:token" component={VerifyPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/contact-us" component={ContactUs} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
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
          <InactivityWarning />
          <Chatbot />
          <Toaster />
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

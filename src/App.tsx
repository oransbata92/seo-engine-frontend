import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Analyses from "@/pages/analyses";
import AnalysisReport from "@/pages/analysis-report";
import Reputation from "@/pages/reputation";
import ContentPage from "@/pages/content";
import BacklinksPage from "@/pages/backlinks";
import RevenuePage from "@/pages/revenue";
import ProspectPage from "@/pages/prospect";
import AuditPage from "@/pages/audit";
import IntelligencePage from "@/pages/intelligence";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/analyses" component={Analyses} />
        <Route path="/analysis/:id" component={AnalysisReport} />
        <Route path="/reputation" component={Reputation} />
        <Route path="/content" component={ContentPage} />
        <Route path="/backlinks" component={BacklinksPage} />
        <Route path="/revenue" component={RevenuePage} />
        <Route path="/prospect" component={ProspectPage} />
        <Route path="/audit" component={AuditPage} />
        <Route path="/intelligence" component={IntelligencePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

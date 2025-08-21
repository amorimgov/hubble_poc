import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Catalog from "@/pages/catalog";
import Dashboard from "@/pages/dashboard";
import DataContracts from "@/pages/data-contracts";
import Lineage from "@/pages/lineage";
import Documentation from "@/pages/documentation";
import History from "@/pages/history";
import Approvals from "@/pages/approvals";
import Favorites from "@/pages/favorites";
import ProductDetail from "@/pages/product-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Catalog} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/data-contracts" component={DataContracts} />
      <Route path="/lineage" component={Lineage} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/history" component={History} />
      <Route path="/approvals" component={Approvals} />
      <Route path="/favorites" component={Favorites} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

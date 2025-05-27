import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CariHesaplar from "@/pages/CariHesaplar";
import Teklifler from "@/pages/Teklifler";
import Projeler from "@/pages/Projeler";
import Gorevler from "@/pages/Gorevler";
import Raporlar from "@/pages/Raporlar";
import Ayarlar from "@/pages/Ayarlar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/cari-hesaplar" component={CariHesaplar} />
        <Route path="/teklifler" component={Teklifler} />
        <Route path="/projeler" component={Projeler} />
        <Route path="/gorevler" component={Gorevler} />
        <Route path="/raporlar" component={Raporlar} />
        <Route path="/ayarlar" component={Ayarlar} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
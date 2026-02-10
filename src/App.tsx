import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CompromissosProvider } from "@/contexts/CompromissosContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CalendarioPage from "@/pages/CalendarioPage";
import DiaPage from "@/pages/DiaPage";
import NovoCompromissoPage from "@/pages/NovoCompromissoPage";
import HistoricoPage from "@/pages/HistoricoPage";
import EstatisticasPage from "@/pages/EstatisticasPage";
import ConfiguracoesPage from "@/pages/ConfiguracoesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CompromissosProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendario" element={<CalendarioPage />} />
              <Route path="/dia/:data" element={<DiaPage />} />
              <Route path="/novo" element={<NovoCompromissoPage />} />
              <Route path="/historico" element={<HistoricoPage />} />
              <Route path="/estatisticas" element={<EstatisticasPage />} />
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </CompromissosProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

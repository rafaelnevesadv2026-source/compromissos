import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CompromissosProvider } from "@/contexts/CompromissosContext";
import { AgendaProvider } from "@/contexts/AgendaContext";
import AppLayout from "@/components/AppLayout";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import CalendarioPage from "@/pages/CalendarioPage";
import DiaPage from "@/pages/DiaPage";
import NovoCompromissoPage from "@/pages/NovoCompromissoPage";
import HistoricoPage from "@/pages/HistoricoPage";
import EstatisticasPage from "@/pages/EstatisticasPage";
import ConfiguracoesPage from "@/pages/ConfiguracoesPage";
import FocoPage from "@/pages/FocoPage";
import AgendasPage from "@/pages/AgendasPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse">
          <h1 className="font-display text-xl font-bold text-gradient-primary">MEUS COMPROMISSOS</h1>
          <p className="text-xs text-muted-foreground mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AgendaProvider>
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
            <Route path="/agendas" element={<AgendasPage />} />
            <Route path="/foco/:id" element={<FocoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </CompromissosProvider>
    </AgendaProvider>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

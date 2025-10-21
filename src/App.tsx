import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Telemetria from "./pages/Telemetria";
import DataQuality from "./pages/DataQuality";
import Manutencao from "./pages/Manutencao";
import ApiDocs from "./pages/ApiDocs";
import Marketplace from "./pages/Marketplace";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/telemetria" element={<Telemetria />} />
          <Route path="/data-quality" element={<DataQuality />} />
          <Route path="/manutencao" element={<Manutencao />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/financeiro" element={<Financeiro />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

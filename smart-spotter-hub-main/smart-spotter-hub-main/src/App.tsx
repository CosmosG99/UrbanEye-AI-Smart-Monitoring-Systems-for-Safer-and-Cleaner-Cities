import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import { DetectionProvider } from "@/context/DetectionContext";
import LandingPage from "./pages/LandingPage";
import DashboardOverview from "./pages/DashboardOverview";
import LiveMonitoring from "./pages/LiveMonitoring";
import PredictionDashboard from "./pages/PredictionDashboard";
import SmartMap from "./pages/SmartMap";
import AlertsPage from "./pages/AlertsPage";
import SafetyMonitoring from "./pages/SafetyMonitoring";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminPanel from "./pages/AdminPanel";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SafetyReport from "./pages/SafetyReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DetectionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardWrapper><DashboardOverview /></DashboardWrapper>} />
            <Route path="/monitoring" element={<DashboardWrapper><LiveMonitoring /></DashboardWrapper>} />
            <Route path="/predictions" element={<DashboardWrapper><PredictionDashboard /></DashboardWrapper>} />
            <Route path="/map" element={<DashboardWrapper><SmartMap /></DashboardWrapper>} />
            <Route path="/alerts" element={<DashboardWrapper><AlertsPage /></DashboardWrapper>} />
            <Route path="/safety" element={<DashboardWrapper><SafetyMonitoring /></DashboardWrapper>} />
            <Route path="/safety-report" element={<DashboardWrapper><SafetyReport /></DashboardWrapper>} />
            <Route path="/analytics" element={<DashboardWrapper><AnalyticsDashboard /></DashboardWrapper>} />
            <Route path="/admin" element={<DashboardWrapper><AdminPanel /></DashboardWrapper>} />
            <Route path="/about" element={<DashboardWrapper><AboutPage /></DashboardWrapper>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DetectionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

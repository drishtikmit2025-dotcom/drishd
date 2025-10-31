import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EntrepreneurDashboard from "./pages/entrepreneur/Dashboard";
import SubmitIdea from "./pages/entrepreneur/SubmitIdea";
import MySubmissions from "./pages/entrepreneur/Submissions";
import EntrepreneurNotifications from "./pages/entrepreneur/Notifications";
import EntrepreneurSettings from "./pages/entrepreneur/Settings";
import InvestorDashboard from "./pages/investor/Dashboard";
import ExploreIdeas from "./pages/investor/ExploreIdeas";
import InvestorNotifications from "./pages/investor/Notifications";
import InvestorSettings from "./pages/investor/Settings";
import InvestorConnect from "./pages/investor/Connect";
import EntrepreneurConnect from "./pages/entrepreneur/Connect";
import NotFound from "./pages/NotFound";
import IdeaResult from "./pages/entrepreneur/IdeaResult";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Entrepreneur Routes */}
          <Route path="/entrepreneur" element={<EntrepreneurDashboard />} />
          <Route path="/entrepreneur/submit" element={<SubmitIdea />} />
          <Route path="/entrepreneur/idea/:id/result" element={<IdeaResult />} />
          <Route path="/entrepreneur/submissions" element={<MySubmissions />} />
          <Route path="/entrepreneur/notifications" element={<EntrepreneurNotifications />} />
          <Route path="/entrepreneur/settings" element={<EntrepreneurSettings />} />
          <Route path="/entrepreneur/connect" element={<EntrepreneurConnect />} />

          {/* Investor Routes */}
          <Route path="/investor" element={<InvestorDashboard />} />
          <Route path="/investor/explore" element={<ExploreIdeas />} />
          <Route path="/investor/notifications" element={<InvestorNotifications />} />
          <Route path="/investor/settings" element={<InvestorSettings />} />
          <Route path="/investor/connect" element={<InvestorConnect />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

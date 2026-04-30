import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Dashboard from "./pages/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import StartWithAI from "./pages/StartWithAI";
import ProviderSubscription from "./pages/ProviderSubscription";
import ProviderBilling from "./pages/ProviderBilling";
import ProviderUsage from "./pages/ProviderUsage";
import ProviderPublicPage from "./pages/ProviderPublicPage";
import Pricing from "./pages/Pricing";
import AiChatbot from "@/components/AiChatbot";
import AdminDashboard from "./pages/AdminDashboard";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/services" element={<Services />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/:id" element={<ProviderPublicPage />} />
            <Route path="/provider-dashboard/subscription" element={<ProviderSubscription />} />
            <Route path="/provider-dashboard/billing" element={<ProviderBilling />} />
            <Route path="/provider-dashboard/usage" element={<ProviderUsage />} />
            <Route path="/provider-dashboard/upgrade-plan" element={<Pricing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/start-with-ai" element={<StartWithAI />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
            <AiChatbot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

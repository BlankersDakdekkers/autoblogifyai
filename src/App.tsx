import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import SimpleHeader from "@/components/SimpleHeader";
import { AppSidebar } from "@/components/app-sidebar";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import SalesPage from "./pages/SalesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AutoBlogProducer from "./pages/AutoBlogProducer";
import AIWebsiteGenerator from "./pages/AIWebsiteGenerator";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import AnalyticsPage from "./pages/AnalyticsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import NotificationSystem from "./pages/NotificationSystem";
import MediaPortal from "./pages/MediaPortal";
import HelpSupport from "./pages/HelpSupport";
import AchievementsPage from "./pages/AchievementsPage";
import CoursePage from "./pages/CoursePage";
import AffiliatePage from "./pages/AffiliatePage";
import PricingPage from "./pages/PricingPage";
import ContentFeatures from "./pages/ContentFeatures";
import CategoryManager from "./pages/CategoryManager";
import TemplateEditor from "./pages/TemplateEditor";
import WebhookIntegration from "./pages/WebhookIntegration";
import CSVProcessor from "./pages/CSVProcessor";
import KnowledgeBase from "./pages/KnowledgeBase";
import BlogManagement from "./pages/BlogManagement";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminCustomerPortal from "./pages/AdminCustomerPortal";
import SystemMonitoringPage from "./pages/SystemMonitoringPage";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import ProjectsOverview from "./pages/ProjectsOverview";
import ResourceCenter from "./pages/ResourceCenter";
import CustomerCases from "./pages/CustomerCases";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import AdvancedAIFeatures from "./pages/AdvancedAIFeatures";
import AdminResourceManager from "./pages/AdminResourceManager";
import CMSIntegrations from "./pages/CMSIntegrations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (!isDashboard) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
            <h1 className="ml-4 font-semibold">AutoblogifyAI Dashboard</h1>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  // URGENT DEBUG TEST
  console.error("🚨 URGENT DEBUG: App component rendering NOW! Time:", Date.now());
  console.error("🚨 Current URL:", window.location.href);
  console.error("🚨 Current pathname:", window.location.pathname);
  
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter 
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AuthProvider>
              <Routes>
                {/* EXTREME NOODTEST ZONDER DASHBOARD PREFIX */}
                <Route 
                  path="/test123" 
                  element={
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'green',
                      color: 'white',
                      fontSize: '5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      zIndex: 99999
                    }}>
                      ✅ ROUTER WERKT! ✅<br/>
                      TEST123 ROUTE SUCCESVOL!
                    </div>
                  } 
                />
                
                {/* PROBEER NOG EENS MET DASHBOARD */}
                <Route 
                  path="/dashboard/cms-integration" 
                  element={
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'red',
                      color: 'white',
                      fontSize: '4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      zIndex: 99999
                    }}>
                      🆘 DASHBOARD ROUTE WERKT! 🆘<br/>
                      CMS INTEGRATION GEVONDEN!
                    </div>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
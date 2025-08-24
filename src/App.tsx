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

const App = () => (
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
              <Route path="/" element={<><SimpleHeader /><Index /></>} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/sales" element={<><SimpleHeader /><SalesPage /></>} />
              <Route path="/pricing" element={<><SimpleHeader /><PricingPage /></>} />
              <Route path="/customer-cases" element={<><SimpleHeader /><CustomerCases /></>} />
              <Route path="/about" element={<><SimpleHeader /><AboutPage /></>} />
              <Route path="/contact" element={<><SimpleHeader /><ContactPage /></>} />
              <Route path="/terms" element={<><SimpleHeader /><TermsOfService /></>} />
              <Route path="/privacy" element={<><SimpleHeader /><PrivacyPolicy /></>} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              
              {/* Dashboard routes */}
              <Route path="/dashboard/keywords" element={<ProtectedRoute><Layout><AutoBlogProducer /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/blogs" element={<ProtectedRoute><Layout><BlogManagement /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/websites" element={<ProtectedRoute><Layout><WebsiteBuilder /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/deployment" element={<ProtectedRoute><Layout><WebsiteBuilder /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/academy" element={<ProtectedRoute><Layout><CoursePage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/pricing" element={<ProtectedRoute><Layout><PricingPage /></Layout></ProtectedRoute>} />
              
              {/* Standalone pages */}
              <Route path="/dashboard/generate" element={<ProtectedRoute><Layout><AutoBlogProducer /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/ai-generator" element={<ProtectedRoute><Layout><AIWebsiteGenerator /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/website-builder" element={<ProtectedRoute><Layout><WebsiteBuilder /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/integrations" element={<ProtectedRoute><Layout><IntegrationsPage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><Layout><NotificationSystem /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/media" element={<ProtectedRoute><Layout><MediaPortal /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/help" element={<ProtectedRoute><Layout><HelpSupport /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/achievements" element={<ProtectedRoute><Layout><AchievementsPage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/course" element={<ProtectedRoute><Layout><CoursePage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/affiliate" element={<ProtectedRoute><Layout><AffiliatePage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/content-features" element={<ProtectedRoute><Layout><ContentFeatures /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/category-manager" element={<ProtectedRoute><Layout><CategoryManager /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/template-editor" element={<ProtectedRoute><Layout><TemplateEditor /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/webhooks" element={<ProtectedRoute><Layout><WebhookIntegration /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/csv-processor" element={<ProtectedRoute><Layout><CSVProcessor /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/knowledge-base" element={<ProtectedRoute><Layout><KnowledgeBase /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/projects" element={<ProtectedRoute><Layout><ProjectsOverview /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/resources" element={<ProtectedRoute><Layout><ResourceCenter /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/advanced-ai" element={<ProtectedRoute><Layout><AdvancedAIFeatures /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/admin/users" element={<ProtectedRoute requiredRole="admin"><Layout><AdminUsersPage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/admin/customers" element={<ProtectedRoute requiredRole="admin"><Layout><AdminCustomerPortal /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/admin/monitoring" element={<ProtectedRoute requiredRole="admin"><Layout><SystemMonitoringPage /></Layout></ProtectedRoute>} />
              <Route path="/dashboard/admin/resources" element={<ProtectedRoute requiredRole="admin"><Layout><AdminResourceManager /></Layout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;
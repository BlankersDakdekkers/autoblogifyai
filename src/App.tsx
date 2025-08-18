import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import AffiliatePage from "./pages/AffiliatePage";
import AIWebsiteGenerator from "./pages/AIWebsiteGenerator";
import AutoBlogProducerWithTabs from "./pages/AutoBlogProducerWithTabs";
import CoursePage from "./pages/CoursePage";
import NotFound from "./pages/NotFound";
import MediaPortal from "./pages/MediaPortal";
import SalesPage from "./pages/SalesPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotificationSystem from "./pages/NotificationSystem";
import HelpSupport from "./pages/HelpSupport";
import AchievementsPage from "./pages/AchievementsPage";
import ContentFeatures from "./pages/ContentFeatures";

const queryClient = new QueryClient();

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
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="ml-4" />
            <div className="ml-4">
              <h1 className="font-semibold">AutoblogifyAI Dashboard</h1>
            </div>
          </header>
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="websites" element={<WebsiteBuilder />} />
                    <Route path="deployment" element={<WebsiteBuilder />} />
                    <Route path="ai-generator" element={<AIWebsiteGenerator />} />
                    <Route path="integrations" element={<IntegrationsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="achievements" element={<AchievementsPage />} />
                    <Route path="content-features" element={<ContentFeatures />} />
                    <Route path="notifications" element={<NotificationSystem />} />
                    <Route path="help" element={<HelpSupport />} />
                    <Route path="keywords" element={<AutoBlogProducerWithTabs initialTab="keywords" />} />
                    <Route path="voice" element={<AutoBlogProducerWithTabs initialTab="voice" />} />
                    <Route path="autoblog" element={<AutoBlogProducerWithTabs />} />
                    <Route path="media" element={<MediaPortal />} />
                    <Route path="affiliate" element={<AffiliatePage />} />
                    <Route path="academy" element={<CoursePage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

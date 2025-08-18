import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
import NotFound from "./pages/NotFound";

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
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

// Simple header component for non-dashboard pages
const SimpleHeader = () => (
  <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 items-center justify-between">
      <div className="font-bold">AutoblogifyAI</div>
      <LanguageSwitcher />
    </div>
  </header>
);

const App = () => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<><SimpleHeader /><Index /></>} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/sales" element={<><SimpleHeader /><SalesPage /></>} />
              <Route path="/pricing" element={<><SimpleHeader /><PricingPage /></>} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;
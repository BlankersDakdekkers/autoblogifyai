import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { OptimizedLayout } from "@/components/OptimizedLayout";

// Lazy load pages for better performance
import { lazy, Suspense } from "react";
import { LoadingFallback } from "@/components/LoadingFallback";

// Critical pages (loaded immediately)
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import PricingPage from "./pages/PricingPage";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const HelpSupport = lazy(() => import("./pages/HelpSupport"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProductionAutoBlogProducer = lazy(() => import("./pages/ProductionAutoBlogProducer"));
const ProductionWebsiteBuilder = lazy(() => import("./pages/ProductionWebsiteBuilder"));
const AIWebsiteGenerator = lazy(() => import("./pages/AIWebsiteGenerator"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const MediaPortal = lazy(() => import("./pages/MediaPortal"));
const ResourceCenter = lazy(() => import("./pages/ResourceCenter"));
const CMSIntegrations = lazy(() => import("./pages/CMSIntegrations"));
const IntegrationsPage = lazy(() => import("./pages/IntegrationsPage"));
const WebhookIntegration = lazy(() => import("./pages/WebhookIntegration"));
const TemplateEditor = lazy(() => import("./pages/TemplateEditor"));
const BlogManagement = lazy(() => import("./pages/BlogManagement"));
const CategoryManager = lazy(() => import("./pages/CategoryManager"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const SystemMonitoringPage = lazy(() => import("./pages/SystemMonitoringPage"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <SidebarProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AboutPage />
                    </Suspense>
                  } />
                  <Route path="/contact" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ContactPage />
                    </Suspense>
                  } />
                  <Route path="/help" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <HelpSupport />
                    </Suspense>
                  } />
                  <Route path="/knowledge-base" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <KnowledgeBase />
                    </Suspense>
                  } />
                  <Route path="/course" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <CoursePage />
                    </Suspense>
                  } />
                  <Route path="/privacy" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PrivacyPolicy />
                    </Suspense>
                  } />
                  <Route path="/terms" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <TermsOfService />
                    </Suspense>
                  } />

                  {/* Protected Routes with Layout */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <Dashboard />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/autoblog" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <ProductionAutoBlogProducer />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/website-builder" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <ProductionWebsiteBuilder />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/ai-website" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <AIWebsiteGenerator />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/analytics" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <AnalyticsPage />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/media" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <MediaPortal />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/resources" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <ResourceCenter />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/cms-integration" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <CMSIntegrations />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/integrations" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <IntegrationsPage />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/webhooks" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <WebhookIntegration />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/templates" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <TemplateEditor />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/blog-management" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <BlogManagement />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/categories" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <CategoryManager />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard/settings" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <SettingsPage />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OnboardingPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <AdminDashboard />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/users" element={
                    <ProtectedRoute requiredRole="admin">
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <AdminUsersPage />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/monitoring" element={
                    <ProtectedRoute requiredRole="admin">
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedLayout type="dashboard">
                          <SystemMonitoringPage />
                        </OptimizedLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SidebarProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
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
const WordPressTestPilot = lazy(() => import("./pages/WordPressTestPilot"));
const SocialAdsPage = lazy(() => import("./pages/SocialAdsPage"));
const OptimizedHeader = lazy(() => import("./components/OptimizedHeader"));
const Footer = lazy(() => import("./components/Footer"));

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
              <Routes>
                {/* Homepage - With header/footer */}
                <Route path="/" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <Index />
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Public Routes with header/footer */}
                <Route path="/pricing" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <PricingPage />
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />
                <Route path="/about" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <AboutPage />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />
                <Route path="/contact" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <ContactPage />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />
                <Route path="/help" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <HelpSupport />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />
                <Route path="/knowledge-base" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <KnowledgeBase />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />
                <Route path="/course" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <CoursePage />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />
                <Route path="/privacy" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <PrivacyPolicy />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />
                <Route path="/terms" element={
                  <div>
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedHeader />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <TermsOfService />
                    </Suspense>
                    <Suspense fallback={<LoadingFallback />}>
                      <Footer />
                    </Suspense>
                  </div>
                } />

                {/* Protected Routes with Dashboard Layout - THESE NEED SidebarProvider */}
                <Route path="/dashboard/*" element={
                  <SidebarProvider>
                    <Routes>
                      <Route path="" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <Dashboard />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="autoblog" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <ProductionAutoBlogProducer />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="website-builder" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <ProductionWebsiteBuilder />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="ai-website" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <AIWebsiteGenerator />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="analytics" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <AnalyticsPage />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="media" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <MediaPortal />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="resources" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <ResourceCenter />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="cms-integration" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <CMSIntegrations />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="integrations" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <IntegrationsPage />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="webhooks" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <WebhookIntegration />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="templates" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <TemplateEditor />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="blog-management" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <BlogManagement />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="categories" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <CategoryManager />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="settings" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <SettingsPage />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="wordpress-testpilot" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <WordPressTestPilot />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="social-ads" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <SocialAdsPage />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </SidebarProvider>
                } />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <SidebarProvider>
                    <Routes>
                      <Route path="" element={
                        <ProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <AdminDashboard />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="users" element={
                        <ProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <AdminUsersPage />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="monitoring" element={
                        <ProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingFallback />}>
                            <OptimizedLayout type="dashboard">
                              <SystemMonitoringPage />
                            </OptimizedLayout>
                          </Suspense>
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </SidebarProvider>
                } />

                {/* Standalone routes */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <OnboardingPage />
                    </Suspense>
                  </ProtectedRoute>
                } />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
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
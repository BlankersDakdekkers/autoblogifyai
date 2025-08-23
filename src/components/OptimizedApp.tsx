import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { OptimizedLayout } from './OptimizedLayout';

// Lazy load components for better code splitting
const Index = lazy(() => import("../pages/Index"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const OnboardingPage = lazy(() => import("../pages/OnboardingPage"));
const SalesPage = lazy(() => import("../pages/SalesPage"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AutoBlogProducer = lazy(() => import("../pages/AutoBlogProducer"));
const AutoBlogProducerWithTabs = lazy(() => import("../pages/AutoBlogProducerWithTabs"));
const AIWebsiteGenerator = lazy(() => import("../pages/AIWebsiteGenerator"));
const WebsiteBuilder = lazy(() => import("../pages/WebsiteBuilder"));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
const IntegrationsPage = lazy(() => import("../pages/IntegrationsPage"));
const PricingPage = lazy(() => import("../pages/PricingPage"));
const CustomerCases = lazy(() => import("../pages/CustomerCases"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const KnowledgeBase = lazy(() => import("../pages/KnowledgeBase"));
const HelpSupport = lazy(() => import("../pages/HelpSupport"));
const BlogManagement = lazy(() => import("../pages/BlogManagement"));
const ResourceCenter = lazy(() => import("../pages/ResourceCenter"));
const MediaPortal = lazy(() => import("../pages/MediaPortal"));
const ContentFeatures = lazy(() => import("../pages/ContentFeatures"));
const AdvancedAIFeatures = lazy(() => import("../pages/AdvancedAIFeatures"));
const CategoryManager = lazy(() => import("../pages/CategoryManager"));
const TemplateEditor = lazy(() => import("../pages/TemplateEditor"));
const CSVProcessor = lazy(() => import("../pages/CSVProcessor"));
const WebhookIntegration = lazy(() => import("../pages/WebhookIntegration"));
const AchievementsPage = lazy(() => import("../pages/AchievementsPage"));
const AffiliatePage = lazy(() => import("../pages/AffiliatePage"));
const CoursePage = lazy(() => import("../pages/CoursePage"));
const NotificationSystem = lazy(() => import("../pages/NotificationSystem"));
const ProjectsOverview = lazy(() => import("../pages/ProjectsOverview"));
const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage"));
const AdminCustomerPortal = lazy(() => import("../pages/AdminCustomerPortal"));
const SystemMonitoringPage = lazy(() => import("../pages/SystemMonitoringPage"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Optimized Query Client with better performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

// Performance optimized providers
const ProvidersWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ErrorBoundary>
          <PerformanceMonitor>
            {children}
          </PerformanceMonitor>
        </ErrorBoundary>
        <Toaster />
        <Sonner 
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
));

ProvidersWrapper.displayName = 'ProvidersWrapper';

// Route configuration for better maintainability
const routes = [
  // Public routes
  { path: "/", element: Index, layout: "simple" as const },
  { path: "/auth", element: AuthPage, layout: "none" as const },
  { path: "/sales", element: SalesPage, layout: "simple" as const },
  { path: "/pricing", element: PricingPage, layout: "simple" as const },
  { path: "/customer-cases", element: CustomerCases, layout: "simple" as const },
  { path: "/about", element: AboutPage, layout: "simple" as const },
  { path: "/contact", element: ContactPage, layout: "simple" as const },
  { path: "/terms", element: TermsOfService, layout: "simple" as const },
  { path: "/privacy", element: PrivacyPolicy, layout: "simple" as const },
  
  // Protected routes
  { path: "/onboarding", element: OnboardingPage, layout: "none" as const, protected: true },
  { path: "/dashboard", element: Dashboard, layout: "dashboard" as const, protected: true },
  
  // AutoblogifyAI routes
  { path: "/dashboard/keywords", element: AutoBlogProducer, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/generate", element: AutoBlogProducerWithTabs, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/media", element: MediaPortal, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/content-features", element: ContentFeatures, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/advanced-ai", element: AdvancedAIFeatures, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/category-manager", element: CategoryManager, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/template-editor", element: TemplateEditor, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/csv-processor", element: CSVProcessor, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/blogs", element: BlogManagement, layout: "dashboard" as const, protected: true },
  
  // Website Builder routes
  { path: "/dashboard/websites", element: WebsiteBuilder, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/deployment", element: WebsiteBuilder, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/ai-generator", element: AIWebsiteGenerator, layout: "dashboard" as const, protected: true },
  
  // Configuration routes
  { path: "/dashboard/projects", element: ProjectsOverview, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/resources", element: ResourceCenter, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/settings", element: SettingsPage, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/integrations", element: IntegrationsPage, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/webhooks", element: WebhookIntegration, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/affiliate", element: AffiliatePage, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/academy", element: CoursePage, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/notifications", element: NotificationSystem, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/help", element: HelpSupport, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/knowledge-base", element: KnowledgeBase, layout: "dashboard" as const, protected: true },
  
  // Dashboard routes
  { path: "/dashboard/analytics", element: AnalyticsPage, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/achievements", element: AchievementsPage, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/pricing", element: PricingPage, layout: "dashboard" as const, protected: true },
  
  // Admin routes
  { path: "/dashboard/admin/users", element: AdminUsersPage, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/admin/customers", element: AdminCustomerPortal, layout: "dashboard" as const, protected: true },
  { path: "/dashboard/admin/monitoring", element: SystemMonitoringPage, layout: "dashboard" as const, protected: true },
];

export const OptimizedApp = memo(() => {
  return (
    <ProvidersWrapper>
      <BrowserRouter 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {routes.map(({ path, element: Element, layout, protected: isProtected }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <OptimizedLayout type={layout} protected={isProtected}>
                      <Element />
                    </OptimizedLayout>
                  }
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ProvidersWrapper>
  );
});

OptimizedApp.displayName = 'OptimizedApp';

export default OptimizedApp;
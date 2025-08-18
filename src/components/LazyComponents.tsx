import { lazy, Suspense } from "react";

// Core components - loaded immediately
export { default as Index } from "../pages/Index";
export { default as AuthPage } from "../pages/AuthPage";
export { default as Dashboard } from "../pages/Dashboard";

// Lazy load non-critical pages for better performance
export const AutoBlogProducer = lazy(() => import("../pages/AutoBlogProducer"));
export const AIWebsiteGenerator = lazy(() => import("../pages/AIWebsiteGenerator"));
export const WebsiteBuilder = lazy(() => import("../pages/WebsiteBuilder"));
export const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
export const IntegrationsPage = lazy(() => import("../pages/IntegrationsPage"));
export const NotificationSystem = lazy(() => import("../pages/NotificationSystem"));
export const MediaPortal = lazy(() => import("../pages/MediaPortal"));
export const HelpSupport = lazy(() => import("../pages/HelpSupport"));
export const AchievementsPage = lazy(() => import("../pages/AchievementsPage"));
export const CoursePage = lazy(() => import("../pages/CoursePage"));
export const AffiliatePage = lazy(() => import("../pages/AffiliatePage"));
export const PricingPage = lazy(() => import("../pages/PricingPage"));
export const ContentFeatures = lazy(() => import("../pages/ContentFeatures"));
export const CategoryManager = lazy(() => import("../pages/CategoryManager"));
export const TemplateEditor = lazy(() => import("../pages/TemplateEditor"));
export const WebhookIntegration = lazy(() => import("../pages/WebhookIntegration"));
export const CSVProcessor = lazy(() => import("../pages/CSVProcessor"));
export const KnowledgeBase = lazy(() => import("../pages/KnowledgeBase"));
export const BlogManagement = lazy(() => import("../pages/BlogManagement"));
export const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage"));
export const AdminCustomerPortal = lazy(() => import("../pages/AdminCustomerPortal"));
export const SystemMonitoringPage = lazy(() => import("../pages/SystemMonitoringPage"));
export const OnboardingPage = lazy(() => import("../pages/OnboardingPage"));
export const SalesPage = lazy(() => import("../pages/SalesPage"));
export const NotFound = lazy(() => import("../pages/NotFound"));

// Loading component
export const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
    <div className="text-center animate-fade-in">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Pagina laden...</p>
    </div>
  </div>
);

// Wrapper for lazy components
export const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);
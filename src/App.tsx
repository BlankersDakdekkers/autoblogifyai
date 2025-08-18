import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import AffiliatePage from "./pages/AffiliatePage";
import AIWebsiteGenerator from "./pages/AIWebsiteGenerator";
import AutoBlogProducerWithTabs from "./pages/AutoBlogProducerWithTabs";
import CoursePage from "./pages/CoursePage";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/dashboard/websites" element={<WebsiteBuilder />} />
            <Route path="/dashboard/deployment" element={<WebsiteBuilder />} />
            <Route path="/dashboard/ai-generator" element={<AIWebsiteGenerator />} />
            <Route path="/dashboard/integrations" element={<WebsiteBuilder />} />
            <Route path="/dashboard/keywords" element={<AutoBlogProducerWithTabs initialTab="keywords" />} />
            <Route path="/dashboard/voice" element={<AutoBlogProducerWithTabs initialTab="voice" />} />
            <Route path="/dashboard/affiliate" element={<AffiliatePage />} />
            <Route path="/dashboard/academy" element={<CoursePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

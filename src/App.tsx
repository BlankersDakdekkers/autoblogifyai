import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import CMSIntegrations from "./pages/CMSIntegrations";

const queryClient = new QueryClient();

// EMERGENCY REBUILD - FORCE CACHE BREAK 2025.01.24.20.10
const App = () => {
  console.error("🚨🚨🚨 EMERGENCY CACHE BREAK VERSION 20:10 🚨🚨🚨");
  console.error("🚨 If you see this, the cache break worked!");
  console.error("🚨 Current path:", window.location.pathname);
  
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* DIRECT CMS ROUTE - NO COMPLEX NESTING */}
                <Route 
                  path="/dashboard/cms-integration" 
                  element={<CMSIntegrations />} 
                />
                
                <Route 
                  path="*" 
                  element={
                    <div style={{
                      padding: '2rem',
                      textAlign: 'center',
                      fontSize: '2rem'
                    }}>
                      <h1>404 - Page Not Found</h1>
                      <p>Current path: {window.location.pathname}</p>
                      <a href="/dashboard/cms-integration" style={{ color: 'blue' }}>
                        Go to CMS Integration
                      </a>
                    </div>
                  } 
                />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
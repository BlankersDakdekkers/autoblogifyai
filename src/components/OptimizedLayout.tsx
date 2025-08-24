import React, { memo, Suspense } from 'react';
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LoadingFallback } from './LoadingFallback';
import { cn } from '@/lib/utils';

interface OptimizedLayoutProps {
  children: React.ReactNode;
  type?: 'simple' | 'dashboard' | 'none';
  protected?: boolean;
}

const DashboardLayout = memo(({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className={cn(
          "h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "sticky top-0 z-50 px-4 transition-all duration-300"
        )}>
          <SidebarTrigger className="hover-scale" />
          <div className="ml-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-glow rounded-md flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">AI</span>
            </div>
            <h1 className="font-semibold text-foreground">AutoblogifyAI Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="container mx-auto p-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

const SimpleLayout = memo(({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <SimpleHeader />
    <main className="animate-fade-in flex-1">
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </div>
));

SimpleLayout.displayName = 'SimpleLayout';

const NoneLayout = memo(({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </div>
));

NoneLayout.displayName = 'NoneLayout';

export const OptimizedLayout = memo(({ children, type = 'none', protected: isProtected }: OptimizedLayoutProps) => {
  const content = () => {
    switch (type) {
      case 'simple':
        return <SimpleLayout>{children}</SimpleLayout>;
      case 'dashboard':
        return <DashboardLayout>{children}</DashboardLayout>;
      default:
        return <NoneLayout>{children}</NoneLayout>;
    }
  };

  if (isProtected) {
    return (
      <ProtectedRoute>
        {content()}
      </ProtectedRoute>
    );
  }

  return content();
});

OptimizedLayout.displayName = 'OptimizedLayout';
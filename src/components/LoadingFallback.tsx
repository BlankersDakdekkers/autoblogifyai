import React, { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  variant?: 'page' | 'card' | 'dashboard' | 'minimal';
  className?: string;
}

const PageLoadingSkeleton = memo(() => (
  <div className="min-h-screen bg-background p-6 animate-fade-in">
    <div className="container mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card-glass p-6 space-y-4 animate-pulse">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

PageLoadingSkeleton.displayName = 'PageLoadingSkeleton';

const CardLoadingSkeleton = memo(() => (
  <div className="card-glass p-6 space-y-4 animate-pulse">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
));

CardLoadingSkeleton.displayName = 'CardLoadingSkeleton';

const DashboardLoadingSkeleton = memo(() => (
  <div className="p-6 space-y-6 animate-fade-in">
    {/* Dashboard header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-premium p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
));

DashboardLoadingSkeleton.displayName = 'DashboardLoadingSkeleton';

const MinimalLoadingSkeleton = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4 text-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
    </div>
  </div>
));

MinimalLoadingSkeleton.displayName = 'MinimalLoadingSkeleton';

export const LoadingFallback = memo(({ 
  variant = 'page', 
  className 
}: LoadingFallbackProps) => {
  const skeletonComponent = () => {
    switch (variant) {
      case 'card':
        return <CardLoadingSkeleton />;
      case 'dashboard':
        return <DashboardLoadingSkeleton />;
      case 'minimal':
        return <MinimalLoadingSkeleton />;
      default:
        return <PageLoadingSkeleton />;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {skeletonComponent()}
    </div>
  );
});

LoadingFallback.displayName = 'LoadingFallback';
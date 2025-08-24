import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-components';
import { Loader2, Sparkles } from 'lucide-react';

export const DashboardLoadingFallback = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ResponsiveContainer maxWidth="7xl">
        <div className="py-8 space-y-8">
          {/* Header Loading */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-8 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-80" />
                    <Skeleton className="h-5 w-64" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Loading */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            
            <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="md">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-0 bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </div>

          {/* Quick Actions Loading */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            
            <ResponsiveGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="md">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-0 bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </div>

          {/* Tabs Loading */}
          <div className="space-y-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
            
            <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
              {[1, 2].map((i) => (
                <Card key={i} className="border-0 bg-gradient-to-br from-card to-card/80">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Dashboard laden...</span>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

// Simplified loading component for quick loading states
export const QuickLoadingFallback = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Even geduld...</h3>
          <p className="text-muted-foreground text-sm">We bereiden je dashboard voor</p>
        </div>
      </div>
    </div>
  );
};

export { DashboardLoadingFallback as default };
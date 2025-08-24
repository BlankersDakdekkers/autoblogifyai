import React, { memo, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer, ResponsiveGrid, OptimizedComponent } from '@/components/ui/responsive-components';
import { useIsMobile, useCurrentBreakpoint } from '@/utils/responsive';
import AnimatedCounter from '@/components/AnimatedCounter';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Zap, 
  Plus,
  BarChart3,
  Users,
  Globe,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Timer,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Memoized metric card component
const MetricCard = memo(({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  color = 'primary',
  description 
}: {
  title: string;
  value: number | string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'green' | 'blue' | 'purple';
  description?: string;
}) => {
  const colorMap = {
    primary: 'from-primary to-primary-glow',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  return (
    <Card className="hover-scale transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              {typeof value === 'number' ? (
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={value.toString()} />
                </div>
              ) : (
                <span className="text-2xl font-bold">{value}</span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-gradient-to-br ${colorMap[color]} shadow-md`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {change && (
          <div className="mt-4">
            <Badge className={`text-xs ${trendColors[trend]}`}>
              {change}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

// Quick action card component
const QuickActionCard = memo(({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color = 'primary',
  badge 
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color?: string;
  badge?: string;
}) => {
  return (
    <Card className="group hover-scale transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
      <CardContent className="p-6">
        <Link to={href} className="block">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
});

QuickActionCard.displayName = 'QuickActionCard';

// Recent activity component
const RecentActivity = memo(() => {
  const activities = [
    { title: 'Blog post gegenereerd', time: '2 minuten geleden', icon: FileText },
    { title: 'Template bijgewerkt', time: '1 uur geleden', icon: Zap },
    { title: 'Analytics bekeken', time: '3 uur geleden', icon: BarChart3 },
  ];

  return (
    <Card className="border-0 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-primary" />
          Recente Activiteit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});

RecentActivity.displayName = 'RecentActivity';

// Performance insights component
const PerformanceInsights = memo(() => {
  const insights = [
    { label: 'Gemiddelde generatietijd', value: '2.3s', trend: 'up', change: '15% sneller' },
    { label: 'Success rate', value: '98.7%', trend: 'up', change: '+2.1%' },
    { label: 'Content kwaliteit', value: '4.8/5', trend: 'neutral', change: 'Stabiel' },
  ];

  return (
    <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-green-800">
          <TrendingUp className="h-5 w-5" />
          Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">{insight.label}</p>
              <p className="text-xs text-green-600">{insight.change}</p>
            </div>
            <Badge className="bg-green-200 text-green-800 hover:bg-green-200">
              {insight.value}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

PerformanceInsights.displayName = 'PerformanceInsights';

// Main optimized dashboard component
export const OptimizedDashboard = memo(() => {
  const { profile, user } = useAuth();
  const isMobile = useIsMobile();
  const currentBreakpoint = useCurrentBreakpoint();

  // Memoize metrics to prevent unnecessary calculations
  const metrics = useMemo(() => [
    {
      title: 'Totaal Artikelen',
      value: 247,
      change: '+12 deze week',
      icon: FileText,
      trend: 'up' as const,
      color: 'primary' as const,
      description: 'AI gegenereerde content'
    },
    {
      title: 'Maandelijks Verkeer',
      value: '48.2K',
      change: '+23% vs vorige maand',
      icon: TrendingUp,
      trend: 'up' as const,
      color: 'green' as const,
      description: 'Organische bezoekers'
    },
    {
      title: 'Tijdsbesparing',
      value: '89 uur',
      change: 'Deze maand',
      icon: Timer,
      trend: 'up' as const,
      color: 'blue' as const,
      description: 'vs handmatig schrijven'
    },
    {
      title: 'SEO Score',
      value: '92/100',
      change: '+8 punten',
      icon: Award,
      trend: 'up' as const,
      color: 'purple' as const,
      description: 'Gemiddelde kwaliteit'
    }
  ], []);

  const quickActions = useMemo(() => [
    {
      title: 'Nieuwe Blog Genereren',
      description: 'Start met CSV upload en genereer content',
      icon: Plus,
      href: '/dashboard/csv-processor',
      badge: 'Populair'
    },
    {
      title: 'Analytics Bekijken',
      description: 'Inzichten in je content prestaties',
      icon: BarChart3,
      href: '/dashboard/analytics'
    },
    {
      title: 'Templates Beheren',
      description: 'Maak en bewerk content templates',
      icon: Zap,
      href: '/dashboard/template-editor'
    },
    {
      title: 'Keywords Onderzoeken',
      description: 'AI-powered keyword research en analyse',
      icon: Target,
      href: '/dashboard/keywords'
    }
  ], []);

  return (
    <ResponsiveContainer maxWidth="7xl">
      <div className="space-y-8">
        {/* Welcome Header */}
        <OptimizedComponent name="dashboard-header">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welkom terug{profile?.display_name ? `, ${profile.display_name}` : ''}! 👋
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Je content productiviteit dashboard. Hier zie je al je metrics, recente activiteit en snelle acties.
            </p>
          </div>
        </OptimizedComponent>

        {/* Key Metrics */}
        <OptimizedComponent name="dashboard-metrics">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Belangrijkste Metrics
            </h2>
            <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="md">
              {metrics.map((metric, index) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </ResponsiveGrid>
          </div>
        </OptimizedComponent>

        {/* Quick Actions */}
        <OptimizedComponent name="dashboard-actions">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Snelle Acties
            </h2>
            <ResponsiveGrid columns={{ xs: 1, md: 2 }} gap="md">
              {quickActions.map((action, index) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </ResponsiveGrid>
          </div>
        </OptimizedComponent>

        {/* Activity & Insights */}
        <OptimizedComponent name="dashboard-insights">
          <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
            <RecentActivity />
            <PerformanceInsights />
          </ResponsiveGrid>
        </OptimizedComponent>
      </div>
    </ResponsiveContainer>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';

export default OptimizedDashboard;
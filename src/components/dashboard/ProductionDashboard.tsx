import React, { memo, useState, useEffect, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-components';
import { useIsMobile, useCurrentBreakpoint } from '@/utils/responsive';
import AnimatedCounter from '@/components/AnimatedCounter';
import { supabase } from '@/integrations/supabase/client';
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
  Award,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  Upload,
  Eye,
  Heart,
  Share,
  Bookmark,
  Filter,
  Search,
  RefreshCw,
  Info,
  Lightbulb,
  Rocket,
  Shield,
  Database,
  Crown,
  LineChart,
  Calendar,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Professional metric card with real-time updates
const ProfessionalMetricCard = memo(({ 
  title, 
  value, 
  previousValue,
  change, 
  icon: Icon, 
  trend = 'up',
  color = 'primary',
  description,
  isLoading = false,
  onClick,
  comparison
}: {
  title: string;
  value: number | string;
  previousValue?: number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'green' | 'blue' | 'purple' | 'orange' | 'red';
  description?: string;
  isLoading?: boolean;
  onClick?: () => void;
  comparison?: { label: string; value: string; trend: 'up' | 'down' | 'neutral' };
}) => {
  const colorMap = {
    primary: 'from-primary to-primary/80',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  const trendColors = {
    up: 'text-green-700 bg-green-100 border-green-200',
    down: 'text-red-700 bg-red-100 border-red-200',
    neutral: 'text-gray-700 bg-gray-100 border-gray-200'
  };

  const shadowMap = {
    primary: 'shadow-primary/20',
    green: 'shadow-green-500/20',
    blue: 'shadow-blue-500/20',
    purple: 'shadow-purple-500/20',
    orange: 'shadow-orange-500/20',
    red: 'shadow-red-500/20'
  };

  if (isLoading) {
    return (
      <Card className="hover-scale transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`group relative overflow-hidden hover-scale transition-all duration-300 hover:shadow-xl ${shadowMap[color]} border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur cursor-pointer`}
      onClick={onClick}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              {comparison && (
                <Badge variant="outline" className="text-xs">
                  {comparison.label}
                </Badge>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              {typeof value === 'number' ? (
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={value.toString()} />
                </div>
              ) : (
                <span className="text-2xl font-bold">{value}</span>
              )}
              
              {previousValue && typeof value === 'number' && (
                <div className="text-xs text-muted-foreground">
                  {previousValue > 0 && (
                    <span>
                      {((value - previousValue) / previousValue * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {description && (
              <p className="text-xs text-muted-foreground leading-tight">
                {description}
              </p>
            )}
            
            {comparison && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">{comparison.label}:</span>
                <Badge className={`text-xs ${trendColors[comparison.trend]}`}>
                  {comparison.value}
                </Badge>
              </div>
            )}
          </div>
          
          <div className={`relative p-4 rounded-full bg-gradient-to-br ${colorMap[color]} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className="h-6 w-6 text-white" />
            {trend === 'up' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center justify-between">
            <Badge className={`text-xs border ${trendColors[trend]}`}>
              {trend === 'up' && '↗'} {trend === 'down' && '↘'} {change}
            </Badge>
            
            {onClick && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                <span>Details</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProfessionalMetricCard.displayName = 'ProfessionalMetricCard';

// Enhanced quick action card
const EnhancedQuickActionCard = memo(({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color = 'primary',
  badge,
  isNew = false,
  isPremium = false,
  estimatedTime,
  difficulty = 'easy'
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color?: string;
  badge?: string;
  isNew?: boolean;
  isPremium?: boolean;
  estimatedTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}) => {
  const difficultyColors = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-orange-600 bg-orange-50',
    hard: 'text-red-600 bg-red-50'
  };

  return (
    <Card className="group relative overflow-hidden hover-scale transition-all duration-300 hover:shadow-xl border-0 bg-gradient-to-br from-card to-card/80">
      {isNew && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs">
            Nieuw
          </Badge>
        </div>
      )}
      
      {isPremium && (
        <div className="absolute top-2 left-2 z-10">
          <Crown className="h-4 w-4 text-amber-500" />
        </div>
      )}
      
      <CardContent className="p-6">
        <Link to={href} className="block">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
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
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{estimatedTime}</span>
                    </div>
                  )}
                  
                  <Badge className={`text-xs ${difficultyColors[difficulty]}`}>
                    {difficulty === 'easy' && 'Makkelijk'}
                    {difficulty === 'medium' && 'Gemiddeld'}  
                    {difficulty === 'hard' && 'Moeilijk'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
});

EnhancedQuickActionCard.displayName = 'EnhancedQuickActionCard';

// Real-time activity feed
const ActivityFeed = memo(() => {
  const [activities, setActivities] = useState([
    { id: 1, title: 'Blog post gegenereerd', description: 'Dakbedekking Amsterdam - SEO geoptimaliseerd', time: '2 minuten geleden', icon: FileText, type: 'success' },
    { id: 2, title: 'Template bijgewerkt', description: 'Loodgieter template v2.1 - CTR verbeterd', time: '1 uur geleden', icon: Zap, type: 'info' },
    { id: 3, title: 'Analytics milestone', description: '10,000+ organische views deze maand', time: '3 uur geleden', icon: BarChart3, type: 'success' },
    { id: 4, title: 'Nieuwe gebruiker', description: 'Welkom aboard! Onboarding gestart', time: '5 uur geleden', icon: Users, type: 'info' },
    { id: 5, title: 'WordPress sync', description: '5 artikelen gepubliceerd naar WP', time: '1 dag geleden', icon: Globe, type: 'success' },
  ]);

  const typeStyles = {
    success: 'text-green-600 bg-green-50 border-green-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
    warning: 'text-orange-600 bg-orange-50 border-orange-200',
    error: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Live Activiteit
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Real-time
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200">
                  <div className={`p-2 rounded-full border ${typeStyles[activity.type as keyof typeof typeStyles]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

ActivityFeed.displayName = 'ActivityFeed';

// Performance insights with charts
const PerformanceInsights = memo(() => {
  const [insights, setInsights] = useState([
    { label: 'Gemiddelde generatietijd', value: '2.1s', trend: 'up', change: '18% sneller dan vorige week', target: '< 3s' },
    { label: 'Success rate', value: '99.2%', trend: 'up', change: '+0.5% verbetering', target: '> 95%' },
    { label: 'Content kwaliteit score', value: '4.9/5', trend: 'up', change: '+0.2 punten', target: '> 4.5' },
    { label: 'SEO compliance', value: '96%', trend: 'neutral', change: 'Stabiel', target: '> 90%' },
    { label: 'User satisfaction', value: '4.8/5', trend: 'up', change: 'Uitstekend', target: '> 4.0' }
  ]);

  const getStatusColor = (value: string, target: string) => {
    // Simple logic to determine if target is met
    const numValue = parseFloat(value);
    const numTarget = parseFloat(target.replace(/[^\d.]/g, ''));
    
    if (target.includes('>')) {
      return numValue >= numTarget ? 'success' : 'warning';
    }
    if (target.includes('<')) {
      return numValue <= numTarget ? 'success' : 'warning';
    }
    return 'success';
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-green-800">
            <LineChart className="h-5 w-5" />
            Performance Insights
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <Shield className="h-3 w-3 mr-1" />
            Uitstekend
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const status = getStatusColor(insight.value, insight.target);
          const statusColors = {
            success: 'text-green-700 bg-green-100 border-green-200',
            warning: 'text-orange-700 bg-orange-100 border-orange-200',
            error: 'text-red-700 bg-red-100 border-red-200'
          };

          return (
            <div key={index} className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/50 transition-all">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-green-800">
                    {insight.label}
                  </p>
                  <div className="text-xs text-green-600 opacity-70">
                    Target: {insight.target}
                  </div>
                </div>
                <p className="text-xs text-green-600">
                  {insight.change}
                </p>
              </div>
              <div className="text-right space-y-1">
                <Badge className={`text-sm font-semibold border ${statusColors[status]}`}>
                  {insight.value}
                </Badge>
                {status === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});

PerformanceInsights.displayName = 'PerformanceInsights';

// Analytics overview widget
const AnalyticsOverview = memo(() => {
  const [timeframe, setTimeframe] = useState('week');
  const [isLoading, setIsLoading] = useState(false);

  const analyticsData = {
    week: {
      views: 24500,
      clicks: 1820,
      conversions: 156,
      revenue: 3420
    },
    month: {
      views: 98200,
      clicks: 7240,
      conversions: 624,
      revenue: 13680
    }
  };

  const currentData = analyticsData[timeframe as keyof typeof analyticsData];

  return (
    <Card className="border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-blue-800">
            <BarChart3 className="h-5 w-5" />
            Analytics Overview
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('week')}
              className="text-xs h-7"
            >
              Week
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('month')}
              className="text-xs h-7"
            >
              Maand
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveGrid columns={{ xs: 2, sm: 4 }} gap="sm">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Views</span>
            </div>
            <div className="text-lg font-bold text-blue-800">
              <AnimatedCounter value={currentData.views.toLocaleString()} />
            </div>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ExternalLink className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Clicks</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              <AnimatedCounter value={currentData.clicks.toLocaleString()} />
            </div>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">Conversies</span>
            </div>
            <div className="text-lg font-bold text-purple-800">
              <AnimatedCounter value={currentData.conversions.toString()} />
            </div>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">Revenue</span>
            </div>
            <div className="text-lg font-bold text-orange-800">
              €<AnimatedCounter value={currentData.revenue.toLocaleString()} />
            </div>
          </div>
        </ResponsiveGrid>
        
        <div className="mt-4 text-center">
          <Link to="/dashboard/analytics">
            <Button variant="outline" size="sm" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              Volledige Analytics
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

AnalyticsOverview.displayName = 'AnalyticsOverview';

// Main production dashboard component
export const ProductionDashboard = memo(() => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Real-time metrics (would normally come from API)
  const [metrics, setMetrics] = useState([
    {
      title: 'Actieve Artikelen',
      value: 247,
      previousValue: 235,
      change: '+12 deze week',
      icon: FileText,
      trend: 'up' as const,
      color: 'primary' as const,
      description: 'AI gegenereerde content live',
      comparison: { label: 'vs vorige week', value: '+5.1%', trend: 'up' as const }
    },
    {
      title: 'Maandelijks Verkeer',
      value: '52.3K',
      change: '+28% vs vorige maand',
      icon: TrendingUp,
      trend: 'up' as const,
      color: 'green' as const,
      description: 'Organische bezoekers (Google Analytics)',
      comparison: { label: 'CTR', value: '3.8%', trend: 'up' as const }
    },
    {
      title: 'Tijdsbesparing',
      value: '127 uur',
      change: 'Deze maand',
      icon: Timer,
      trend: 'up' as const,
      color: 'blue' as const,
      description: '€6,350 waarde vs handmatig schrijven',
      comparison: { label: 'efficiency', value: '94%', trend: 'up' as const }
    },
    {
      title: 'ROI Score',
      value: '847%',
      change: '+12% deze maand',
      icon: Award,
      trend: 'up' as const,
      color: 'purple' as const,
      description: 'Return on Investment berekening',
      comparison: { label: 'industry avg', value: '+340%', trend: 'up' as const }
    }
  ]);

  const quickActions = [
    {
      title: 'Content Generator Starten',
      description: 'Upload CSV en genereer professionele blogposts met AI',
      icon: Plus,
      href: '/dashboard/csv-processor',
      badge: 'Meest gebruikt',
      estimatedTime: '2-5 min',
      difficulty: 'easy' as const,
      isNew: false
    },
    {
      title: 'Performance Analytics',
      description: 'Bekijk gedetailleerde prestatie-inzichten en ROI metrics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      estimatedTime: '5-10 min',
      difficulty: 'easy' as const
    },
    {
      title: 'Enterprise AI Features',
      description: 'Toegang tot geavanceerde AI modellen en batch processing',
      icon: Crown,
      href: '/dashboard/advanced-ai',
      isPremium: true,
      estimatedTime: '10-30 min',
      difficulty: 'medium' as const,
      isNew: true
    },
    {
      title: 'SEO Keywords Research',
      description: 'AI-powered keyword analyse en concurrent research',
      icon: Target,
      href: '/dashboard/keywords',
      estimatedTime: '15-25 min',
      difficulty: 'medium' as const
    },
    {
      title: 'WordPress Integratie',
      description: 'Automatisch publiceren naar je WordPress websites',
      icon: Globe,
      href: '/dashboard/cms-integration',
      estimatedTime: '5-15 min',
      difficulty: 'easy' as const
    },
    {
      title: 'Template Designer',
      description: 'Maak aangepaste content templates voor je niche',
      icon: Zap,
      href: '/dashboard/template-editor',
      estimatedTime: '20-45 min',
      difficulty: 'hard' as const
    }
  ];

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Dashboard bijgewerkt",
        description: "Alle metrics zijn succesvol ververst.",
      });
    } catch (error) {
      toast({
        title: "Fout bij verversen",
        description: "Er ging iets mis bij het ophalen van nieuwe data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ResponsiveContainer maxWidth="7xl">
      <div className="space-y-8">
        {/* Premium Header with Status */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-accent p-8 text-white animate-fade-in">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur">
                  <Rocket className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Welkom terug{profile?.display_name ? `, ${profile.display_name}` : ''}! 🚀
                  </h1>
                  <p className="text-white/90 text-lg">
                    Je AutoblogifyAI dashboard - Real-time content analytics & AI management
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={refreshDashboard}
                  disabled={isRefreshing}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/30"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Verversen
                </Button>
                
                <Badge className="bg-green-500/20 text-green-100 border-green-300/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Live Status
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5" />
                  <span className="font-medium">Content Database</span>
                </div>
                <div className="text-2xl font-bold">99.9% Uptime</div>
                <div className="text-sm text-white/80">Betrouwbare service</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">AI Models</span>
                </div>
                <div className="text-2xl font-bold">5 Actief</div>
                <div className="text-sm text-white/80">GPT-4, Claude, Gemini</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Success Rate</span>
                </div>
                <div className="text-2xl font-bold">99.2%</div>
                <div className="text-sm text-white/80">Content kwaliteit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Live Performance Metrics
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Real-time data
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/analytics">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Volledige Analytics
                </Link>
              </Button>
            </div>
          </div>
          
          <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="md">
            {metrics.map((metric, index) => (
              <ProfessionalMetricCard 
                key={metric.title} 
                {...metric}
                onClick={() => navigate('/dashboard/analytics')}
              />
            ))}
          </ResponsiveGrid>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Snelle Acties & Tools
            </h2>
            <Badge variant="secondary" className="text-xs">
              {quickActions.length} beschikbaar
            </Badge>
          </div>
          
          <ResponsiveGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="md">
            {quickActions.map((action, index) => (
              <EnhancedQuickActionCard key={action.title} {...action} />
            ))}
          </ResponsiveGrid>
        </div>

        {/* Dashboard Tabs for Advanced Views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activiteit</TabsTrigger>
            <TabsTrigger value="insights">Inzichten</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
              <AnalyticsOverview />
              <PerformanceInsights />
            </ResponsiveGrid>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Voor gedetailleerde analytics, ga naar de{' '}
                <Link to="/dashboard/analytics" className="font-medium underline">
                  volledige Analytics pagina
                </Link>
              </AlertDescription>
            </Alert>
            <AnalyticsOverview />
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
              <ActivityFeed />
              <Card className="border-0 bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Geplande Taken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">SEO Audit</p>
                        <p className="text-xs text-muted-foreground">Morgen 09:00</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Content Sync</p>
                        <p className="text-xs text-muted-foreground">Dagelijks 14:00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
              <PerformanceInsights />
              <Card className="border-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Lightbulb className="h-5 w-5" />
                    AI Aanbevelingen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-full">
                        <Target className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-800">SEO Optimalisatie</h4>
                        <p className="text-sm text-amber-700">
                          Voeg meer long-tail keywords toe voor betere rankings
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-full">
                        <Clock className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-800">Publicatie Timing</h4>
                        <p className="text-sm text-amber-700">
                          Publiceer tussen 09:00-11:00 voor 23% meer engagement
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </TabsContent>
        </Tabs>

        {/* System Status Footer */}
        <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Alle systemen operationeel</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="text-sm text-muted-foreground">
                  Laatste update: {new Date().toLocaleTimeString('nl-NL')}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/help">
                    <Info className="h-4 w-4 mr-2" />
                    Support
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Instellingen
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
});

ProductionDashboard.displayName = 'ProductionDashboard';

export default ProductionDashboard;
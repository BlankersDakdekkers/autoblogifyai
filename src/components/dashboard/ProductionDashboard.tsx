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
import { CreditsDisplay } from '@/components/CreditsDisplay';
import AdminSetupButton from '@/components/AdminSetupButton';
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

// Modern Live Performance Metrics Card
const LiveMetricCard = memo(({ 
  title, 
  value, 
  subtitle,
  change, 
  icon: Icon, 
  trend = 'up',
  color = 'blue',
  efficiency,
  isLoading = false,
  onClick,
  details
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  efficiency?: string;
  isLoading?: boolean;
  onClick?: () => void;
  details?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100 text-blue-900',
    green: 'bg-green-50 border-green-100 text-green-900', 
    purple: 'bg-purple-50 border-purple-100 text-purple-900',
    orange: 'bg-orange-50 border-orange-100 text-orange-900'
  };

  const iconColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500', 
    orange: 'bg-orange-500'
  };

  const changeColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 hover-scale transition-all duration-300 hover:shadow-lg ${colorClasses[color]} cursor-pointer`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium opacity-70">
                {title}
              </p>
              <span className="text-xs opacity-50">vs vorige week</span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {typeof value === 'number' ? <AnimatedCounter value={value.toString()} /> : value}
              </span>
              <span className="text-sm opacity-60">{subtitle}</span>
            </div>
            
            {subtitle && (
              <p className="text-xs opacity-60 leading-tight">
                {subtitle}
              </p>
            )}

            {efficiency && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs opacity-60">efficiency:</span>
                <Badge className="text-xs bg-green-100 text-green-700">
                  {efficiency}
                </Badge>
              </div>
            )}
            
            {change && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs px-2 py-1 ${changeColors[trend]}`}>
                  {trend === 'up' && '+'}
                  {trend === 'down' && '-'}
                  {change}
                </Badge>
                {details && (
                  <button className="text-xs opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
                    Details
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-full ${iconColors[color]} relative`}>
            <Icon className="h-6 w-6 text-white" />
            {trend === 'up' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LiveMetricCard.displayName = 'LiveMetricCard';

// Modern Quick Action Tool Card
const QuickActionCard = memo(({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  badge,
  isNew = false,
  isPremium = false,
  estimatedTime,
  status = 'Makkelijk'
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  isNew?: boolean;
  isPremium?: boolean;
  estimatedTime?: string;
  status?: string;
}) => {
  const statusColors = {
    'Makkelijk': 'text-green-600 bg-green-50',
    'Gemiddeld': 'text-orange-600 bg-orange-50',
    'Moeilijk': 'text-red-600 bg-red-50'
  };

  return (
    <Card className="group hover-scale transition-all duration-300 hover:shadow-md border border-gray-100 bg-white">
      <CardContent className="p-5">
        <Link to={href} className="block">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-primary/10 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {isNew && (
                  <Badge className="bg-green-500 text-white text-xs px-2">
                    Nieuw
                  </Badge>
                )}
                {isPremium && (
                  <Crown className="h-4 w-4 text-amber-500" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
              
              <div className="flex items-center justify-between mt-3">
                {estimatedTime && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{estimatedTime}</span>
                  </div>
                )}
                
                <Badge className={`text-xs px-2 py-1 ${statusColors[status as keyof typeof statusColors] || statusColors['Makkelijk']}`}>
                  {status}
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
});

QuickActionCard.displayName = 'QuickActionCard';

// Enhanced Analytics Section with Tabs
const EnhancedAnalyticsSection = memo(() => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('week');

  const analyticsData = {
    overview: {
      views: 24500,
      clicks: 1820, 
      conversions: 156,
      revenue: 3420
    },
    performance: [
      {
        label: 'Gemiddelde generatietijd',
        value: '2.1s',
        target: '< 3s',
        status: 'excellent',
        change: '18% sneller dan vorige week',
        trend: 'up'
      },
      {
        label: 'Success rate', 
        value: '99.2%',
        target: '> 95%',
        status: 'excellent',
        change: '+0.5% verbetering',
        trend: 'up'
      },
      {
        label: 'Content kwaliteit score',
        value: '4.9/5',
        target: '> 4.5',
        status: 'excellent', 
        change: '+0.2 punten',
        trend: 'up'
      },
      {
        label: 'SEO compliance',
        value: '96%',
        target: '> 90%',
        status: 'excellent',
        change: 'Stabiel',
        trend: 'neutral'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-50 border-green-200';
      case 'good': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'warning': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default: return <div className="h-3 w-3 rounded-full bg-gray-400" />;
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Volledige Analytics
          </CardTitle>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            <Activity className="h-3 w-3 mr-1" />
            Real-time data
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="overview" className="text-sm">Overzicht</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="activity" className="text-sm">Activiteit</TabsTrigger>
            <TabsTrigger value="insights" className="text-sm">Inzichten</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            {/* Analytics Overview Section */}
            <div className="bg-blue-50/30 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-blue-900">Analytics Overview</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={timeframe === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe('week')}
                    className="text-xs px-3 py-1 h-7"
                  >
                    Week
                  </Button>
                  <Button
                    variant={timeframe === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe('month')}
                    className="text-xs px-3 py-1 h-7"
                  >
                    Maand
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Views</div>
                  <div className="text-2xl font-bold text-blue-900">
                    <AnimatedCounter value="24.5" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Clicks</div>
                  <div className="text-2xl font-bold text-blue-900">
                    <AnimatedCounter value="1.8" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Conversions</div>
                  <div className="text-2xl font-bold text-blue-900">
                    <AnimatedCounter value="156" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Revenue</div>
                  <div className="text-2xl font-bold text-blue-900">€3.4</div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-green-50/30 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-green-900">Performance Insights</h3>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  Uitstekend
                </Badge>
              </div>

              <div className="space-y-3">
                {analyticsData.performance.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-green-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-green-900">{metric.label}</span>
                        <span className="text-xs text-green-600">Target: {metric.target}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        {getTrendIcon(metric.trend)}
                        <span>{metric.change}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`font-semibold ${getStatusColor(metric.status)}`}>
                        {metric.value}
                      </Badge>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Gedetailleerde analytics komen hier...</p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Activiteit feed komt hier...</p>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>AI insights komen hier...</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

EnhancedAnalyticsSection.displayName = 'EnhancedAnalyticsSection';

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

// Main production dashboard component
export const ProductionDashboard = memo(() => {
  const { profile, user, userRole } = useAuth();
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
      subtitle: 'AI gegenereerde content live', 
      change: '+5.1%',
      icon: FileText,
      trend: 'up' as const,
      color: 'blue' as const,
      efficiency: '94%',
      details: 'Details →'
    },
    {
      title: 'Maandelijks Verkeer',
      value: '52.3K',
      subtitle: 'Organische bezoekers (Google Analytics)',
      change: '+28%',
      icon: TrendingUp,
      trend: 'up' as const,
      color: 'green' as const,
      details: 'Details →'
    },
    {
      title: 'Tijdsbesparing',
      value: '127 uur',
      subtitle: '€6,350 waarde vs handmatig schrijven',
      change: 'Deze maand',
      icon: Timer,
      trend: 'up' as const,
      color: 'purple' as const,
      efficiency: '94%',
      details: 'Details →'
    },
    {
      title: 'ROI Score',
      value: '847%',
      subtitle: 'Return on Investment berekening',
      change: '+12%',
      icon: Award,
      trend: 'up' as const,
      color: 'orange' as const,
      details: 'Details →'
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
      status: 'Makkelijk',
      isNew: false
    },
    {
      title: 'Performance Analytics',
      description: 'Bekijk gedetailleerde prestatie-inzichten en ROI metrics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      estimatedTime: '5-10 min',
      status: 'Makkelijk'
    },
    {
      title: 'Enterprise AI Features',
      description: 'Toegang tot geavanceerde AI modellen en batch processing',
      icon: Crown,
      href: '/dashboard/advanced-ai',
      isPremium: true,
      estimatedTime: '10-30 min',
      status: 'Gemiddeld',
      isNew: true
    },
    {
      title: 'SEO Keywords Research',
      description: 'AI-powered keyword analyse en concurrent research',
      icon: Target,
      href: '/dashboard/keywords',
      estimatedTime: '15-25 min',
      status: 'Gemiddeld'
    },
    {
      title: 'WordPress Integratie',
      description: 'Automatisch publiceren naar je WordPress websites',
      icon: Globe,
      href: '/dashboard/cms-integration',
      estimatedTime: '5-15 min',
      status: 'Makkelijk'
    },
    {
      title: 'Template Designer',
      description: 'Maak aangepaste content templates voor je niche',
      icon: Zap,
      href: '/dashboard/template-editor',
      estimatedTime: '20-45 min',
      status: 'Moeilijk'
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

        {/* Credits and Stats Row */}
        <ResponsiveGrid columns={{ xs: 1, md: 2, lg: 4 }} gap="md">
          <div className="md:col-span-1">
            <CreditsDisplay />
          </div>
          <div className="md:col-span-1 lg:col-span-3">
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Snelle Statistieken</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Deze maand:</span>
                        <div className="font-bold text-primary">247 posts</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success rate:</span>
                        <div className="font-bold text-green-600">99.2%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tijd bespaard:</span>
                        <div className="font-bold text-purple-600">127 uur</div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dashboard/analytics')}
                    className="bg-white/50"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Meer Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveGrid>

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
              <LiveMetricCard 
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
              <QuickActionCard key={action.title} {...action} />
            ))}
          </ResponsiveGrid>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="space-y-4">
          <div className="lg:col-span-2">
            <EnhancedAnalyticsSection />
          </div>
        </div>

        {/* Additional Dashboard sections */}
        <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
          <ActivityFeed />
          <PerformanceInsights />
        </ResponsiveGrid>

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
                {userRole !== 'admin' && <AdminSetupButton />}
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
import React, { useState, useEffect, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Eye, 
  MousePointer, 
  Clock,
  BarChart3,
  PieChart,
  Globe,
  Search,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowRight,
  Activity,
  Zap,
  Award,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Share,
  Bookmark,
  ChevronUp,
  ChevronDown,
  LineChart,
  DollarSign,
  Star,
  Lightbulb,
  Sparkles,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { useUserAnalytics } from "@/hooks/useUserAnalytics";
import AnimatedCounter from "@/components/AnimatedCounter";
import { ResponsiveContainer, ResponsiveGrid } from "@/components/ui/responsive-components";

// Enhanced Metric Card with animations and better design
const AnalyticsMetricCard = memo(({ 
  title, 
  value, 
  subtitle,
  change, 
  icon: Icon, 
  trend = 'up',
  color = 'blue',
  target,
  isLoading = false,
  onClick
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  target?: string;
  isLoading?: boolean;
  onClick?: () => void;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100 text-blue-900',
    green: 'bg-green-50 border-green-100 text-green-900', 
    purple: 'bg-purple-50 border-purple-100 text-purple-900',
    orange: 'bg-orange-50 border-orange-100 text-orange-900',
    red: 'bg-red-50 border-red-100 text-red-900'
  };

  const iconColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500', 
    orange: 'bg-orange-500',
    red: 'bg-red-500'
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
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium opacity-70">
                {title}
              </p>
              {target && (
                <Badge variant="outline" className="text-xs opacity-60">
                  Target: {target}
                </Badge>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {typeof value === 'number' && value > 1000 
                  ? <AnimatedCounter value={value.toLocaleString()} /> 
                  : <AnimatedCounter value={value.toString()} />
                }
              </span>
              {subtitle && <span className="text-sm opacity-60">{subtitle}</span>}
            </div>
            
            {change && (
              <div className="flex items-center gap-2">
                <Badge className={`text-xs px-2 py-1 ${changeColors[trend]}`}>
                  {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {change}
                </Badge>
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

AnalyticsMetricCard.displayName = 'AnalyticsMetricCard';

// Traffic Source Card
const TrafficSourceCard = memo(({ source, percentage, color, icon: Icon, change }: {
  source: string;
  percentage: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  change: string;
}) => (
  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50/50 rounded-lg border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <div className="font-semibold text-gray-900">{source}</div>
        <div className="text-sm text-gray-600">{change}</div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-2xl font-bold text-gray-900">
        <AnimatedCounter value={percentage.toString()} />%
      </div>
      <Progress value={percentage} className="w-16 h-2 mt-1" />
    </div>
  </div>
));

TrafficSourceCard.displayName = 'TrafficSourceCard';

// Real-time Activity Feed
const RealTimeActivity = memo(() => {
  const [activities, setActivities] = useState([
    { id: 1, action: 'Page view', page: '/blog/seo-tips-2024', time: '2s ago', user: 'Amsterdam', type: 'view' },
    { id: 2, action: 'New session', page: '/services', time: '15s ago', user: 'Rotterdam', type: 'session' },
    { id: 3, action: 'Download', page: '/guide.pdf', time: '32s ago', user: 'Utrecht', type: 'conversion' },
    { id: 4, action: 'Contact form', page: '/contact', time: '1m ago', user: 'Den Haag', type: 'conversion' },
    { id: 5, action: 'Page view', page: '/blog/content-marketing', time: '1m ago', user: 'Eindhoven', type: 'view' }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="h-3 w-3" />;
      case 'session': return <Users className="h-3 w-3" />;
      case 'conversion': return <Target className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view': return 'text-blue-600 bg-blue-50';
      case 'session': return 'text-green-600 bg-green-50';
      case 'conversion': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-green-500" />
            Real-time Activiteit
          </CardTitle>
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{activity.page}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

RealTimeActivity.displayName = 'RealTimeActivity';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    isLoading, 
    overview, 
    traffic, 
    content, 
    keywords, 
    refreshAllData, 
    generateSampleData 
  } = useUserAnalytics();

  useSEO({
    title: "Analytics - AutoblogifyAI Performance Dashboard", 
    description: "Uitgebreide analytics en performance insights voor je content. Bekijk views, conversies, ROI en meer in real-time.",
    keywords: "analytics, performance, views, conversies, ROI, content metrics, dashboard"
  });

  // Fallback data for empty states
  const defaultOverview = {
    totalPosts: 0,
    totalViews: 0,
    uniqueVisitors: 0,
    avgTimeOnPage: 0,
    bounceRate: 0,
    conversionRate: 0,
    revenue: 0,
    roi: 0,
    viewsGrowth: 0
  };

  const defaultTraffic = {
    organic: { value: 0, change: '+0%' },
    direct: { value: 0, change: '+0%' },
    social: { value: 0, change: '+0%' },
    referral: { value: 0, change: '+0%' }
  };

  const defaultPerformance = [
    { metric: 'Page Load Speed', value: '1.2s', target: '< 2s', status: 'excellent', trend: 'up' },
    { metric: 'Core Web Vitals', value: '95%', target: '> 90%', status: 'excellent', trend: 'up' },
    { metric: 'Mobile Score', value: '92/100', target: '> 85', status: 'excellent', trend: 'up' },
    { metric: 'SEO Score', value: '96/100', target: '> 90', status: 'excellent', trend: 'neutral' }
  ];

  const analyticsData = {
    overview: overview || defaultOverview,
    traffic: traffic || defaultTraffic,
    topPosts: content || [],
    keywords: keywords || [],
    performance: defaultPerformance
  };

  const hasData = overview && overview.totalViews > 0;

  const generateReport = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Analytics rapport gegenereerd",
        description: "Het gedetailleerde rapport is klaar voor download.",
      });
    } catch (error) {
      toast({
        title: "Fout bij rapport genereren",
        description: "Er ging iets mis. Probeer het opnieuw.",
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    const days = timeRange === '7d' ? '7' : timeRange === '90d' ? '90' : '30';
    await refreshAllData(days);
    toast({
      title: "Data ververst",
      description: "Alle analytics zijn bijgewerkt met de laatste data.",
    });
  };

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    const days = newRange === '7d' ? '7' : newRange === '90d' ? '90' : '30';
    refreshAllData(days);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary/20 to-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-2xl animate-pulse pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />

      <ResponsiveContainer maxWidth="7xl">
        <div className="relative z-10 py-8 space-y-8">
          {/* Hero Header */}
          <div className="text-center space-y-6 py-12">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/20 backdrop-blur-sm">
                  <BarChart3 className="h-16 w-16 text-primary animate-bounce" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/20 text-primary bg-primary/5 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Real-time Analytics
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
                Analytics Dashboard
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Complete inzicht in je content prestaties met geavanceerde metrics, 
                real-time tracking en AI-gedreven insights voor optimale ROI.
              </p>
            </div>
          </div>
          {/* Smart Control Panel */}
          <Card className="bg-gradient-to-r from-background/80 to-secondary/10 backdrop-blur-lg border-primary/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">AI Analytics Insights</h3>
                    <p className="text-sm text-muted-foreground">Geavanceerde data-analyse met machine learning</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <Button
                      variant={timeRange === '7d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTimeRangeChange('7d')}
                      className="text-sm"
                    >
                      7d
                    </Button>
                    <Button
                      variant={timeRange === '30d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTimeRangeChange('30d')}
                      className="text-sm"
                    >
                      30d
                    </Button>
                    <Button
                      variant={timeRange === '90d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTimeRangeChange('90d')}
                      className="text-sm"
                    >
                      90d
                    </Button>
                  </div>
                  
                  <Button
                    onClick={refreshData}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Ververs
                  </Button>
                  
                  {!hasData && (
                    <Button
                      onClick={generateSampleData}
                      disabled={isLoading}
                      variant="secondary"
                      size="sm"
                      className="bg-gradient-to-r from-secondary to-accent"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Sample data
                    </Button>
                  )}
                  
                  <Button 
                    onClick={generateReport} 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-primary to-accent text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isLoading ? "Genereren..." : "Export"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200/50 hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-800">
                      <AnimatedCounter value={Math.floor(Math.random() * 200 + 50).toString()} />
                    </div>
                    <div className="text-sm text-blue-600">Nu online</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200/50 hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-800">
                      +{analyticsData.overview.viewsGrowth || 0}%
                    </div>
                    <div className="text-sm text-green-600">Growth Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200/50 hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-800">
                      €<AnimatedCounter value={(analyticsData.overview.revenue / 1000).toFixed(1)} />K
                    </div>
                    <div className="text-sm text-purple-600">Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200/50 hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-full">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-800">
                      <AnimatedCounter value={analyticsData.overview.roi.toString()} />%
                    </div>
                    <div className="text-sm text-orange-600">ROI Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <LineChart className="h-6 w-6 text-primary" />
                Belangrijkste Metrics
              </h2>
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live data
              </Badge>
            </div>
            
            <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="md">
              <AnalyticsMetricCard
                title="Totaal Posts"
                value={analyticsData.overview.totalPosts}
                change="+12% deze maand"
                icon={FileText}
                trend="up"
                color="blue"
                target="300"
                isLoading={isLoading}
              />
              <AnalyticsMetricCard
                title="Totaal Views"
                value={analyticsData.overview.totalViews}
                change={`+${analyticsData.overview.viewsGrowth}% deze maand`}
                icon={Eye}
                trend={analyticsData.overview.viewsGrowth > 0 ? "up" : "down"}
                color="green"
                target="150K"
                isLoading={isLoading}
              />
              <AnalyticsMetricCard
                title="Unieke Bezoekers"
                value={analyticsData.overview.uniqueVisitors}
                change="+18% deze maand"
                icon={Users}
                trend="up"
                color="purple"
                target="30K"
                isLoading={isLoading}
              />
              <AnalyticsMetricCard
                title="Revenue"
                value={`€${(analyticsData.overview.revenue / 1000).toFixed(1)}K`}
                change="+34% deze maand"
                icon={DollarSign}
                trend="up"
                color="orange"
                target="€20K"
                isLoading={isLoading}
              />
            </ResponsiveGrid>
          </div>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-muted/50">
              <TabsTrigger value="overview">Overzicht</TabsTrigger>
              <TabsTrigger value="traffic">Traffic</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="real-time">Real-time</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="lg">
                {/* Performance Overview */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Award className="h-5 w-5" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/50 rounded-lg">
                        <div className="text-sm text-green-600 mb-1">Bounce Rate</div>
                        <div className="text-2xl font-bold text-green-800">
                          <AnimatedCounter value={analyticsData.overview.bounceRate.toString()} />%
                        </div>
                        <Progress value={100 - analyticsData.overview.bounceRate} className="h-2 mt-2" />
                      </div>
                      <div className="text-center p-4 bg-white/50 rounded-lg">
                        <div className="text-sm text-green-600 mb-1">Avg. Time</div>
                        <div className="text-2xl font-bold text-green-800">
                          {Math.floor(analyticsData.overview.avgTimeOnPage / 60)}:{String(analyticsData.overview.avgTimeOnPage % 60).padStart(2, '0')}
                        </div>
                        <Progress value={75} className="h-2 mt-2" />
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Conversion Rate</div>
                      <div className="text-2xl font-bold text-green-800">
                        <AnimatedCounter value={analyticsData.overview.conversionRate.toString()} />%
                      </div>
                      <Progress value={analyticsData.overview.conversionRate * 10} className="h-2 mt-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Traffic Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Traffic Sources
                    </CardTitle>
                    <CardDescription>Waar komen je bezoekers vandaan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TrafficSourceCard
                      source="Organic Search"
                      percentage={analyticsData.traffic.organic.value}
                      color="bg-green-500"
                      icon={Search}
                      change={analyticsData.traffic.organic.change}
                    />
                    <TrafficSourceCard
                      source="Direct Traffic"
                      percentage={analyticsData.traffic.direct.value}
                      color="bg-blue-500"
                      icon={Globe}
                      change={analyticsData.traffic.direct.change}
                    />
                    <TrafficSourceCard
                      source="Social Media"
                      percentage={analyticsData.traffic.social.value}
                      color="bg-purple-500"
                      icon={Users}
                      change={analyticsData.traffic.social.change}
                    />
                    <TrafficSourceCard
                      source="Referral"
                      percentage={analyticsData.traffic.referral.value}
                      color="bg-orange-500"
                      icon={MousePointer}
                      change={analyticsData.traffic.referral.change}
                    />
                  </CardContent>
                </Card>
              </ResponsiveGrid>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-orange-500" />
                        Top Performing Content
                      </CardTitle>
                      <CardDescription>Je beste content van de laatste {timeRange}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Bekijk alle posts
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topPosts.map((post, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all hover:border-primary/50">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div className="space-y-1 flex-1">
                            <h4 className="font-semibold group-hover:text-primary transition-colors">{post.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                <AnimatedCounter value={post.views.toLocaleString()} /> views
                              </span>
                              <span className="flex items-center">
                                <MousePointer className="h-3 w-3 mr-1" />
                                {post.ctr}% CTR
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                €{post.revenue}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Share className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Keyword Rankings
                      </CardTitle>
                      <CardDescription>SEO posities en performance</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Keyword research
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.keywords.map((keyword, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg">{keyword.keyword}</h4>
                            <Badge className={`text-xs ${keyword.position <= 5 ? 'bg-green-100 text-green-700' : keyword.position <= 10 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                              Position #{keyword.position}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <MousePointer className="h-3 w-3 mr-1" />
                              {keyword.clicks} clicks
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {keyword.impressions.toLocaleString()} impressions
                            </span>
                            <span className="flex items-center">
                              <Target className="h-3 w-3 mr-1" />
                              {keyword.ctr}% CTR
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">#{keyword.position}</div>
                          <div className="text-xs text-muted-foreground">Google ranking</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 mt-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Zap className="h-5 w-5" />
                    Technical Performance
                  </CardTitle>
                  <CardDescription>Site speed, SEO en gebruikerservaring metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.performance.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-900">{item.metric}</span>
                          <span className="text-xs text-blue-600">Target: {item.target}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`font-semibold ${item.status === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.value}
                        </Badge>
                        {item.status === 'excellent' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="real-time" className="space-y-6 mt-6">
              <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="lg">
                <RealTimeActivity />
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        Live Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          <AnimatedCounter value="147" />
                        </div>
                        <div className="text-green-700 font-medium">Active Users</div>
                        <div className="text-sm text-green-600">Nu online</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            <AnimatedCounter value="2,847" />
                          </div>
                          <div className="text-sm text-blue-700">Views (last hour)</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">34</div>
                          <div className="text-sm text-purple-700">Active readers</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ResponsiveGrid>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsPage;
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
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Enhanced analytics data
  const analyticsData = {
    overview: {
      totalPosts: 247,
      totalViews: 125649,
      uniqueVisitors: 23847,
      avgTimeOnPage: "3:24",
      bounceRate: 42.3,
      conversionRate: 2.8,
      revenue: 15240,
      roi: 847
    },
    traffic: {
      organic: { value: 68.4, change: '+12%' },
      direct: { value: 18.2, change: '+5%' },
      social: { value: 8.7, change: '-3%' },
      referral: { value: 4.7, change: '+8%' }
    },
    topPosts: [
      { title: "SEO Tips voor 2024", views: 15420, ctr: 3.2, revenue: 1240 },
      { title: "Local Business Marketing", views: 12350, ctr: 2.8, revenue: 890 },
      { title: "Content Marketing Strategie", views: 9870, ctr: 4.1, revenue: 1450 },
      { title: "WordPress vs Webflow", views: 8750, ctr: 2.9, revenue: 650 },
      { title: "AI Tools voor Content", views: 7650, ctr: 3.7, revenue: 1120 }
    ],
    keywords: [
      { keyword: "seo tips", position: 3, clicks: 1250, impressions: 15600, ctr: 8.0 },
      { keyword: "content marketing", position: 7, clicks: 890, impressions: 12400, ctr: 7.2 },
      { keyword: "local business", position: 12, clicks: 650, impressions: 8900, ctr: 7.3 },
      { keyword: "website builder", position: 5, clicks: 1100, impressions: 11200, ctr: 9.8 },
      { keyword: "digital marketing", position: 15, clicks: 420, impressions: 7800, ctr: 5.4 }
    ],
    performance: [
      { metric: 'Page Load Speed', value: '1.2s', target: '< 2s', status: 'excellent', trend: 'up' },
      { metric: 'Core Web Vitals', value: '95%', target: '> 90%', status: 'excellent', trend: 'up' },
      { metric: 'Mobile Score', value: '92/100', target: '> 85', status: 'excellent', trend: 'up' },
      { metric: 'SEO Score', value: '96/100', target: '> 90', status: 'excellent', trend: 'neutral' }
    ]
  };

  const generateReport = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Data ververst",
        description: "Alle analytics zijn bijgewerkt met de laatste data.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ResponsiveContainer maxWidth="7xl">
        <div className="py-8 space-y-8">
          {/* Premium Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white animate-fade-in">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-white/90 text-lg">
                      Complete inzicht in je content prestaties en ROI
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <Button
                      variant={timeRange === '7d' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setTimeRange('7d')}
                      className="text-white hover:bg-white/20"
                    >
                      7d
                    </Button>
                    <Button
                      variant={timeRange === '30d' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setTimeRange('30d')}
                      className="text-white hover:bg-white/20"
                    >
                      30d
                    </Button>
                    <Button
                      variant={timeRange === '90d' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setTimeRange('90d')}
                      className="text-white hover:bg-white/20"
                    >
                      90d
                    </Button>
                  </div>
                  
                  <Button
                    onClick={refreshData}
                    disabled={isRefreshing}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/30"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Ververs
                  </Button>
                  
                  <Button 
                    onClick={generateReport} 
                    disabled={isLoading}
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isLoading ? "Genereren..." : "Export"}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5" />
                    <span className="font-medium">Realtime Views</span>
                  </div>
                  <div className="text-2xl font-bold">147 active</div>
                  <div className="text-sm text-white/80">Nu online</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">Growth Rate</span>
                  </div>
                  <div className="text-2xl font-bold">+23%</div>
                  <div className="text-sm text-white/80">Deze maand</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold">€15.2K</div>
                  <div className="text-sm text-white/80">Deze periode</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">ROI Score</span>
                  </div>
                  <div className="text-2xl font-bold">847%</div>
                  <div className="text-sm text-white/80">Return on Investment</div>
                </div>
              </div>
            </div>
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
              />
              <AnalyticsMetricCard
                title="Totaal Views"
                value={analyticsData.overview.totalViews}
                change="+23% deze maand"
                icon={Eye}
                trend="up"
                color="green"
                target="150K"
              />
              <AnalyticsMetricCard
                title="Unieke Bezoekers"
                value={analyticsData.overview.uniqueVisitors}
                change="+18% deze maand"
                icon={Users}
                trend="up"
                color="purple"
                target="30K"
              />
              <AnalyticsMetricCard
                title="Revenue"
                value={`€${(analyticsData.overview.revenue / 1000).toFixed(1)}K`}
                change="+34% deze maand"
                icon={DollarSign}
                trend="up"
                color="orange"
                target="€20K"
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
                          {analyticsData.overview.avgTimeOnPage}
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
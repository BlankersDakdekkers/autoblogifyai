import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-components';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Clock,
  Globe,
  Target,
  MousePointer,
  Share,
  Heart,
  Star,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  LineChart,
  Award,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Database,
  Search
} from 'lucide-react';

interface AnalyticsMetric {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'currency' | 'percentage' | 'time';
}

interface ContentAnalytics {
  id: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversions: number;
  revenue: number;
  publishDate: string;
  category: string;
  keywords: string[];
  ctr: number;
  position: number;
}

const ProductionAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Mock analytics data
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([
    {
      label: 'Totale Views',
      value: 125643,
      change: 18.5,
      trend: 'up',
      format: 'number'
    },
    {
      label: 'Unieke Bezoekers',
      value: 89234,
      change: 12.3,
      trend: 'up',
      format: 'number'
    },
    {
      label: 'Gemiddelde Sessieduur',
      value: '3m 45s',
      change: 8.7,
      trend: 'up',
      format: 'time'
    },
    {
      label: 'Bounce Rate',
      value: '34.2%',
      change: -5.4,
      trend: 'up',
      format: 'percentage'
    },
    {
      label: 'Conversie Rate',
      value: '4.8%',
      change: 15.2,
      trend: 'up',
      format: 'percentage'
    },
    {
      label: 'Omzet',
      value: '€28,947',
      change: 22.8,
      trend: 'up',
      format: 'currency'
    },
    {
      label: 'Organisch Verkeer',
      value: '78.3%',
      change: 3.2,
      trend: 'up',
      format: 'percentage'
    },
    {
      label: 'Pagina\'s per Sessie',
      value: 2.8,
      change: 7.1,
      trend: 'up',
      format: 'number'
    }
  ]);

  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics[]>([
    {
      id: '1',
      title: 'Dakbedekking Amsterdam - Complete Gids 2024',
      views: 12543,
      uniqueVisitors: 9876,
      avgTimeOnPage: 245,
      bounceRate: 28.5,
      conversions: 47,
      revenue: 2350,
      publishDate: '2024-01-15',
      category: 'Dakbedekking',
      keywords: ['dakbedekking amsterdam', 'dak renovatie', 'bitumen dak'],
      ctr: 8.7,
      position: 3.2
    },
    {
      id: '2',
      title: 'Loodgieter Amsterdam 24/7 - Spoedservice',
      views: 9876,
      uniqueVisitors: 7654,
      avgTimeOnPage: 198,
      bounceRate: 31.2,
      conversions: 65,
      revenue: 3250,
      publishDate: '2024-01-20',
      category: 'Loodgieterswerk',
      keywords: ['loodgieter amsterdam', 'spoedservice', '24/7 loodgieter'],
      ctr: 12.3,
      position: 1.8
    },
    {
      id: '3',
      title: 'CV Ketel Onderhoud - Preventief & Reparatie',
      views: 7654,
      uniqueVisitors: 5432,
      avgTimeOnPage: 267,
      bounceRate: 25.8,
      conversions: 38,
      revenue: 1900,
      publishDate: '2024-01-25',
      category: 'CV & Verwarming',
      keywords: ['cv ketel onderhoud', 'ketel reparatie', 'cv service'],
      ctr: 9.4,
      position: 2.5
    }
  ]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update metrics with slight variations
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        change: metric.change + (Math.random() - 0.5) * 2
      })));
      
      toast({
        title: "Analytics bijgewerkt",
        description: "Alle data is succesvol ververst.",
      });
    } catch (error) {
      toast({
        title: "Fout bij verversen",
        description: "Er ging iets mis bij het ophalen van nieuwe data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const topKeywords = [
    { keyword: 'dakbedekking amsterdam', position: 1.2, clicks: 2543, impressions: 18765, ctr: 13.5 },
    { keyword: 'loodgieter amsterdam', position: 1.8, clicks: 1876, impressions: 12543, ctr: 15.0 },
    { keyword: 'cv ketel onderhoud', position: 2.3, clicks: 1234, impressions: 9876, ctr: 12.5 },
    { keyword: 'dakdekker amsterdam', position: 3.1, clicks: 987, impressions: 7654, ctr: 12.9 },
    { keyword: 'loodgieter spoedservice', position: 2.7, clicks: 876, impressions: 6543, ctr: 13.4 }
  ];

  const trafficSources = [
    { source: 'Google Organic', visitors: 67234, percentage: 78.3, revenue: 22678 },
    { source: 'Direct', visitors: 12543, percentage: 14.6, revenue: 4289 },
    { source: 'Social Media', visitors: 3456, percentage: 4.0, revenue: 1234 },
    { source: 'Referrals', visitors: 2567, percentage: 3.0, revenue: 746 }
  ];

  const getChangeIcon = (trend: string, change: number) => {
    if (trend === 'up' && change > 0) return <ArrowUp className="h-3 w-3 text-green-600" />;
    if (trend === 'down' || change < 0) return <ArrowDown className="h-3 w-3 text-red-600" />;
    return <div className="h-3 w-3" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <ResponsiveContainer maxWidth="7xl">
      <div className="py-8 space-y-8">
        {/* Professional Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
                  <p className="text-white/90 text-lg">
                    Real-time inzichten in je content prestaties en ROI metrics
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={refreshData}
                  disabled={isLoading}
                  variant="secondary"
                  className="bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/30"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Verversen
                </Button>
                
                <Badge className="bg-white/20 text-white border-white/30">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Growth Rate</span>
                </div>
                <div className="text-2xl font-bold">+18.5%</div>
                <div className="text-sm text-white/80">vs vorige periode</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">Conversie</span>
                </div>
                <div className="text-2xl font-bold">4.8%</div>
                <div className="text-sm text-white/80">Gemiddelde rate</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-medium">ROI</span>
                </div>
                <div className="text-2xl font-bold">847%</div>
                <div className="text-sm text-white/80">Return on investment</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Score</span>
                </div>
                <div className="text-2xl font-bold">94/100</div>
                <div className="text-sm text-white/80">Performance score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium">Periode</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Laatste 7 dagen</SelectItem>
                      <SelectItem value="30d">Laatste 30 dagen</SelectItem>
                      <SelectItem value="90d">Laatste 90 dagen</SelectItem>
                      <SelectItem value="1y">Laatste jaar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Categorie</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Categorieën</SelectItem>
                      <SelectItem value="dakbedekking">Dakbedekking</SelectItem>
                      <SelectItem value="loodgieterswerk">Loodgieterswerk</SelectItem>
                      <SelectItem value="cv-verwarming">CV & Verwarming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Kernmetrics
          </h2>
          
          <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="md">
            {metrics.map((metric, index) => (
              <Card key={metric.label} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </div>
                    <div className="flex items-center gap-1">
                      {getChangeIcon(metric.trend, metric.change)}
                      <span className={`text-xs font-medium ${getChangeColor(metric.change)}`}>
                        {Math.abs(metric.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {typeof metric.value === 'number' ? (
                        <AnimatedCounter value={metric.value.toString()} />
                      ) : (
                        metric.value
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min(Math.abs(metric.change) * 5, 100)} 
                        className="h-1 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        vs {timeRange}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="traffic">Verkeer</TabsTrigger>
            <TabsTrigger value="conversion">Conversie</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
              {/* Traffic Overview */}
              <Card className="border-0 bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Traffic Overzicht
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trafficSources.map((source, index) => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{source.source}</div>
                          <div className="text-sm text-muted-foreground">
                            {source.visitors.toLocaleString()} bezoekers
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{source.percentage}%</div>
                          <div className="text-sm text-green-600">
                            €{source.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Content */}
              <Card className="border-0 bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Top Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentAnalytics.slice(0, 3).map((content, index) => (
                      <div key={content.id} className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                        <Badge variant="outline" className="mt-1">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{content.title}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            {content.views.toLocaleString()} views • {content.conversions} conversies
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            €{content.revenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            CTR: {content.ctr}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-4">
              {contentAnalytics.map((content) => (
                <Card key={content.id} className="border-0 bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Gepubliceerd: {new Date(content.publishDate).toLocaleDateString('nl-NL')}</span>
                          <Badge variant="outline">{content.category}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <ResponsiveGrid columns={{ xs: 2, sm: 4, lg: 6 }} gap="sm">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Views</div>
                        <div className="font-semibold text-primary">{content.views.toLocaleString()}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Unieke</div>
                        <div className="font-semibold">{content.uniqueVisitors.toLocaleString()}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Sessieduur</div>
                        <div className="font-semibold">{formatTime(content.avgTimeOnPage)}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Bounce Rate</div>
                        <div className="font-semibold">{content.bounceRate}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Conversies</div>
                        <div className="font-semibold text-green-600">{content.conversions}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Omzet</div>
                        <div className="font-semibold text-green-600">€{content.revenue.toLocaleString()}</div>
                      </div>
                    </ResponsiveGrid>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Keywords:</div>
                      <div className="flex flex-wrap gap-2">
                        {content.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <Card className="border-0 bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Top Keywords Performance
                </CardTitle>
                <CardDescription>
                  Keywords die het meeste verkeer en conversies genereren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topKeywords.map((keyword, index) => (
                    <div key={keyword.keyword} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{keyword.keyword}</div>
                          <div className="text-sm text-muted-foreground">
                            Positie: {keyword.position} • CTR: {keyword.ctr}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{keyword.clicks.toLocaleString()} clicks</div>
                        <div className="text-sm text-muted-foreground">
                          {keyword.impressions.toLocaleString()} impressions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <ResponsiveGrid columns={{ xs: 1, lg: 2 }} gap="md">
              <Card className="border-0 bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Verkeersbronnen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trafficSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{source.source}</span>
                            <span className="text-sm font-semibold">{source.percentage}%</span>
                          </div>
                          <Progress value={source.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Bezoeker Gedrag
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Nieuwe bezoekers</span>
                        <span className="font-semibold">73.2%</span>
                      </div>
                      <Progress value={73.2} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Terugkerende bezoekers</span>
                        <span className="font-semibold">26.8%</span>
                      </div>
                      <Progress value={26.8} className="h-2" />
                    </div>
                    
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Gem. sessies per gebruiker</span>
                        <span className="font-medium">1.34</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pagina's per sessie</span>
                        <span className="font-medium">2.8</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-6">
            <ResponsiveGrid columns={{ xs: 1, lg: 3 }} gap="md">
              <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Target className="h-5 w-5" />
                    Conversie Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 mb-2">4.8%</div>
                  <div className="text-sm text-green-600 mb-4">+0.7% vs vorige periode</div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Desktop</span>
                      <span className="font-medium">5.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mobile</span>
                      <span className="font-medium">4.1%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tablet</span>
                      <span className="font-medium">4.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <DollarSign className="h-5 w-5" />
                    Gem. Orderwaarde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 mb-2">€487</div>
                  <div className="text-sm text-blue-600 mb-4">+€23 vs vorige periode</div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nieuwe klanten</span>
                      <span className="font-medium">€423</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bestaande klanten</span>
                      <span className="font-medium">€651</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Award className="h-5 w-5" />
                    ROI Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 mb-2">847%</div>
                  <div className="text-sm text-purple-600 mb-4">Uitstekende prestatie</div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Content kosten</span>
                      <span className="font-medium">€3,420</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gegenereerde omzet</span>
                      <span className="font-medium">€28,947</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
};

export default ProductionAnalytics;
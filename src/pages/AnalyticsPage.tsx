import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Mock data - in real app this would come from analytics API
  const analyticsData = {
    overview: {
      totalPosts: 247,
      totalViews: 125649,
      uniqueVisitors: 23847,
      avgTimeOnPage: "3:24",
      bounceRate: 42.3,
      conversionRate: 2.8
    },
    traffic: {
      organic: 68.4,
      direct: 18.2,
      social: 8.7,
      referral: 4.7
    },
    topPosts: [
      { title: "SEO Tips voor 2024", views: 15420, ctr: 3.2 },
      { title: "Local Business Marketing", views: 12350, ctr: 2.8 },
      { title: "Content Marketing Strategie", views: 9870, ctr: 4.1 },
      { title: "WordPress vs Webflow", views: 8750, ctr: 2.9 },
      { title: "AI Tools voor Content", views: 7650, ctr: 3.7 }
    ],
    keywords: [
      { keyword: "seo tips", position: 3, clicks: 1250, impressions: 15600 },
      { keyword: "content marketing", position: 7, clicks: 890, impressions: 12400 },
      { keyword: "local business", position: 12, clicks: 650, impressions: 8900 },
      { keyword: "website builder", position: 5, clicks: 1100, impressions: 11200 },
      { keyword: "digital marketing", position: 15, clicks: 420, impressions: 7800 }
    ]
  };

  const generateReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Rapport gegenereerd",
        description: "Het analytics rapport is klaar voor download.",
      });
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Inzicht in je content prestaties en traffic
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTimeRange("7d")}>7 dagen</Button>
          <Button variant="outline" onClick={() => setTimeRange("30d")}>30 dagen</Button>
          <Button variant="outline" onClick={() => setTimeRange("90d")}>90 dagen</Button>
          <Button onClick={generateReport} disabled={isLoading}>
            {isLoading ? "Genereren..." : "Rapport Downloaden"}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% deze maand
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +23% deze maand
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unieke Bezoekers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18% deze maand
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversie Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2% deze maand
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="real-time">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="text-sm font-medium">{analyticsData.overview.bounceRate}%</span>
                </div>
                <Progress value={analyticsData.overview.bounceRate} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Time on Page</span>
                  <span className="text-sm font-medium">{analyticsData.overview.avgTimeOnPage}</span>
                </div>
                <Progress value={75} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="text-sm font-medium">{analyticsData.overview.conversionRate}%</span>
                </div>
                <Progress value={analyticsData.overview.conversionRate * 10} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between space-x-2">
                  {[65, 78, 82, 69, 85, 92, 88, 94, 87, 91, 96, 89, 93, 98].map((height, index) => (
                    <div key={index} className="bg-primary/20 flex-1 rounded-t" style={{ height: `${height}%` }} />
                  ))}
                </div>
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Traffic groei laatste 14 dagen
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Waar komen je bezoekers vandaan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-green-600" />
                    <span>Organic Search</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={analyticsData.traffic.organic} className="w-24 h-2" />
                    <span className="text-sm font-medium">{analyticsData.traffic.organic}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span>Direct</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={analyticsData.traffic.direct} className="w-24 h-2" />
                    <span className="text-sm font-medium">{analyticsData.traffic.direct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Social Media</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={analyticsData.traffic.social} className="w-24 h-2" />
                    <span className="text-sm font-medium">{analyticsData.traffic.social}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MousePointer className="h-4 w-4 text-orange-600" />
                    <span>Referral</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={analyticsData.traffic.referral} className="w-24 h-2" />
                    <span className="text-sm font-medium">{analyticsData.traffic.referral}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Je beste content van de laatste maand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPosts.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{post.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {post.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <MousePointer className="h-3 w-3 mr-1" />
                          {post.ctr}% CTR
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Rankings</CardTitle>
              <CardDescription>Posities en performance van je keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{keyword.keyword}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{keyword.clicks} clicks</span>
                        <span>{keyword.impressions.toLocaleString()} impressions</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">#{keyword.position}</div>
                      <div className="text-xs text-muted-foreground">positie</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="real-time" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">147</div>
                <p className="text-sm text-muted-foreground">Nu online</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Views (last hour)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">2,847</div>
                <p className="text-sm text-muted-foreground">+12% vs vorig uur</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">SEO Tips voor 2024</div>
                <p className="text-sm text-muted-foreground">34 active readers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
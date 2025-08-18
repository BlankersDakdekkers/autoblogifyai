import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Zap,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  Timer,
  BarChart3
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
  queueStatus: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);

      // Fetch system health
      const healthPromise = supabase.functions.invoke('health-check');
      
      // Fetch queue status
      const queuePromise = supabase.functions.invoke('queue-manager', {
        body: { action: 'status' }
      });

      // Fetch user stats
      const userStatsPromise = supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      // Fetch post stats
      const postStatsPromise = supabase
        .from('blog_posts')
        .select('id', { count: 'exact' });

      // Fetch recent activity
      const recentActivityPromise = supabase
        .from('system_health_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      const [healthResult, queueResult, userResult, postResult, activityResult] = await Promise.all([
        healthPromise,
        queuePromise,
        userStatsPromise,
        postStatsPromise,
        recentActivityPromise
      ]);

      const dashboardStats: DashboardStats = {
        totalUsers: userResult.count || 0,
        totalPosts: postResult.count || 0,
        systemHealth: healthResult.data?.overall_status || 'healthy',
        queueStatus: queueResult.data?.queue_status || {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0
        },
        recentActivity: activityResult.data?.map((log: any) => ({
          type: log.overall_status,
          message: `System status: ${log.overall_status}`,
          timestamp: log.timestamp
        })) || []
      };

      setStats(dashboardStats);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error Loading Dashboard",
        description: "Unable to fetch dashboard statistics.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processQueue = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('queue-manager', {
        body: { action: 'process' }
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Queue Processing Started",
        description: `Processing ${data.processed} jobs.`,
      });

      // Refresh stats
      fetchDashboardStats();
    } catch (error) {
      console.error('Error processing queue:', error);
      toast({
        title: "Queue Processing Failed",
        description: "Unable to process queue jobs.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchDashboardStats, 120000);
    return () => clearInterval(interval);
  }, []);

  const getSystemHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">System Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Performance Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-100 text-red-800">System Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management tools
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <Button 
            onClick={fetchDashboardStats}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      {stats?.systemHealth !== 'healthy' && (
        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats?.systemHealth === 'down' 
              ? "Critical system issues detected. Some services may be unavailable."
              : "System performance is degraded. Some operations may be slower than usual."
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {stats?.systemHealth === 'healthy' ? '100%' : 
               stats?.systemHealth === 'degraded' ? '75%' : '0%'}
            </div>
            {getSystemHealthBadge(stats?.systemHealth || 'healthy')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Generated articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Jobs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.queueStatus ? Object.values(stats.queueStatus).reduce((a, b) => a + b, 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.queueStatus?.pending || 0} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Queue Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Queue Management
                </CardTitle>
                <CardDescription>
                  Background job processing status
                </CardDescription>
              </div>
              <Button 
                onClick={processQueue}
                disabled={isLoading || !stats?.queueStatus?.pending}
                size="sm"
              >
                Process Queue
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.queueStatus && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-700">{stats.queueStatus.pending}</div>
                  <div className="text-sm text-blue-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <RefreshCw className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-yellow-700">{stats.queueStatus.processing}</div>
                  <div className="text-sm text-yellow-600">Processing</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-700">{stats.queueStatus.completed}</div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-red-700">{stats.queueStatus.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent System Activity
            </CardTitle>
            <CardDescription>
              Latest system health checks and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.type === 'healthy' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : activity.type === 'degraded' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{activity.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => window.open('/dashboard/admin/monitoring', '_blank')}
            >
              <Database className="h-6 w-6" />
              <span>System Monitoring</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => window.open('/dashboard/admin/customers', '_blank')}
            >
              <Users className="h-6 w-6" />
              <span>Customer Portal</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={processQueue}
              disabled={!stats?.queueStatus?.pending}
            >
              <Zap className="h-6 w-6" />
              <span>Process Queue</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
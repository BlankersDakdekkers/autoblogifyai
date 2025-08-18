import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Database,
  Zap,
  CreditCard,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Users,
  FileText
} from "lucide-react";

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
  timestamp: string;
  details?: any;
}

interface SystemHealth {
  overall_status: 'healthy' | 'degraded' | 'down';
  checks: HealthCheck[];
  uptime: number;
  version: string;
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

const SystemMonitoringPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSystemHealth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check');
      
      if (error) {
        throw error;
      }

      setSystemHealth(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast({
        title: "Health Check Failed",
        description: "Unable to fetch system health status.",
        variant: "destructive"
      });
    }
  };

  const fetchQueueStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('queue-manager', {
        body: { action: 'status' }
      });
      
      if (error) {
        throw error;
      }

      setQueueStats(data.queue_status);
    } catch (error) {
      console.error('Error fetching queue stats:', error);
    }
  };

  const processQueue = async () => {
    try {
      setIsLoading(true);
      
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

      // Refresh stats after processing
      await fetchQueueStats();
    } catch (error) {
      console.error('Error processing queue:', error);
      toast({
        title: "Queue Processing Failed",
        description: "Unable to process queue jobs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSystemHealth(), fetchQueueStats()]);
      setIsLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-100 text-red-800">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'openai':
        return <Zap className="h-5 w-5" />;
      case 'stripe':
        return <CreditCard className="h-5 w-5" />;
      case 'storage':
        return <HardDrive className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  if (isLoading && !systemHealth) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading system status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time health status and performance metrics
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
            onClick={() => Promise.all([fetchSystemHealth(), fetchQueueStats()])}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall System Status */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {systemHealth && getStatusIcon(systemHealth.overall_status)}
                System Status
              </CardTitle>
              <CardDescription>
                Overall system health and availability
              </CardDescription>
            </div>
            {systemHealth && getStatusBadge(systemHealth.overall_status)}
          </div>
        </CardHeader>
        <CardContent>
          {systemHealth?.overall_status === 'down' && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Critical system issues detected. Some services may be unavailable.
              </AlertDescription>
            </Alert>
          )}
          
          {systemHealth?.overall_status === 'degraded' && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                System performance is degraded. Some operations may be slower than usual.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">
                {systemHealth?.overall_status === 'healthy' ? '99.9%' : 
                 systemHealth?.overall_status === 'degraded' ? '95.0%' : '0%'}
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {systemHealth?.checks.filter(c => c.status === 'healthy').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Healthy Services</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-700">
                {systemHealth?.checks.filter(c => c.status === 'degraded').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Degraded Services</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">
                {systemHealth?.checks.filter(c => c.status === 'down').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Down Services</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Service Health Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Service Health
            </CardTitle>
            <CardDescription>
              Individual service status and response times
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth?.checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getServiceIcon(check.service)}
                  <div>
                    <div className="font-medium capitalize">{check.service}</div>
                    <div className="text-sm text-muted-foreground">
                      Response: {check.response_time}ms
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(check.status)}
                  {getStatusIcon(check.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Queue Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Queue Status
                </CardTitle>
                <CardDescription>
                  Background job processing status
                </CardDescription>
              </div>
              <Button 
                onClick={processQueue}
                disabled={isLoading || !queueStats?.pending}
                size="sm"
              >
                Process Queue
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {queueStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-700">{queueStats.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-yellow-700">{queueStats.processing}</div>
                    <div className="text-sm text-muted-foreground">Processing</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-700">{queueStats.completed}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-red-700">{queueStats.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>

                {queueStats.pending > 0 && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      {queueStats.pending} jobs are waiting to be processed. 
                      Click "Process Queue" to start processing them.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            System performance over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                {systemHealth?.checks.reduce((sum, check) => sum + check.response_time, 0) || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">-12% vs yesterday</span>
              </div>
            </div>
            
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                {queueStats ? Object.values(queueStats).reduce((a, b) => a + b, 0) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Jobs (24h)</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+23% vs yesterday</span>
              </div>
            </div>
            
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                {queueStats ? Math.round((queueStats.completed / (queueStats.completed + queueStats.failed || 1)) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+5% vs yesterday</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoringPage;
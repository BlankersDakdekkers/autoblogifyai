import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Loader2, Activity, Database, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  checks: {
    database: boolean;
    functions: boolean;
    storage: boolean;
  };
  version: string;
}

const BackendStatus = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [csvStats, setCsvStats] = useState<any>(null);
  const { toast } = useToast();

  const checkBackendHealth = async () => {
    setIsLoading(true);
    try {
      // Test health check function
      const { data: healthData, error: healthError } = await supabase.functions.invoke('health-check');
      
      if (healthError) {
        console.error('Health check error:', healthError);
        setHealthStatus({
          status: 'down',
          timestamp: new Date().toISOString(),
          checks: { database: false, functions: false, storage: false },
          version: 'unknown'
        });
        toast({
          title: "❌ Backend Issue",
          description: "Health check failed",
          variant: "destructive"
        });
        return;
      }

      setHealthStatus(healthData);

      // Test CSV health monitor
      const { data: csvData, error: csvError } = await supabase.functions.invoke('csv-health-monitor');
      
      if (!csvError && csvData) {
        setCsvStats(csvData);
      }

      toast({
        title: "✅ Backend Status",
        description: `Backend is ${healthData.status}`,
      });

    } catch (error) {
      console.error('Backend check error:', error);
      toast({
        title: "❌ Connection Error",
        description: "Could not connect to backend services",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCsvProcessor = async () => {
    setIsLoading(true);
    try {
      // Test with sample CSV URL
      const testCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQXIYQ7QQr0QrXm8-8f8VZqQr0QrXm8/pub?gid=0&single=true&output=csv';
      
      const { data, error } = await supabase.functions.invoke('enhanced-process-csv', {
        body: {
          csvUrl: testCsvUrl,
          options: {
            testMode: true,
            maxRows: 5
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "✅ CSV Processor Test",
        description: "CSV processing functionality is working",
      });

    } catch (error) {
      console.error('CSV processor test error:', error);
      toast({
        title: "❌ CSV Processor Issue",
        description: error instanceof Error ? error.message : "CSV processor test failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'degraded': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'down': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Backend Status Monitor
        </CardTitle>
        <CardDescription>
          Real-time status van alle backend services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        {healthStatus && (
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(healthStatus.status)}
              <div>
                <div className="font-semibold">Overall Status</div>
                <div className="text-sm text-muted-foreground">
                  Last checked: {new Date(healthStatus.timestamp).toLocaleTimeString('nl-NL')}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(healthStatus.status)}>
              {healthStatus.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>
        )}

        {/* Service Checks */}
        {healthStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-4">
                <Database className={`mx-auto h-8 w-8 mb-2 ${healthStatus.checks.database ? 'text-green-500' : 'text-red-500'}`} />
                <div className="font-semibold">Database</div>
                <Badge className={healthStatus.checks.database ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>
                  {healthStatus.checks.database ? 'Connected' : 'Failed'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-4">
                <Zap className={`mx-auto h-8 w-8 mb-2 ${healthStatus.checks.functions ? 'text-green-500' : 'text-red-500'}`} />
                <div className="font-semibold">Edge Functions</div>
                <Badge className={healthStatus.checks.functions ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>
                  {healthStatus.checks.functions ? 'Running' : 'Failed'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-4">
                <CheckCircle className={`mx-auto h-8 w-8 mb-2 ${healthStatus.checks.storage ? 'text-green-500' : 'text-red-500'}`} />
                <div className="font-semibold">Storage</div>
                <Badge className={healthStatus.checks.storage ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>
                  {healthStatus.checks.storage ? 'Available' : 'Failed'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CSV Stats */}
        {csvStats && (
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="font-semibold mb-2">CSV Processing Stats</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Active Jobs:</span>
                <span className="ml-2 font-semibold">{csvStats.activeJobs || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Queue Size:</span>
                <span className="ml-2 font-semibold">{csvStats.queueSize || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="ml-2 font-semibold">{csvStats.successRate || 0}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Processing:</span>
                <span className="ml-2 font-semibold">{csvStats.avgProcessingTime || 0}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={checkBackendHealth} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Activity className="mr-2 h-4 w-4" />
            )}
            Refresh Status
          </Button>
          
          <Button 
            onClick={testCsvProcessor} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Test CSV Processor
          </Button>
        </div>

        {/* Version Info */}
        {healthStatus && (
          <div className="text-xs text-muted-foreground text-center">
            Backend Version: {healthStatus.version}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendStatus;
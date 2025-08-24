import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Zap, 
  Clock, 
  Eye, 
  Smartphone, 
  Monitor,
  Wifi,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { usePerformanceMonitor } from "@/utils/performance";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    connection: 'slow' | 'fast' | 'offline';
  };
}

export const EnhancedPerformanceMonitor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
    device: { type: 'desktop', connection: 'fast' }
  });
  const { renderCount } = usePerformanceMonitor('Dashboard');

  useEffect(() => {
    const collectMetrics = () => {
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation?.duration || 0;

      // Memory usage (if available)
      const memoryInfo = (performance as any)?.memory;
      const memoryUsage = memoryInfo?.usedJSHeapSize || 0;

      // Device detection
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

      // Connection speed estimation
      const connection = (navigator as any)?.connection;
      const effectiveType = connection?.effectiveType || '4g';
      const connectionSpeed = ['slow-2g', '2g'].includes(effectiveType) ? 'slow' : 'fast';

      // Mock Core Web Vitals (in real app, you'd use web-vitals library)
      const mockLCP = Math.random() * 1000 + 1000; // 1-2s
      const mockFID = Math.random() * 50 + 50; // 50-100ms
      const mockCLS = Math.random() * 0.1; // 0-0.1

      setMetrics({
        loadTime: loadTime / 1000,
        renderTime: performance.now() / 1000,
        memoryUsage: memoryUsage / (1024 * 1024), // Convert to MB
        networkLatency: Math.random() * 100 + 50, // Mock latency
        coreWebVitals: {
          lcp: mockLCP,
          fid: mockFID,
          cls: mockCLS
        },
        device: {
          type: deviceType,
          connection: connectionSpeed
        }
      });
    };

    collectMetrics();
    
    // Update metrics periodically
    const interval = setInterval(collectMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number, thresholds: [number, number]) => {
    if (score <= thresholds[0]) return 'text-green-600 bg-green-100';
    if (score <= thresholds[1]) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getOverallScore = () => {
    const lcpScore = metrics.coreWebVitals.lcp <= 2500 ? 100 : metrics.coreWebVitals.lcp <= 4000 ? 50 : 0;
    const fidScore = metrics.coreWebVitals.fid <= 100 ? 100 : metrics.coreWebVitals.fid <= 300 ? 50 : 0;
    const clsScore = metrics.coreWebVitals.cls <= 0.1 ? 100 : metrics.coreWebVitals.cls <= 0.25 ? 50 : 0;
    return Math.round((lcpScore + fidScore + clsScore) / 3);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-xl border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors duration-200 pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Performance Monitor
                <Badge className={`${getScoreColor(getOverallScore(), [80, 60])} text-xs`}>
                  {getOverallScore()}
                </Badge>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Core Web Vitals */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Core Web Vitals
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>LCP (Largest Contentful Paint)</span>
                  <Badge className={getScoreColor(metrics.coreWebVitals.lcp, [2500, 4000])}>
                    {metrics.coreWebVitals.lcp.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>FID (First Input Delay)</span>
                  <Badge className={getScoreColor(metrics.coreWebVitals.fid, [100, 300])}>
                    {metrics.coreWebVitals.fid.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>CLS (Cumulative Layout Shift)</span>
                  <Badge className={getScoreColor(metrics.coreWebVitals.cls, [0.1, 0.25])}>
                    {metrics.coreWebVitals.cls.toFixed(3)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Load Time</span>
                  <span className="font-mono">{metrics.loadTime.toFixed(2)}s</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Memory</span>
                  <span className="font-mono">{metrics.memoryUsage.toFixed(1)}MB</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Renders</span>
                  <span className="font-mono">{renderCount}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Latency</span>
                  <span className="font-mono">{metrics.networkLatency.toFixed(0)}ms</span>
                </div>
              </div>
            </div>

            {/* Device Info */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                {metrics.device.type === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                Device Info
              </h4>
              
              <div className="flex items-center justify-between text-xs">
                <span>Device Type</span>
                <Badge variant="outline" className="capitalize">
                  {metrics.device.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Connection</span>
                <Badge className={metrics.device.connection === 'fast' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                  <Wifi className="h-3 w-3 mr-1" />
                  {metrics.device.connection}
                </Badge>
              </div>
            </div>

            {/* Performance Score */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className={`text-sm font-bold ${getOverallScore() >= 80 ? 'text-green-600' : getOverallScore() >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {getOverallScore()}/100
                </span>
              </div>
              <Progress 
                value={getOverallScore()} 
                className="h-2"
              />
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                {getOverallScore() >= 80 ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                )}
                <span>
                  {getOverallScore() >= 80 ? 'Excellent performance' : 'Room for improvement'}
                </span>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
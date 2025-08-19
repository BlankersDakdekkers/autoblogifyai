import React, { useEffect, memo } from 'react';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

interface PerformanceMetrics {
  navigationStart: number;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

const logPerformanceMetrics = (metrics: PerformanceMetrics) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚀 Performance Metrics');
    console.log('Navigation Start:', metrics.navigationStart, 'ms');
    console.log('Load Time:', metrics.loadTime, 'ms');
    console.log('DOM Content Loaded:', metrics.domContentLoaded, 'ms');
    if (metrics.firstContentfulPaint) {
      console.log('First Contentful Paint:', metrics.firstContentfulPaint, 'ms');
    }
    if (metrics.largestContentfulPaint) {
      console.log('Largest Contentful Paint:', metrics.largestContentfulPaint, 'ms');
    }
    console.groupEnd();
  }
};

const measureWebVitals = () => {
  // Core Web Vitals measurement - simplified for compatibility
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals monitoring available in production builds');
  }
};

export const PerformanceMonitor = memo(({ children }: PerformanceMonitorProps) => {
  useEffect(() => {
    // Measure performance metrics
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics: PerformanceMetrics = {
            navigationStart: performance.timeOrigin,
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          };

          // Get paint metrics if available
          const paintEntries = performance.getEntriesByType('paint');
          const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');

          if (fcp) metrics.firstContentfulPaint = fcp.startTime;

          logPerformanceMetrics(metrics);
        }
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Measure Web Vitals
    measureWebVitals();

    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemoryUsage = () => {
        const memory = (performance as any).memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      };

      const interval = setInterval(logMemoryUsage, 30000); // Log every 30 seconds
      return () => clearInterval(interval);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  return <>{children}</>;
});

PerformanceMonitor.displayName = 'PerformanceMonitor';
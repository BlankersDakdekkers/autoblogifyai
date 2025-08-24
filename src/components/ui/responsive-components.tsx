import { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/utils/performance';
import { useIsMobile, useResponsiveColumns } from '@/utils/responsive';

// Responsive container component
export const ResponsiveContainer = ({ 
  children, 
  className = "",
  maxWidth = "7xl" 
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-${maxWidth} ${isMobile ? 'space-y-4' : 'space-y-6'} ${className}`}>
      {children}
    </div>
  );
};

// Responsive grid component
export const ResponsiveGrid = ({
  children,
  columns,
  gap = 'md',
  className = ""
}: {
  children: React.ReactNode;
  columns: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const getColumns = useResponsiveColumns();
  const columnCount = getColumns(columns);
  
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8'
  };

  return (
    <div 
      className={`grid ${gapClasses[gap]} ${className}`}
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
};

// Performance-optimized component wrapper
export const OptimizedComponent = ({ 
  children, 
  name,
  lazyLoad = false 
}: {
  children: React.ReactNode;
  name: string;
  lazyLoad?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  usePerformanceMonitor(name);

  useEffect(() => {
    if (!lazyLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector(`[data-component="${name}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [name, lazyLoad]);

  if (!isVisible) {
    return (
      <div 
        data-component={name}
        className="min-h-[200px] flex items-center justify-center bg-muted/20 animate-pulse rounded-lg"
      >
        <div className="text-sm text-muted-foreground">Loading {name}...</div>
      </div>
    );
  }

  return <div data-component={name}>{children}</div>;
};
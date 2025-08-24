import { useState, useEffect, useCallback } from 'react';

// Breakpoint definitions matching Tailwind CSS
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Hook for responsive breakpoints
export const useBreakpoint = (breakpoint: Breakpoint) => {
  const [isAbove, setIsAbove] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    
    const handleChange = () => setIsAbove(mediaQuery.matches);
    handleChange(); // Set initial value
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return isAbove;
};

// Hook for current breakpoint
export const useCurrentBreakpoint = (): Breakpoint => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS['2xl']) setCurrentBreakpoint('2xl');
      else if (width >= BREAKPOINTS.xl) setCurrentBreakpoint('xl');
      else if (width >= BREAKPOINTS.lg) setCurrentBreakpoint('lg');
      else if (width >= BREAKPOINTS.md) setCurrentBreakpoint('md');
      else if (width >= BREAKPOINTS.sm) setCurrentBreakpoint('sm');
      else setCurrentBreakpoint('xs');
    };

    updateBreakpoint();
    
    const handleResize = () => updateBreakpoint();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return currentBreakpoint;
};

// Hook for mobile detection
export const useIsMobile = () => {
  return useBreakpoint('md') === false;
};

// Hook for optimal image sizing based on screen
export const useOptimalImageSize = () => {
  const currentBreakpoint = useCurrentBreakpoint();
  const isMobile = useIsMobile();

  return useCallback((baseWidth: number, baseHeight: number) => {
    const scale = isMobile ? 0.8 : currentBreakpoint === 'sm' ? 0.9 : 1;
    
    return {
      width: Math.round(baseWidth * scale),
      height: Math.round(baseHeight * scale),
      quality: isMobile ? 80 : 90, // Lower quality for mobile to save bandwidth
      format: 'webp' as const,
    };
  }, [currentBreakpoint, isMobile]);
};

// Hook for responsive grid columns
export const useResponsiveColumns = () => {
  const currentBreakpoint = useCurrentBreakpoint();
  
  const getColumns = useCallback((config: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  }) => {
    const { xs = 1, sm = 1, md = 2, lg = 3, xl = 4, '2xl': xl2 = 4 } = config;
    
    switch (currentBreakpoint) {
      case 'xs': return xs;
      case 'sm': return sm;
      case 'md': return md;
      case 'lg': return lg;
      case 'xl': return xl;
      case '2xl': return xl2;
      default: return md;
    }
  }, [currentBreakpoint]);

  return getColumns;
};

// Hook for viewport dimensions with debouncing
export const useViewportDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events for performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return dimensions;
};

export default {
  useBreakpoint,
  useCurrentBreakpoint,
  useIsMobile,
  useOptimalImageSize,
  useResponsiveColumns,
  useViewportDimensions,
};
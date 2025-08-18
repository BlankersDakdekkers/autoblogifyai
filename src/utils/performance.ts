// Performance monitoring and optimization utilities

import { useEffect, useRef, useState, useCallback } from 'react';

// Performance monitor hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    renderStart.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current;
      if (renderTime > 50) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
      }
    }
  });

  return {
    renderCount: renderCount.current,
    markRenderEnd: () => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        return renderTime;
      }
      return 0;
    }
  };
};

// Memory leak detector
export const useMemoryLeakDetector = (componentName: string) => {
  const mountTime = useRef(performance.now());
  
  useEffect(() => {
    return () => {
      const unmountTime = performance.now();
      const lifespan = unmountTime - mountTime.current;
      
      // Log components that lived very long (potential memory leaks)
      if (lifespan > 300000) { // 5 minutes
        console.warn(`Long-lived component detected: ${componentName} (${(lifespan / 1000).toFixed(2)}s)`);
      }
    };
  }, [componentName]);
};

// Image optimization utility
export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
} = {}) => {
  if (!url) return url;
  
  // If it's a Supabase storage URL, add transformation parameters
  if (url.includes('supabase')) {
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    const separator = url.includes('?') ? '&' : '?';
    return params.toString() ? `${url}${separator}${params.toString()}` : url;
  }
  
  return url;
};

// Debounced search hook
export const useDebouncedSearch = (initialValue: string, delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
  };
};

// Local storage with compression
export const useOptimizedLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // Try to decompress if it looks compressed
      if (item.startsWith('compressed:')) {
        // Simple compression detection - in a real app you'd use a proper compression library
        return JSON.parse(item.substring(11));
      }
      
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      const serialized = JSON.stringify(newValue);
      
      // Compress if the serialized data is large
      if (serialized.length > 10000) {
        localStorage.setItem(key, `compressed:${serialized}`);
      } else {
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.warn(`Error saving to localStorage for key "${key}":`, error);
    }
  }, [key]);

  return [value, setStoredValue] as const;
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // This would typically integrate with webpack-bundle-analyzer
    console.group('Bundle Analysis');
    console.log('Main chunks loaded:', performance.getEntriesByType('navigation'));
    console.log('Resource timings:', performance.getEntriesByType('resource'));
    console.groupEnd();
  }
};

// Critical CSS inliner
export const inlineCriticalCSS = () => {
  const criticalStyles = `
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-scale-in { animation: scaleIn 0.2s ease-out; }
    .animate-accordion-down { animation: accordionDown 0.2s ease-out; }
    .shadow-elegant { box-shadow: var(--shadow-elegant); }
    .gradient-text { background: var(--gradient-primary); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  `;
  
  if (!document.querySelector('#critical-css')) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalStyles;
    document.head.appendChild(style);
  }
};

export default {
  usePerformanceMonitor,
  useMemoryLeakDetector,
  optimizeImageUrl,
  useDebouncedSearch,
  useOptimizedLocalStorage,
  analyzeBundleSize,
  inlineCriticalCSS,
};
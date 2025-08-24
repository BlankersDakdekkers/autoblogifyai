import { useEffect, useRef, useCallback, useState } from 'react';
import { usePerformanceMonitor } from '@/utils/performance';

// Hook for component lazy loading and intersection observer
export const useLazyLoading = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Hook for optimized image loading
export const useOptimizedImages = () => {
  const loadImage = useCallback((src: string, options = {}) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      // Add loading attributes for better performance
      img.loading = 'lazy';
      img.decoding = 'async';
      
      img.src = src;
    });
  }, []);

  const preloadImage = useCallback((src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  return { loadImage, preloadImage };
};

// Hook for debounced search with performance tracking
export const useOptimizedSearch = (delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const performanceRef = useRef<number>();

  usePerformanceMonitor('OptimizedSearch');

  const updateSearchTerm = useCallback((term: string) => {
    performanceRef.current = performance.now();
    setSearchTerm(term);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
      
      // Log search performance
      if (performanceRef.current) {
        const duration = performance.now() - performanceRef.current;
        if (duration > 100) {
          console.warn(`Slow search detected: ${duration}ms for "${term}"`);
        }
      }
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm
  };
};

// Hook for virtualized lists (for large datasets)
export const useVirtualizedList = (
  items: any[], 
  itemHeight: number, 
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll,
    visibleStart,
    visibleEnd
  };
};

// Hook for optimized animations
export const useOptimizedAnimations = () => {
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const animate = useCallback((
    element: HTMLElement,
    keyframes: Keyframe[],
    options?: KeyframeAnimationOptions
  ) => {
    if (prefersReducedMotion.current) {
      // Skip animations for users who prefer reduced motion
      return Promise.resolve();
    }

    return element.animate(keyframes, {
      duration: 300,
      easing: 'ease-out',
      fill: 'both',
      ...options
    }).finished;
  }, []);

  const fadeIn = useCallback((element: HTMLElement, duration = 300) => {
    return animate(element, [
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration });
  }, [animate]);

  const slideIn = useCallback((element: HTMLElement, direction = 'left', duration = 300) => {
    const transform = direction === 'left' 
      ? ['translateX(-100%)', 'translateX(0)']
      : ['translateX(100%)', 'translateX(0)'];
    
    return animate(element, [
      { transform: transform[0] },
      { transform: transform[1] }
    ], { duration });
  }, [animate]);

  const scale = useCallback((element: HTMLElement, from = 0.9, to = 1, duration = 200) => {
    return animate(element, [
      { transform: `scale(${from})`, opacity: 0 },
      { transform: `scale(${to})`, opacity: 1 }
    ], { duration });
  }, [animate]);

  return {
    animate,
    fadeIn,
    slideIn,
    scale,
    prefersReducedMotion: prefersReducedMotion.current
  };
};

// Hook for resource cleanup and memory management
export const useCleanup = () => {
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervals = useRef<Set<NodeJS.Timeout>>(new Set());
  const listeners = useRef<Set<() => void>>(new Set());

  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      callback();
      timeouts.current.delete(timeout);
    }, delay);
    
    timeouts.current.add(timeout);
    return timeout;
  }, []);

  const addInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    intervals.current.add(interval);
    return interval;
  }, []);

  const addListener = useCallback((element: EventTarget, event: string, handler: EventListener) => {
    element.addEventListener(event, handler);
    const cleanup = () => element.removeEventListener(event, handler);
    listeners.current.add(cleanup);
    return cleanup;
  }, []);

  useEffect(() => {
    return () => {
      // Clean up all timeouts
      timeouts.current.forEach(timeout => clearTimeout(timeout));
      timeouts.current.clear();

      // Clean up all intervals
      intervals.current.forEach(interval => clearTimeout(interval));
      intervals.current.clear();

      // Clean up all event listeners
      listeners.current.forEach(cleanup => cleanup());
      listeners.current.clear();
    };
  }, []);

  return {
    addTimeout,
    addInterval,
    addListener
  };
};

export default {
  useLazyLoading,
  useOptimizedImages,
  useOptimizedSearch,
  useVirtualizedList,
  useOptimizedAnimations,
  useCleanup
};
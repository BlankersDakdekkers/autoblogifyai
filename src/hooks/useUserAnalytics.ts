import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsOverview {
  totalPosts: number;
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  roi: number;
  viewsGrowth: number;
  dailyData: any[];
}

interface TrafficSources {
  organic: { value: number; change: string };
  direct: { value: number; change: string };
  social: { value: number; change: string };
  referral: { value: number; change: string };
}

interface ContentPerformance {
  title: string;
  views: number;
  ctr: number;
  revenue: number;
}

interface KeywordPerformance {
  keyword: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

export const useUserAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [traffic, setTraffic] = useState<TrafficSources | null>(null);
  const [content, setContent] = useState<ContentPerformance[]>([]);
  const [keywords, setKeywords] = useState<KeywordPerformance[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const callAnalyticsFunction = async (action: string, timeRange: string = '30') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('user-analytics', {
        body: {},
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error calling ${action}:`, error);
      toast({
        title: "Fout bij het laden van analytics",
        description: "Er ging iets mis bij het ophalen van de data.",
        variant: "destructive"
      });
      return null;
    }
  };

  const getOverview = async (timeRange: string = '30') => {
    setIsLoading(true);
    try {
      const result = await supabase.functions.invoke('user-analytics', {
        body: { action: 'get-overview', timeRange },
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });

      if (result.data?.success) {
        setOverview(result.data.data);
      }
    } catch (error) {
      console.error('Error getting overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrafficSources = async (timeRange: string = '30') => {
    try {
      const result = await supabase.functions.invoke('user-analytics', {
        body: { action: 'get-traffic', timeRange },
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });

      if (result.data?.success) {
        setTraffic(result.data.data);
      }
    } catch (error) {
      console.error('Error getting traffic sources:', error);
    }
  };

  const getContentPerformance = async (timeRange: string = '30') => {
    try {
      const result = await supabase.functions.invoke('user-analytics', {
        body: { action: 'get-content', timeRange },
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });

      if (result.data?.success) {
        setContent(result.data.data);
      }
    } catch (error) {
      console.error('Error getting content performance:', error);
    }
  };

  const getKeywordPerformance = async (timeRange: string = '30') => {
    try {
      const result = await supabase.functions.invoke('user-analytics', {
        body: { action: 'get-keywords', timeRange },
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });

      if (result.data?.success) {
        setKeywords(result.data.data);
      }
    } catch (error) {
      console.error('Error getting keyword performance:', error);
    }
  };

  const generateSampleData = async () => {
    setIsLoading(true);
    try {
      const result = await supabase.functions.invoke('user-analytics', {
        body: { action: 'generate-sample' },
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });

      if (result.data?.success) {
        toast({
          title: "Sample data gegenereerd",
          description: "Er is voorbeelddata aangemaakt voor je analytics.",
        });
        // Refresh data after generating samples
        await refreshAllData('30');
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAllData = async (timeRange: string = '30') => {
    if (!user) return;
    
    setIsLoading(true);
    await Promise.all([
      getOverview(timeRange),
      getTrafficSources(timeRange),
      getContentPerformance(timeRange),
      getKeywordPerformance(timeRange)
    ]);
    setIsLoading(false);
  };

  // Load initial data when user is available
  useEffect(() => {
    if (user) {
      refreshAllData('30');
    }
  }, [user]);

  return {
    isLoading,
    overview,
    traffic,
    content,
    keywords,
    refreshAllData,
    generateSampleData
  };
};
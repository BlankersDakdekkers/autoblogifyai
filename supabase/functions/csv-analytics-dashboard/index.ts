import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, timeRange = '7d', metrics = [] } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader?.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user authentication if userId is provided
    if (userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user || user.id !== userId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const dashboardData = await generateDashboardData(supabase, userId, timeRange, metrics);

    return new Response(
      JSON.stringify(dashboardData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateDashboardData(supabase: any, userId?: string, timeRange: string = '7d', requestedMetrics: string[] = []) {
  const timeRangeMap: { [key: string]: number } = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30,
    '90d': 24 * 90
  };

  const hoursBack = timeRangeMap[timeRange] || 24 * 7;
  const fromDate = new Date(Date.now() - (hoursBack * 60 * 60 * 1000)).toISOString();

  const dashboard: any = {
    time_range: timeRange,
    generated_at: new Date().toISOString(),
    user_id: userId || 'system'
  };

  // Base query conditions
  const baseQuery = userId ? 
    supabase.from('csv_processing_analytics').select('*').eq('user_id', userId) :
    supabase.from('csv_processing_analytics').select('*');

  try {
    // 1. Processing Overview
    if (!requestedMetrics.length || requestedMetrics.includes('overview')) {
      const { data: analytics } = await baseQuery
        .gte('processing_started_at', fromDate);

      const totalJobs = analytics?.length || 0;
      const completedJobs = analytics?.filter(a => a.processing_completed_at).length || 0;
      const totalRowsProcessed = analytics?.reduce((sum, a) => sum + (a.rows_processed || 0), 0) || 0;
      const totalRowsFailed = analytics?.reduce((sum, a) => sum + (a.rows_failed || 0), 0) || 0;
      const totalCreditsUsed = analytics?.reduce((sum, a) => sum + (a.credits_consumed || 0), 0) || 0;

      dashboard.overview = {
        total_jobs: totalJobs,
        completed_jobs: completedJobs,
        success_rate: totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : '0',
        total_rows_processed: totalRowsProcessed,
        total_rows_failed: totalRowsFailed,
        accuracy_rate: (totalRowsProcessed + totalRowsFailed) > 0 ? 
          ((totalRowsProcessed / (totalRowsProcessed + totalRowsFailed)) * 100).toFixed(1) : '0',
        total_credits_consumed: totalCreditsUsed
      };
    }

    // 2. Performance Metrics
    if (!requestedMetrics.length || requestedMetrics.includes('performance')) {
      const { data: performanceData } = await baseQuery
        .gte('processing_started_at', fromDate)
        .not('total_processing_time_seconds', 'is', null);

      if (performanceData && performanceData.length > 0) {
        const avgProcessingTime = performanceData.reduce((sum, p) => 
          sum + (p.total_processing_time_seconds || 0), 0) / performanceData.length;
        
        const avgTimePerRow = performanceData.reduce((sum, p) => {
          const timePerRow = (p.total_processing_time_seconds || 0) / Math.max(p.rows_processed || 1, 1);
          return sum + timePerRow;
        }, 0) / performanceData.length;

        const throughput = performanceData.reduce((sum, p) => {
          const rowsPerSecond = (p.rows_processed || 0) / Math.max(p.total_processing_time_seconds || 1, 1);
          return sum + rowsPerSecond;
        }, 0) / performanceData.length;

        dashboard.performance = {
          avg_processing_time_seconds: Math.round(avgProcessingTime),
          avg_time_per_row_seconds: avgTimePerRow.toFixed(2),
          avg_throughput_rows_per_second: throughput.toFixed(2),
          sample_size: performanceData.length
        };
      }
    }

    // 3. CMS Publishing Stats
    if (!requestedMetrics.length || requestedMetrics.includes('cms')) {
      const { data: cmsData } = await baseQuery
        .gte('processing_started_at', fromDate)
        .gt('cms_publications_attempted', 0);

      const totalAttempted = cmsData?.reduce((sum, c) => sum + (c.cms_publications_attempted || 0), 0) || 0;
      const totalSuccessful = cmsData?.reduce((sum, c) => sum + (c.cms_publications_successful || 0), 0) || 0;

      dashboard.cms_publishing = {
        total_attempted: totalAttempted,
        total_successful: totalSuccessful,
        success_rate: totalAttempted > 0 ? ((totalSuccessful / totalAttempted) * 100).toFixed(1) : '0',
        jobs_with_cms: cmsData?.length || 0
      };
    }

    // 4. Error Analysis
    if (!requestedMetrics.length || requestedMetrics.includes('errors')) {
      const { data: errorData } = await baseQuery
        .gte('processing_started_at', fromDate)
        .not('error_types', 'is', null);

      const errorTypes: { [key: string]: number } = {};
      errorData?.forEach(e => {
        if (e.error_types && Array.isArray(e.error_types)) {
          e.error_types.forEach((error: string) => {
            errorTypes[error] = (errorTypes[error] || 0) + 1;
          });
        }
      });

      dashboard.errors = {
        total_error_jobs: errorData?.length || 0,
        error_breakdown: errorTypes,
        most_common_error: Object.keys(errorTypes).length > 0 ? 
          Object.entries(errorTypes).sort((a, b) => b[1] - a[1])[0] : null
      };
    }

    // 5. Time Series Data (for charts)
    if (!requestedMetrics.length || requestedMetrics.includes('timeseries')) {
      const { data: timeseriesData } = await baseQuery
        .gte('processing_started_at', fromDate)
        .order('processing_started_at');

      // Group by hour for detailed view, by day for longer periods
      const groupByHour = hoursBack <= 48;
      const timeSeries: { [key: string]: any } = {};

      timeseriesData?.forEach(record => {
        const date = new Date(record.processing_started_at);
        const key = groupByHour ? 
          date.toISOString().slice(0, 13) + ':00:00Z' : // Hour
          date.toISOString().slice(0, 10); // Day

        if (!timeSeries[key]) {
          timeSeries[key] = {
            timestamp: key,
            jobs: 0,
            rows_processed: 0,
            rows_failed: 0,
            credits_used: 0,
            avg_processing_time: 0
          };
        }

        timeSeries[key].jobs += 1;
        timeSeries[key].rows_processed += record.rows_processed || 0;
        timeSeries[key].rows_failed += record.rows_failed || 0;
        timeSeries[key].credits_used += record.credits_consumed || 0;
        timeSeries[key].avg_processing_time += record.total_processing_time_seconds || 0;
      });

      // Calculate averages
      Object.values(timeSeries).forEach((bucket: any) => {
        bucket.avg_processing_time = bucket.jobs > 0 ? 
          Math.round(bucket.avg_processing_time / bucket.jobs) : 0;
      });

      dashboard.timeseries = Object.values(timeSeries).sort((a: any, b: any) => 
        a.timestamp.localeCompare(b.timestamp)
      );
    }

    // 6. Current Queue Status
    if (!requestedMetrics.length || requestedMetrics.includes('queue')) {
      const { data: queueData } = await supabase
        .from('csv_processing_queue')
        .select('status, created_at, priority')
        .neq('status', 'completed');

      const queueStats = queueData?.reduce((acc: any, item: any) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const averageWaitTime = queueData?.filter(q => q.status === 'queued')
        .reduce((sum, q) => {
          const waitTime = Date.now() - new Date(q.created_at).getTime();
          return sum + waitTime;
        }, 0) / Math.max(queueStats.queued || 1, 1);

      dashboard.queue_status = {
        current_counts: queueStats,
        total_in_queue: queueData?.length || 0,
        avg_wait_time_minutes: averageWaitTime ? Math.round(averageWaitTime / 60000) : 0
      };
    }

  } catch (error) {
    dashboard.error = `Analytics generation failed: ${error.message}`;
  }

  return dashboard;
}
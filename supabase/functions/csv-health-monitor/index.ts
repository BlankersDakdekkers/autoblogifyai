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
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const healthData = await performHealthChecks(supabase);
    
    // Log health check results
    await supabase
      .from('system_health_logs')
      .insert({
        overall_status: healthData.overall_status,
        checks: healthData.checks
      });

    console.log(`[CSV-HEALTH-MONITOR] Health check completed - Status: ${healthData.overall_status}`);

    return new Response(
      JSON.stringify(healthData),
      { 
        status: healthData.overall_status === 'healthy' ? 200 : 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Health monitor error:', error);
    return new Response(
      JSON.stringify({ 
        overall_status: 'unhealthy',
        error: error.message,
        checks: { error: { status: 'failed', message: error.message } }
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function performHealthChecks(supabase: any) {
  const checks: any = {};
  let overallHealthy = true;

  // 1. Database connectivity
  try {
    const { error } = await supabase.from('csv_processing_jobs').select('id').limit(1);
    checks.database = error ? 
      { status: 'failed', message: error.message } : 
      { status: 'healthy', message: 'Database accessible' };
  } catch (error) {
    checks.database = { status: 'failed', message: error.message };
    overallHealthy = false;
  }

  // 2. Queue health
  try {
    const { data: queueStats } = await supabase
      .from('csv_processing_queue')
      .select('status')
      .neq('status', 'completed');

    const queueCounts = queueStats?.reduce((acc: any, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {}) || {};

    const totalInQueue = Object.values(queueCounts).reduce((a: any, b: any) => a + b, 0);
    const stuckJobs = queueCounts.processing || 0;

    checks.queue = {
      status: stuckJobs > 10 ? 'degraded' : 'healthy',
      message: `Total in queue: ${totalInQueue}, Processing: ${stuckJobs}`,
      metrics: queueCounts
    };

    if (stuckJobs > 20) overallHealthy = false;
  } catch (error) {
    checks.queue = { status: 'failed', message: error.message };
    overallHealthy = false;
  }

  // 3. Recent job success rate
  try {
    const { data: recentJobs } = await supabase
      .from('csv_processing_jobs')
      .select('status')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

    if (recentJobs && recentJobs.length > 0) {
      const successful = recentJobs.filter(job => job.status === 'completed').length;
      const successRate = (successful / recentJobs.length) * 100;

      checks.success_rate = {
        status: successRate < 50 ? 'degraded' : successRate < 80 ? 'warning' : 'healthy',
        message: `${successRate.toFixed(1)}% success rate (${successful}/${recentJobs.length} jobs)`,
        metrics: { success_rate: successRate, total_jobs: recentJobs.length }
      };

      if (successRate < 30) overallHealthy = false;
    } else {
      checks.success_rate = { 
        status: 'healthy', 
        message: 'No recent jobs to analyze',
        metrics: { success_rate: 100, total_jobs: 0 }
      };
    }
  } catch (error) {
    checks.success_rate = { status: 'failed', message: error.message };
    overallHealthy = false;
  }

  // 4. Rate limiting status
  try {
    const { data: limits } = await supabase
      .from('csv_processing_limits')
      .select('max_jobs_per_hour, current_hour_jobs, is_premium')
      .order('current_hour_jobs', { ascending: false })
      .limit(10);

    const highUsageUsers = limits?.filter(l => 
      l.current_hour_jobs > (l.max_jobs_per_hour * 0.8)
    ).length || 0;

    checks.rate_limiting = {
      status: highUsageUsers > 5 ? 'warning' : 'healthy',
      message: `${highUsageUsers} users near rate limits`,
      metrics: { high_usage_users: highUsageUsers }
    };
  } catch (error) {
    checks.rate_limiting = { status: 'failed', message: error.message };
  }

  // 5. Storage and CMS integrations
  try {
    const { data: integrations } = await supabase
      .from('cms_integrations')
      .select('id, is_active')
      .eq('is_active', true);

    checks.cms_integrations = {
      status: 'healthy',
      message: `${integrations?.length || 0} active CMS integrations`,
      metrics: { active_integrations: integrations?.length || 0 }
    };
  } catch (error) {
    checks.cms_integrations = { status: 'failed', message: error.message };
  }

  // 6. Processing performance
  try {
    const { data: avgPerformance } = await supabase
      .from('csv_processing_analytics')
      .select('total_processing_time_seconds, rows_processed')
      .gte('processing_started_at', new Date(Date.now() - 86400000).toISOString()) // Last 24h
      .not('total_processing_time_seconds', 'is', null);

    if (avgPerformance && avgPerformance.length > 0) {
      const avgTimePerRow = avgPerformance.reduce((sum, record) => {
        const timePerRow = record.total_processing_time_seconds / Math.max(record.rows_processed, 1);
        return sum + timePerRow;
      }, 0) / avgPerformance.length;

      checks.performance = {
        status: avgTimePerRow > 10 ? 'degraded' : avgTimePerRow > 5 ? 'warning' : 'healthy',
        message: `Avg ${avgTimePerRow.toFixed(2)}s per row processed`,
        metrics: { 
          avg_time_per_row: avgTimePerRow,
          sample_size: avgPerformance.length 
        }
      };
    } else {
      checks.performance = { 
        status: 'healthy', 
        message: 'No recent performance data',
        metrics: { avg_time_per_row: 0, sample_size: 0 }
      };
    }
  } catch (error) {
    checks.performance = { status: 'failed', message: error.message };
  }

  return {
    overall_status: overallHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks
  };
}
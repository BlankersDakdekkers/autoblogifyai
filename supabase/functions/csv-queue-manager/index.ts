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
    const { action = 'process_queue' } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.log(`[CSV-QUEUE-MANAGER] Action: ${action}`);

    switch (action) {
      case 'process_queue':
        return await processQueue(supabase);
      
      case 'cleanup_stale':
        return await cleanupStaleJobs(supabase);
      
      case 'get_stats':
        return await getQueueStats(supabase);
      
      case 'retry_failed':
        return await retryFailedJobs(supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in queue manager:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Process next items in the queue
async function processQueue(supabase: any) {
  try {
    // Get next queued jobs by priority
    const { data: queueItems, error } = await supabase
      .from('csv_processing_queue')
      .select(`
        *,
        csv_processing_jobs (*)
      `)
      .eq('status', 'queued')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5); // Process max 5 jobs concurrently

    if (error) throw error;

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No jobs in queue',
          processed: 0,
          queue_size: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CSV-QUEUE-MANAGER] Processing ${queueItems.length} queued jobs`);

    const processingPromises = queueItems.map(async (item) => {
      try {
        // Mark as processing
        await supabase
          .from('csv_processing_queue')
          .update({ 
            status: 'processing',
            started_at: new Date().toISOString(),
            worker_id: `queue-worker-${Date.now()}-${item.id.slice(-8)}`
          })
          .eq('id', item.id);

        // Process the job
        const result = await processQueuedJob(item, supabase);
        
        if (result.success) {
          await supabase
            .from('csv_processing_queue')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', item.id);
        } else {
          await handleJobFailure(item, result.error, supabase);
        }

        return { success: result.success, jobId: item.job_id };
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);
        await handleJobFailure(item, error.message, supabase);
        return { success: false, jobId: item.job_id, error: error.message };
      }
    });

    const results = await Promise.allSettled(processingPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    return new Response(
      JSON.stringify({
        message: `Processed ${successful}/${queueItems.length} jobs successfully`,
        processed: successful,
        total: queueItems.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Processing failed' })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Queue processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Process individual queued job
async function processQueuedJob(queueItem: any, supabase: any) {
  try {
    const job = queueItem.csv_processing_jobs;
    
    if (!job) {
      throw new Error('Job data not found');
    }

    console.log(`[CSV-QUEUE-MANAGER] Processing job ${job.id} for user ${job.user_id}`);

    // Call the process-csv function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || ''
      },
      body: JSON.stringify({
        csvUrl: job.csv_url,
        options: job.options || {},
        userId: job.user_id,
        jobId: job.id
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Processing failed');
    }

    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Handle job failure with retry logic
async function handleJobFailure(queueItem: any, errorMessage: string, supabase: any) {
  try {
    const retryCount = queueItem.retry_count || 0;
    const maxRetries = queueItem.max_retries || 3;

    if (retryCount < maxRetries) {
      // Schedule retry with exponential backoff
      const retryDelay = Math.min(300000 * Math.pow(2, retryCount), 3600000); // Max 1 hour
      const scheduledFor = new Date(Date.now() + retryDelay).toISOString();

      await supabase
        .from('csv_processing_queue')
        .update({
          status: 'queued',
          retry_count: retryCount + 1,
          scheduled_for: scheduledFor,
          error_message: errorMessage,
          started_at: null,
          worker_id: null
        })
        .eq('id', queueItem.id);

      console.log(`[CSV-QUEUE-MANAGER] Scheduled retry ${retryCount + 1}/${maxRetries} for job ${queueItem.job_id}`);
    } else {
      // Mark as permanently failed
      await Promise.all([
        supabase
          .from('csv_processing_queue')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: errorMessage
          })
          .eq('id', queueItem.id),
        
        supabase
          .from('csv_processing_jobs')
          .update({
            status: 'failed',
            error_message: errorMessage,
            retry_count: retryCount + 1
          })
          .eq('id', queueItem.job_id)
      ]);

      console.log(`[CSV-QUEUE-MANAGER] Job ${queueItem.job_id} permanently failed after ${maxRetries} retries`);
    }
  } catch (error) {
    console.error('Error handling job failure:', error);
  }
}

// Clean up stale jobs
async function cleanupStaleJobs(supabase: any) {
  try {
    const staleThreshold = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

    // Find processing jobs that are stuck
    const { data: staleJobs, error } = await supabase
      .from('csv_processing_queue')
      .select('*')
      .eq('status', 'processing')
      .lt('started_at', staleThreshold);

    if (error) throw error;

    if (staleJobs && staleJobs.length > 0) {
      console.log(`[CSV-QUEUE-MANAGER] Found ${staleJobs.length} stale jobs`);

      // Reset stale jobs to queued status for retry
      await supabase
        .from('csv_processing_queue')
        .update({
          status: 'queued',
          started_at: null,
          worker_id: null,
          scheduled_for: new Date().toISOString()
        })
        .in('id', staleJobs.map(job => job.id));
    }

    return new Response(
      JSON.stringify({
        message: `Cleaned up ${staleJobs?.length || 0} stale jobs`,
        cleaned: staleJobs?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get queue statistics
async function getQueueStats(supabase: any) {
  try {
    const { data: stats, error } = await supabase.rpc('get_queue_stats', { time_range_hours: 24 });
    
    if (error) throw error;

    const { data: currentQueue } = await supabase
      .from('csv_processing_queue')
      .select('status')
      .neq('status', 'completed');

    const queueCounts = currentQueue?.reduce((acc: any, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {}) || {};

    return new Response(
      JSON.stringify({
        historical_stats: stats,
        current_queue: queueCounts,
        total_in_queue: currentQueue?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Retry failed jobs
async function retryFailedJobs(supabase: any) {
  try {
    // Get failed jobs from last 24 hours
    const { data: failedJobs, error } = await supabase
      .from('csv_processing_queue')
      .select('*')
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString())
      .lt('retry_count', 3);

    if (error) throw error;

    if (failedJobs && failedJobs.length > 0) {
      // Reset to queued for retry
      await supabase
        .from('csv_processing_queue')
        .update({
          status: 'queued',
          scheduled_for: new Date().toISOString(),
          error_message: null,
          started_at: null,
          completed_at: null,
          worker_id: null
        })
        .in('id', failedJobs.map(job => job.id));
    }

    return new Response(
      JSON.stringify({
        message: `Retrying ${failedJobs?.length || 0} failed jobs`,
        retried: failedJobs?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
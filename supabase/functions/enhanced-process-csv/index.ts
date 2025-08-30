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
    const { csvUrl, options = {} } = await req.json();
    
    if (!csvUrl) {
      return new Response(
        JSON.stringify({ error: 'CSV URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ENHANCED-CSV-PROCESSOR] User authenticated - ${user.id}`);

    // Check processing rate limits
    const canProcess = await checkProcessingRateLimit(user.id, supabase);
    if (!canProcess) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait before processing another CSV.',
          retryAfter: 3600 // 1 hour in seconds
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create job with enhanced tracking
    const job = await createEnhancedJob(csvUrl, user.id, options, supabase);
    
    // Increment rate limit counter
    await incrementProcessingCounter(user.id, supabase);

    // Add to processing queue
    await addToProcessingQueue(job.id, user.id, options, supabase);

    // Start processing with background analytics
    EdgeRuntime.waitUntil(processWithAnalytics(csvUrl, job.id, user.id, supabase, options, authHeader));

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'CSV processing started with enhanced monitoring',
        jobId: job.id,
        status: 'queued',
        estimatedCompletion: new Date(Date.now() + 300000).toISOString() // 5 minutes estimate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced CSV processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Enhanced job creation with better tracking
async function createEnhancedJob(csvUrl: string, userId: string, options: any, supabase: any) {
  const { data, error } = await supabase
    .from('csv_processing_jobs')
    .insert({
      user_id: userId,
      csv_url: csvUrl,
      status: 'pending',
      options: options,
      priority: options.priority || 5,
      max_retries: options.max_retries || 3,
      scheduled_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create job: ${error.message}`);
  
  console.log(`[ENHANCED-CSV-PROCESSOR] Job created - ${data.id}`);
  return data;
}

// Rate limiting check
async function checkProcessingRateLimit(userId: string, supabase: any): Promise<boolean> {
  try {
    const { data: limits } = await supabase
      .from('csv_processing_limits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!limits) {
      // Create default limits for new user
      await supabase
        .from('csv_processing_limits')
        .insert({ user_id: userId });
      return true;
    }

    // Check if we're in a new hour
    const currentHour = new Date().setMinutes(0, 0, 0);
    const limitsHour = new Date(limits.current_hour_start).setMinutes(0, 0, 0);

    if (currentHour > limitsHour) {
      // Reset counter for new hour
      await supabase
        .from('csv_processing_limits')
        .update({
          current_hour_jobs: 0,
          current_hour_start: new Date().toISOString()
        })
        .eq('user_id', userId);
      return true;
    }

    return limits.current_hour_jobs < limits.max_jobs_per_hour;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow processing if check fails
  }
}

// Increment processing counter
async function incrementProcessingCounter(userId: string, supabase: any) {
  try {
    await supabase.rpc('increment_processing_counter', { user_uuid: userId });
  } catch (error) {
    console.error('Failed to increment processing counter:', error);
  }
}

// Add job to processing queue
async function addToProcessingQueue(jobId: string, userId: string, options: any, supabase: any) {
  try {
    await supabase
      .from('csv_processing_queue')
      .insert({
        job_id: jobId,
        user_id: userId,
        status: 'queued',
        priority: options.priority || 5,
        processing_options: options,
        scheduled_for: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to add to queue:', error);
  }
}

// Process with comprehensive analytics
async function processWithAnalytics(csvUrl: string, jobId: string, userId: string, supabase: any, options: any, authHeader: string) {
  const startTime = Date.now();
  let analytics = {
    user_id: userId,
    job_id: jobId,
    processing_started_at: new Date().toISOString(),
    rows_processed: 0,
    rows_failed: 0,
    ai_calls_made: 0,
    credits_consumed: 0,
    cms_publications_attempted: 0,
    cms_publications_successful: 0,
    error_types: [],
    performance_metrics: {}
  };

  try {
    // Update job and queue status
    await Promise.all([
      supabase.from('csv_processing_jobs').update({ status: 'processing' }).eq('id', jobId),
      supabase.from('csv_processing_queue').update({ 
        status: 'processing', 
        started_at: new Date().toISOString(),
        worker_id: `worker-${Date.now()}`
      }).eq('job_id', jobId)
    ]);

    console.log(`[ENHANCED-CSV-PROCESSOR] Starting processing - Job ${jobId}`);

    // Call the existing process-csv function but with enhanced monitoring
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-csv`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || ''
      },
      body: JSON.stringify({ csvUrl, options })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      const processingTime = Math.round((Date.now() - startTime) / 1000);
      
      // Update successful completion
      await Promise.all([
        supabase.from('csv_processing_jobs').update({ 
          status: 'completed',
          success_count: result.successCount || 0,
          error_count: result.errorCount || 0,
          processing_time_seconds: processingTime
        }).eq('id', jobId),
        
        supabase.from('csv_processing_queue').update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        }).eq('job_id', jobId)
      ]);

      // Record analytics
      analytics.processing_completed_at = new Date().toISOString();
      analytics.total_processing_time_seconds = processingTime;
      analytics.rows_processed = result.successCount || 0;
      analytics.rows_failed = result.errorCount || 0;
      analytics.performance_metrics = {
        avgTimePerRow: processingTime / (result.successCount || 1),
        throughputPerMinute: ((result.successCount || 0) / processingTime) * 60
      };

      await supabase.from('csv_processing_analytics').insert(analytics);
      
      console.log(`[ENHANCED-CSV-PROCESSOR] Processing completed successfully - Job ${jobId}`);
      
    } else {
      throw new Error(result.error || 'Processing failed');
    }

  } catch (error) {
    console.error(`[ENHANCED-CSV-PROCESSOR] Processing failed - Job ${jobId}:`, error);
    
    const processingTime = Math.round((Date.now() - startTime) / 1000);
    
    // Update failure status
    await Promise.all([
      supabase.from('csv_processing_jobs').update({ 
        status: 'failed',
        error_message: error.message,
        processing_time_seconds: processingTime
      }).eq('id', jobId),
      
      supabase.from('csv_processing_queue').update({ 
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message
      }).eq('job_id', jobId)
    ]);

    // Record failure analytics
    analytics.processing_completed_at = new Date().toISOString();
    analytics.total_processing_time_seconds = processingTime;
    analytics.error_types = [error.message];
    
    await supabase.from('csv_processing_analytics').insert(analytics);
  }
}
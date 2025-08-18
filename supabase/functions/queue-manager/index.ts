import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueueJob {
  id: string;
  type: 'csv_processing' | 'content_generation' | 'image_generation';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  data: any;
  user_id: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[QUEUE-MANAGER] ${timestamp} - ${step}`, details ? JSON.stringify(details) : '');
};

const processCSVJob = async (job: QueueJob, supabase: any): Promise<void> => {
  logStep("Processing CSV job", { jobId: job.id, userId: job.user_id });
  
  try {
    // Update job status to processing
    await supabase
      .from('queue_jobs')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', job.id);

    const { csv_url, batch_size = 10 } = job.data;
    
    if (!csv_url) {
      throw new Error('CSV URL is required');
    }

    // Fetch CSV data
    logStep("Fetching CSV data", { csvUrl: csv_url });
    const csvResponse = await fetch(csv_url);
    
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.status}`);
    }
    
    const csvText = await csvResponse.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    logStep("CSV parsed", { totalRows: lines.length - 1, headers });

    let processedRows = 0;
    let errors: string[] = [];

    // Process in batches
    for (let i = 1; i < lines.length; i += batch_size) {
      const batch = lines.slice(i, Math.min(i + batch_size, lines.length));
      
      logStep(`Processing batch ${Math.floor(i / batch_size) + 1}`, { 
        batchSize: batch.length,
        totalBatches: Math.ceil((lines.length - 1) / batch_size)
      });

      for (const line of batch) {
        try {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const rowData: any = {};
          
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          // Validate required fields
          if (!rowData.title || !rowData.slug) {
            errors.push(`Row ${i + processedRows}: Missing title or slug`);
            continue;
          }

          // Insert blog post
          const { error: insertError } = await supabase
            .from('blog_posts')
            .insert({
              user_id: job.user_id,
              title: rowData.title,
              slug: rowData.slug,
              body_markdown: rowData.body_markdown || '',
              status: rowData.status || 'draft',
              publish_date: rowData.publish_date || new Date().toISOString().split('T')[0],
              meta_title: rowData.meta_title || rowData.title,
              meta_description: rowData.meta_description || '',
              hero_image_url: rowData.hero_image_url || '',
              hero_image_alt: rowData.hero_image_alt || '',
              city: rowData.city || '',
              tags: rowData.tags ? rowData.tags.split(';') : [],
              author: rowData.author || 'AutoblogifyAI',
              cta_heading: rowData.cta_heading || '',
              cta_subtext: rowData.cta_subtext || '',
              faq_json: rowData.faq_json ? JSON.parse(rowData.faq_json) : null,
              word_count: parseInt(rowData.word_count) || 0
            });

          if (insertError) {
            errors.push(`Row ${i + processedRows}: ${insertError.message}`);
          } else {
            processedRows++;
          }

        } catch (error) {
          errors.push(`Row ${i + processedRows}: ${error.message}`);
        }
      }

      // Update progress
      await supabase
        .from('csv_processing_jobs')
        .update({ 
          processed_rows: processedRows,
          error_message: errors.length > 0 ? errors.join('; ') : null
        })
        .eq('id', job.data.processing_job_id);

      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mark job as completed
    await supabase
      .from('queue_jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        data: { 
          ...job.data,
          processed_rows: processedRows,
          total_errors: errors.length,
          errors: errors.slice(0, 10) // Keep first 10 errors
        }
      })
      .eq('id', job.id);

    logStep("CSV job completed", { 
      jobId: job.id,
      processedRows,
      totalErrors: errors.length 
    });

  } catch (error) {
    logStep("CSV job failed", { jobId: job.id, error: error.message });
    
    // Mark job as failed and increment retry count
    await supabase
      .from('queue_jobs')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
        retry_count: job.retry_count + 1
      })
      .eq('id', job.id);

    throw error;
  }
};

const processContentGenerationJob = async (job: QueueJob, supabase: any): Promise<void> => {
  logStep("Processing content generation job", { jobId: job.id });
  
  try {
    await supabase
      .from('queue_jobs')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', job.id);

    const { prompt, type = 'blog_post' } = job.data;
    
    // Call the generate-content function
    const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-content', {
      body: { prompt, type }
    });

    if (contentError) {
      throw new Error(`Content generation failed: ${contentError.message}`);
    }

    await supabase
      .from('queue_jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        data: { ...job.data, result: contentData }
      })
      .eq('id', job.id);

    logStep("Content generation job completed", { jobId: job.id });

  } catch (error) {
    logStep("Content generation job failed", { jobId: job.id, error: error.message });
    
    await supabase
      .from('queue_jobs')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
        retry_count: job.retry_count + 1
      })
      .eq('id', job.id);

    throw error;
  }
};

const processJob = async (job: QueueJob, supabase: any): Promise<void> => {
  logStep("Processing job", { jobId: job.id, type: job.type });
  
  switch (job.type) {
    case 'csv_processing':
      await processCSVJob(job, supabase);
      break;
    case 'content_generation':
      await processContentGenerationJob(job, supabase);
      break;
    case 'image_generation':
      // TODO: Implement image generation job processing
      logStep("Image generation not implemented yet", { jobId: job.id });
      break;
    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action = 'process' } = await req.json().catch(() => ({ action: 'process' }));

    if (action === 'add') {
      // Add a new job to the queue
      const { type, data, priority = 5, user_id } = await req.json();
      
      if (!type || !data || !user_id) {
        return new Response(
          JSON.stringify({ error: 'type, data, and user_id are required' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const job = {
        type,
        status: 'pending',
        priority,
        data,
        user_id,
        retry_count: 0,
        max_retries: 3,
        created_at: new Date().toISOString()
      };

      const { data: jobData, error } = await supabase
        .from('queue_jobs')
        .insert(job)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logStep("Job added to queue", { jobId: jobData.id, type });

      return new Response(
        JSON.stringify({ success: true, job: jobData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'process') {
      // Process pending jobs
      logStep("Starting queue processing");
      
      const { data: pendingJobs, error } = await supabase
        .from('queue_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(5); // Process max 5 jobs at once

      if (error) {
        throw error;
      }

      if (!pendingJobs || pendingJobs.length === 0) {
        logStep("No pending jobs found");
        return new Response(
          JSON.stringify({ message: 'No pending jobs' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      logStep(`Processing ${pendingJobs.length} jobs`);

      const results = [];
      
      for (const job of pendingJobs) {
        try {
          await processJob(job, supabase);
          results.push({ jobId: job.id, status: 'completed' });
        } catch (error) {
          logStep("Job processing error", { jobId: job.id, error: error.message });
          results.push({ jobId: job.id, status: 'failed', error: error.message });
        }
      }

      return new Response(
        JSON.stringify({ 
          processed: results.length,
          results 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'status') {
      // Get queue status
      const { data: stats, error } = await supabase
        .from('queue_jobs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        throw error;
      }

      const statusCounts = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      };

      stats?.forEach(job => {
        statusCounts[job.status as keyof typeof statusCounts]++;
      });

      return new Response(
        JSON.stringify({
          queue_status: statusCounts,
          last_24h_total: stats?.length || 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("Queue manager error", { error: error.message });
    
    return new Response(
      JSON.stringify({ 
        error: 'Queue manager service error',
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
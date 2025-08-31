import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[CONTENT-PLANNER] ${new Date().toISOString()} - ${step}`, details ? JSON.stringify(details) : '');
};

interface ContentPlan {
  id?: string;
  title: string;
  description?: string;
  content_type: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  planned_date: string;
  due_date?: string;
  platform?: string;
  category?: string;
  tags?: string[];
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  related_csv_job_id?: string;
  related_blog_post_id?: string;
  metadata?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Content planner request started', { method: req.method, url: req.url });

    // Get Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      logStep('User authentication failed', { error: userError });
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('User authenticated', { userId: user.id });

    // Parse request body for POST/PUT/DELETE methods
    let requestData: any = {};
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      requestData = await req.json();
      logStep('Request data parsed', requestData);
    }

    // Route handling
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1]; // Get last part of path
    const planId = url.searchParams.get('id');

    logStep('Route handling', { method: req.method, action, planId });

    switch (req.method) {
      case 'GET':
        if (planId) {
          // Get single content plan
          const { data: plan, error } = await supabase
            .from('content_plans')
            .select('*')
            .eq('id', planId)
            .eq('user_id', user.id)
            .single();

          if (error) {
            logStep('Error fetching single plan', { error, planId });
            return new Response(
              JSON.stringify({ error: 'Plan not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          logStep('Single plan fetched successfully', { planId });
          return new Response(
            JSON.stringify({ plan }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all content plans for user
          const startDate = url.searchParams.get('start_date');
          const endDate = url.searchParams.get('end_date');
          const status = url.searchParams.get('status');

          let query = supabase
            .from('content_plans')
            .select('*')
            .eq('user_id', user.id)
            .order('planned_date', { ascending: true });

          if (startDate) {
            query = query.gte('planned_date', startDate);
          }
          if (endDate) {
            query = query.lte('planned_date', endDate);
          }
          if (status) {
            query = query.eq('status', status);
          }

          const { data: plans, error } = await query;

          if (error) {
            logStep('Error fetching plans', { error });
            return new Response(
              JSON.stringify({ error: 'Failed to fetch plans' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          logStep('Plans fetched successfully', { count: plans?.length || 0 });
          return new Response(
            JSON.stringify({ plans: plans || [] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'POST':
        // Create new content plan
        const newPlan: ContentPlan = {
          ...requestData,
          user_id: user.id,
        };

        const { data: createdPlan, error: createError } = await supabase
          .from('content_plans')
          .insert([newPlan])
          .select()
          .single();

        if (createError) {
          logStep('Error creating plan', { error: createError });
          return new Response(
            JSON.stringify({ error: 'Failed to create plan' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        logStep('Plan created successfully', { planId: createdPlan.id });
        return new Response(
          JSON.stringify({ plan: createdPlan, message: 'Plan created successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
      case 'PATCH':
        // Update content plan
        if (!planId) {
          return new Response(
            JSON.stringify({ error: 'Plan ID required for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: updatedPlan, error: updateError } = await supabase
          .from('content_plans')
          .update(requestData)
          .eq('id', planId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          logStep('Error updating plan', { error: updateError, planId });
          return new Response(
            JSON.stringify({ error: 'Failed to update plan' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        logStep('Plan updated successfully', { planId });
        return new Response(
          JSON.stringify({ plan: updatedPlan, message: 'Plan updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete content plan
        if (!planId) {
          return new Response(
            JSON.stringify({ error: 'Plan ID required for deletion' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: deleteError } = await supabase
          .from('content_plans')
          .delete()
          .eq('id', planId)
          .eq('user_id', user.id);

        if (deleteError) {
          logStep('Error deleting plan', { error: deleteError, planId });
          return new Response(
            JSON.stringify({ error: 'Failed to delete plan' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        logStep('Plan deleted successfully', { planId });
        return new Response(
          JSON.stringify({ message: 'Plan deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    logStep('Unexpected error in content planner', { error: error.message });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
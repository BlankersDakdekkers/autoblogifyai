import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user credits - handle case where user doesn't have a record yet
    const { data: credits, error } = await supabaseServiceClient
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows

    if (error) {
      console.error('Error fetching credits:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no credits record exists, create one with default values
    if (!credits) {
      console.log('No credits record found for user, creating one with default values');
      const { data: newCredits, error: insertError } = await supabaseServiceClient
        .from('user_credits')
        .insert({
          user_id: user.id,
          credits_remaining: 5, // Default free credits
          total_credits_used: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating credits record:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create credits record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          credits_remaining: newCredits.credits_remaining,
          total_credits_used: newCredits.total_credits_used
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        credits_remaining: credits.credits_remaining || 0,
        total_credits_used: credits.total_credits_used || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-credits function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
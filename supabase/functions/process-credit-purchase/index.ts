import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { session_id } = await req.json();
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user info from session metadata
    const userId = session.metadata?.user_id;
    const creditAmount = parseInt(session.metadata?.credit_amount || "0");
    
    if (!userId || !creditAmount) {
      return new Response(
        JSON.stringify({ error: "Invalid session metadata" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase service client
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Add credits to user account
    const { data: currentCredits, error: fetchError } = await supabaseServiceClient
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching current credits:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch current credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updateResult;
    if (currentCredits) {
      // Update existing record
      updateResult = await supabaseServiceClient
        .from('user_credits')
        .update({
          credits_remaining: currentCredits.credits_remaining + creditAmount,
          last_credit_update: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Create new record
      updateResult = await supabaseServiceClient
        .from('user_credits')
        .insert({
          user_id: userId,
          credits_remaining: creditAmount + 5, // Include default free credits
          total_credits_used: 0,
          last_credit_update: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (updateResult.error) {
      console.error('Error updating credits:', updateResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to update credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully added ${creditAmount} credits to user ${userId}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        credits_added: creditAmount,
        total_credits: updateResult.data.credits_remaining
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in process-credit-purchase:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
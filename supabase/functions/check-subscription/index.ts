import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log("=== CHECK SUBSCRIPTION FUNCTION STARTED ===");
    
    // Get Stripe key with detailed validation
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("=== STRIPE KEY VALIDATION ===");
    console.log("Key exists:", !!stripeKey);
    console.log("Key type:", typeof stripeKey);
    console.log("Key length:", stripeKey?.length || 0);
    console.log("Key starts with sk_:", stripeKey?.startsWith("sk_"));
    
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not found");
      return new Response(JSON.stringify({ 
        error: "Stripe key niet gevonden",
        debug: "STRIPE_SECRET_KEY environment variable not set"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    if (!stripeKey.startsWith("sk_")) {
      console.error("Invalid Stripe key format");
      return new Response(JSON.stringify({ 
        error: "Ongeldige Stripe key",
        debug: "Key does not start with sk_"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    console.log("Stripe key validation passed");
    
    // Authenticate user with improved error handling
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("AUTHENTICATION ERROR: No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const token = authHeader.replace("Bearer ", "");
    console.log("TOKEN VALIDATION: Attempting to validate user token");
    
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError) {
      console.error("AUTHENTICATION ERROR:", userError.message);
      
      // Handle expired sessions more gracefully
      if (userError.message.includes("session_not_found") || userError.message.includes("expired")) {
        return new Response(
          JSON.stringify({ 
            error: "Session expired", 
            message: "Please log in again",
            code: "SESSION_EXPIRED"
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const user = userData.user;
    if (!user?.email) {
      console.error("USER VALIDATION ERROR: No user or email found in token");
      return new Response(
        JSON.stringify({ error: "Invalid user data" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log("USER AUTHENTICATED:", user.email);

    // Initialize Supabase with service role for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      console.log("Stripe client initialized");
    } catch (stripeError) {
      console.error("Stripe initialization failed:", stripeError);
      return new Response(JSON.stringify({ 
        error: "Stripe initialisatie gefaald",
        debug: stripeError.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Check for Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    console.log("Stripe customers found:", customers.data.length);
    
    if (customers.data.length === 0) {
      console.log("No customer found, setting unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    console.log("Found Stripe customer:", customerId);

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 5000) {
        subscriptionTier = "starter";
      } else if (amount <= 10000) {
        subscriptionTier = "professional";
      } else {
        subscriptionTier = "enterprise";
      }
      
      console.log("Active subscription found:", { 
        subscriptionId: subscription.id, 
        tier: subscriptionTier, 
        amount,
        endDate: subscriptionEnd 
      });
    } else {
      console.log("No active subscription");
    }

    const { error: upsertError } = await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      stripe_subscription_id: stripeSubscriptionId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (upsertError) {
      console.error("Database upsert error:", upsertError);
      throw new Error(`Database error: ${upsertError.message}`);
    }

    console.log("Database updated successfully", { subscribed: hasActiveSub, tier: subscriptionTier });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("GENERAL ERROR in check-subscription:", errorMessage);
    
    // Handle specific authentication errors
    if (errorMessage.includes("session_not_found") || errorMessage.includes("Session not found")) {
      return new Response(
        JSON.stringify({ 
          error: "Session expired", 
          message: "Your session has expired. Please log in again.",
          code: "SESSION_EXPIRED"
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (errorMessage.includes("Authentication") || errorMessage.includes("Auth error")) {
      return new Response(
        JSON.stringify({ 
          error: "Authentication failed", 
          message: "Please log in to access this feature.",
          code: "AUTH_FAILED"
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Er is een onbekende fout opgetreden",
        debug: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
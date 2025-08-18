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
    console.log("=== CHECK SUBSCRIPTION STARTED ===");
    
    // Debug environment variables
    const allEnv = Deno.env.toObject();
    console.log("Environment keys:", Object.keys(allEnv));
    console.log("STRIPE_SECRET_KEY exists:", "STRIPE_SECRET_KEY" in allEnv);
    console.log("STRIPE_SECRET_KEY value length:", allEnv.STRIPE_SECRET_KEY?.length || 0);
    console.log("STRIPE_SECRET_KEY starts with sk_:", allEnv.STRIPE_SECRET_KEY?.startsWith("sk_") || false);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.trim() === "" || !stripeKey.startsWith("sk_")) {
      console.error("STRIPE_SECRET_KEY is invalid:", {
        exists: !!stripeKey,
        length: stripeKey?.length || 0,
        startsWithSk: stripeKey?.startsWith("sk_") || false
      });
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    console.log("Stripe key is valid");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    console.log("User authenticated:", user.email);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    console.log("Stripe client initialized");
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    console.log("Stripe customers retrieved:", customers.data.length);
    
    if (customers.data.length === 0) {
      console.log("No customer found, setting unsubscribed");
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
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ERROR:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
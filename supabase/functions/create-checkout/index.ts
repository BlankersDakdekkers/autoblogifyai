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
    console.log("=== CREATE CHECKOUT STARTED ===");
    
    // Get all environment variables for debugging
    const allEnv = Deno.env.toObject();
    console.log("Environment keys:", Object.keys(allEnv));
    console.log("STRIPE_SECRET_KEY exists:", "STRIPE_SECRET_KEY" in allEnv);
    console.log("STRIPE_SECRET_KEY value length:", allEnv.STRIPE_SECRET_KEY?.length || 0);
    console.log("STRIPE_SECRET_KEY starts with sk_:", allEnv.STRIPE_SECRET_KEY?.startsWith("sk_") || false);
    
    const { tier } = await req.json();
    console.log("Tier requested:", tier);
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    console.log("User authenticated:", user.email);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.trim() === "" || !stripeKey.startsWith("sk_")) {
      console.error("STRIPE_SECRET_KEY is invalid:", {
        exists: !!stripeKey,
        length: stripeKey?.length || 0,
        startsWithSk: stripeKey?.startsWith("sk_") || false
      });
      return new Response(
        JSON.stringify({ error: "Stripe configuratie ontbreekt of is ongeldig" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("Stripe key is valid");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found");
    }

    // Premium pricing tiers
    const pricingPlans = {
      starter: {
        amount: 4900,
        name: "AutoblogifyAI Starter",
        description: "Tot 50 AI blogposts per maand + basis templates"
      },
      professional: {
        amount: 9900,
        name: "AutoblogifyAI Professional",
        description: "Onbeperkte AI content + premium templates + lokale SEO"
      },
      enterprise: {
        amount: 19900,
        name: "AutoblogifyAI Enterprise", 
        description: "Alles + bulk processing + priority support + custom integraties"
      }
    };

    const selectedPlan = pricingPlans[tier as keyof typeof pricingPlans];
    if (!selectedPlan) throw new Error("Invalid pricing tier");
    console.log("Plan selected:", selectedPlan.name);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: selectedPlan.name,
              description: selectedPlan.description
            },
            unit_amount: selectedPlan.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription" as const,
      success_url: `${req.headers.get("origin")}/dashboard?success=true&tier=${tier}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
        tier: tier
      }
    });

    console.log("Stripe session created successfully:", session.id);
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Er is een fout opgetreden bij het starten van de checkout",
      details: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
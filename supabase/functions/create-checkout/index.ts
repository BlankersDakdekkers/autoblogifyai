import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { tier } = await req.json();
    logStep("Request parsed", { tier });
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    // Use anon client for auth
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Debug: Log available environment variables
    const envKeys = Object.keys(Deno.env.toObject());
    logStep("Available environment variables", envKeys);
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found in environment variables");
      logStep("All environment variables", Deno.env.toObject());
      return new Response(
        JSON.stringify({ error: "Stripe configuratie ontbreekt. Neem contact op met ondersteuning." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    logStep("Stripe key found and configured");

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16" 
    });

    // Check existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Premium pricing tiers for AI content generation service
    const pricingPlans = {
      starter: {
        amount: 4900, // €49/month
        name: "AutoblogifyAI Starter",
        description: "Tot 50 AI blogposts per maand + basis templates"
      },
      professional: {
        amount: 9900, // €99/month  
        name: "AutoblogifyAI Professional",
        description: "Onbeperkte AI content + premium templates + lokale SEO"
      },
      enterprise: {
        amount: 19900, // €199/month
        name: "AutoblogifyAI Enterprise", 
        description: "Alles + bulk processing + priority support + custom integraties"
      }
    };

    const selectedPlan = pricingPlans[tier as keyof typeof pricingPlans];
    if (!selectedPlan) throw new Error("Invalid pricing tier");
    logStep("Plan selected", { plan: selectedPlan.name, amount: selectedPlan.amount });

    const sessionParams = {
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
    };

    logStep("Creating Stripe session with parameters", { 
      customerEmail: sessionParams.customer_email,
      customerId: sessionParams.customer,
      amount: sessionParams.line_items[0].price_data.unit_amount,
      currency: sessionParams.line_items[0].price_data.currency
    });
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Stripe session created successfully", { sessionId: session.id, url: !!session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("CRITICAL ERROR occurred", { 
      message: errorMessage, 
      stack: error instanceof Error ? error.stack : undefined,
      type: error.constructor.name 
    });
    
    // Return a more specific error message
    let userFriendlyMessage = "Er is een onbekende fout opgetreden";
    if (errorMessage.includes("STRIPE_SECRET_KEY")) {
      userFriendlyMessage = "Betalingsconfiguratie ontbreekt";
    } else if (errorMessage.includes("Invalid")) {
      userFriendlyMessage = "Ongeldige betalingsgegevens";
    } else if (errorMessage.includes("authentication") || errorMessage.includes("Unauthorized")) {
      userFriendlyMessage = "Authenticatie mislukt. Log opnieuw in.";
    }
    
    return new Response(JSON.stringify({ 
      error: userFriendlyMessage,
      details: errorMessage // Include technical details for debugging
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
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
    console.log("=== CREATE CHECKOUT FUNCTION STARTED ===");
    
    // Parse request body
    const { tier } = await req.json();
    console.log("Requested tier:", tier);
    
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header found");
      throw new Error("No authorization header");
    }
    
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError) {
      console.error("Authentication error:", authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    const user = data.user;
    if (!user?.email) {
      console.error("User not found or no email");
      throw new Error("User not authenticated");
    }
    
    console.log("User authenticated successfully:", user.email);

    // Get Stripe key with detailed logging
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("=== STRIPE KEY CHECK ===");
    console.log("Key exists:", !!stripeKey);
    console.log("Key type:", typeof stripeKey);
    console.log("Key length:", stripeKey?.length || 0);
    console.log("Key starts with sk_:", stripeKey?.startsWith("sk_"));
    console.log("Key first 10 chars:", stripeKey?.substring(0, 10) || "none");
    
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not found in environment");
      return new Response(
        JSON.stringify({ 
          error: "Stripe key ontbreekt",
          debug: "STRIPE_SECRET_KEY not found"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!stripeKey.startsWith("sk_")) {
      console.error("Invalid Stripe key format");
      return new Response(
        JSON.stringify({ 
          error: "Ongeldige Stripe key format",
          debug: `Key does not start with sk_, starts with: ${stripeKey.substring(0, 3)}`
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Stripe key validation passed");

    // Initialize Stripe
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      console.log("Stripe client initialized successfully");
    } catch (stripeError) {
      console.error("Failed to initialize Stripe:", stripeError);
      return new Response(
        JSON.stringify({ 
          error: "Stripe initialisatie gefaald",
          debug: stripeError.message
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing customer
    let customerId;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("Found existing customer:", customerId);
      } else {
        console.log("No existing customer found");
      }
    } catch (customerError) {
      console.error("Error checking customers:", customerError);
      return new Response(
        JSON.stringify({ 
          error: "Fout bij ophalen klant gegevens",
          debug: customerError.message
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
    if (!selectedPlan) {
      console.error("Invalid tier selected:", tier);
      throw new Error("Invalid pricing tier");
    }
    
    console.log("Selected plan:", selectedPlan.name, "- Amount:", selectedPlan.amount);

    // Create optimized checkout session for conversie
    let session;
    try {
      session = await stripe.checkout.sessions.create({
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
        
        // Conversie optimalisaties
        payment_method_types: [
          'card',           // Creditcard/debitcard
          'ideal',          // iDEAL (Nederland)
          'bancontact',     // Bancontact (België)
          'sepa_debit',     // SEPA Direct Debit (Europa)
          'sofort',         // SOFORT (Duitsland/Oostenrijk)
        ],
        
        // Nederlandse lokalisatie
        locale: 'nl',
        currency: 'eur',
        
        // Betere checkout ervaring
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        },
        
        // Tax berekening (indien geconfigureerd)
        automatic_tax: { enabled: false }, // Zet op true als je tax rates hebt ingesteld
        
        // Kortere checkout flow
        submit_type: 'subscribe',
        
        // Custom success/cancel URLs met meer info
        success_url: `${req.headers.get("origin")}/dashboard?success=true&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/dashboard/pricing?canceled=true&tier=${tier}`,
        
        // Metadata voor tracking
        metadata: {
          user_id: user.id,
          tier: tier,
          source: 'autoblogify_pricing_page'
        },
        
        // Subscription opties
        subscription_data: {
          metadata: {
            user_id: user.id,
            tier: tier
          }
        }
      });
      
      console.log("Checkout session created successfully:", session.id);
    } catch (sessionError) {
      console.error("Error creating checkout session:", sessionError);
      return new Response(
        JSON.stringify({ 
          error: "Fout bij aanmaken checkout sessie",
          debug: sessionError.message
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("GENERAL ERROR in create-checkout:", error);
    return new Response(JSON.stringify({ 
      error: "Er is een onbekende fout opgetreden",
      debug: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
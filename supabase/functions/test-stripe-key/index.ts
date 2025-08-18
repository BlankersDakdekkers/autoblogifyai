import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log("=== ENVIRONMENT CHECK ===");
    console.log("STRIPE_SECRET_KEY exists:", !!stripeKey);
    console.log("STRIPE_SECRET_KEY length:", stripeKey?.length || 0);
    console.log("STRIPE_SECRET_KEY starts with sk_test_:", stripeKey?.startsWith("sk_test_"));
    console.log("STRIPE_SECRET_KEY starts with sk_live_:", stripeKey?.startsWith("sk_live_"));
    console.log("STRIPE_SECRET_KEY first 15 chars:", stripeKey?.substring(0, 15) || "none");
    console.log("SUPABASE_URL exists:", !!supabaseUrl);
    console.log("SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);
    
    // List all environment variables (without values for security)
    const allEnvKeys = Object.keys(Deno.env.toObject());
    console.log("All environment keys:", allEnvKeys);
    
    return new Response(JSON.stringify({ 
      stripe_key_exists: !!stripeKey,
      stripe_key_length: stripeKey?.length || 0,
      stripe_key_type: stripeKey?.startsWith("sk_test_") ? "test" : 
                      stripeKey?.startsWith("sk_live_") ? "live" : "unknown",
      stripe_key_prefix: stripeKey?.substring(0, 15) || "none",
      environment_keys: allEnvKeys,
      supabase_configured: !!supabaseUrl && !!supabaseAnonKey
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error in test function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stripe_key_exists: !!Deno.env.get("STRIPE_SECRET_KEY")
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
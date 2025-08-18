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
    console.log("=== DETAILED STRIPE KEY DEBUG ===");
    
    // Try multiple ways to get the environment variable
    const stripeKey1 = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeKey2 = globalThis.Deno?.env?.get?.("STRIPE_SECRET_KEY");
    const allEnv = Deno.env.toObject();
    
    console.log("Method 1 (Deno.env.get):", !!stripeKey1, stripeKey1?.length || 0);
    console.log("Method 2 (globalThis):", !!stripeKey2, stripeKey2?.length || 0);
    console.log("Environment keys:", Object.keys(allEnv));
    console.log("STRIPE_SECRET_KEY in env object:", "STRIPE_SECRET_KEY" in allEnv);
    console.log("Raw value type:", typeof allEnv.STRIPE_SECRET_KEY);
    console.log("Raw value length:", allEnv.STRIPE_SECRET_KEY?.length || 0);
    console.log("Raw value preview:", allEnv.STRIPE_SECRET_KEY?.substring(0, 20) || "none");
    
    const finalKey = stripeKey1 || stripeKey2 || allEnv.STRIPE_SECRET_KEY;
    
    return new Response(JSON.stringify({ 
      method1_exists: !!stripeKey1,
      method1_length: stripeKey1?.length || 0,
      method2_exists: !!stripeKey2, 
      method2_length: stripeKey2?.length || 0,
      env_object_exists: "STRIPE_SECRET_KEY" in allEnv,
      env_object_length: allEnv.STRIPE_SECRET_KEY?.length || 0,
      env_object_type: typeof allEnv.STRIPE_SECRET_KEY,
      final_key_exists: !!finalKey,
      final_key_length: finalKey?.length || 0,
      final_key_starts_with_sk: finalKey?.startsWith("sk_") || false,
      final_key_preview: finalKey?.substring(0, 20) || "none",
      all_env_keys: Object.keys(allEnv)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error in stripe debug:", error);
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
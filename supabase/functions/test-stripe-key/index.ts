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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("STRIPE_SECRET_KEY exists:", !!stripeKey);
    console.log("STRIPE_SECRET_KEY length:", stripeKey?.length || 0);
    console.log("STRIPE_SECRET_KEY starts with sk_:", stripeKey?.startsWith("sk_") || false);
    
    return new Response(JSON.stringify({ 
      hasKey: !!stripeKey,
      keyLength: stripeKey?.length || 0,
      startsWithSk: stripeKey?.startsWith("sk_") || false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
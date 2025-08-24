import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CHECK-CREDITS FUNCTION STARTED ===");
    
    // Initialize Supabase clients
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user with better error handling
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("TOKEN VALIDATION: Attempting to validate user token");
    
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.log("Authentication failed:", userError?.message);
      
      // Handle expired sessions more gracefully
      if (userError?.message.includes("session_not_found") || userError?.message.includes("expired")) {
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
        JSON.stringify({ error: "Invalid or expired session" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const user = userData.user;
    console.log("User authenticated:", user.email);

    // Fetch user credits using admin client
    let { data: credits, error } = await supabaseAdmin
      .from("user_credits")
      .select("credits_remaining, total_credits_used")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // If no credits record exists (new user), create one with default credits
    if (!credits) {
      console.log("No credits record found, creating default credits for new user");
      
      const { data: newCredits, error: insertError } = await supabaseAdmin
        .from("user_credits")
        .insert({
          user_id: user.id,
          credits_remaining: 5,
          total_credits_used: 0,
        })
        .select("credits_remaining, total_credits_used")
        .single();

      if (insertError) {
        console.error("Error creating credits:", insertError);
        return new Response(
          JSON.stringify({ error: "Error initializing credits" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      credits = newCredits;
    }

    console.log("Credits retrieved:", credits);

    return new Response(
      JSON.stringify({
        credits_remaining: credits.credits_remaining,
        total_credits_used: credits.total_credits_used,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error: any) {
    console.error("Unexpected error in check-credits:", error);
    
    // Handle specific authentication errors
    if (error.message && (error.message.includes("session_not_found") || error.message.includes("Session not found"))) {
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
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        debug: error.message || "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
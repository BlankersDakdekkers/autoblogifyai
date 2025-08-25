import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[MONTHLY-REFRESH] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Monthly credit refresh cron job started");
    
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Call the database function to refresh monthly credits
    const { error: refreshError } = await supabaseService.rpc('refresh_monthly_credits');
    
    if (refreshError) {
      throw new Error(`Credit refresh failed: ${refreshError.message}`);
    }

    // Get statistics of what was refreshed
    const { data: refreshedSubscribers, error: statsError } = await supabaseService
      .from('subscribers')
      .select('subscription_tier, monthly_credit_limit, user_id')
      .eq('subscribed', true)
      .eq('credits_reset_date', new Date().toISOString().split('T')[0]);

    if (statsError) {
      logStep("Warning: Could not fetch refresh statistics", statsError);
    }

    const stats = refreshedSubscribers?.reduce((acc, sub) => {
      const tier = sub.subscription_tier || 'unknown';
      acc.totalRefreshed += 1;
      acc.creditsByTier[tier] = (acc.creditsByTier[tier] || 0) + sub.monthly_credit_limit;
      acc.usersByTier[tier] = (acc.usersByTier[tier] || 0) + 1;
      return acc;
    }, {
      totalRefreshed: 0,
      creditsByTier: {} as Record<string, number>,
      usersByTier: {} as Record<string, number>
    }) || { totalRefreshed: 0, creditsByTier: {}, usersByTier: {} };

    // Log successful completion
    logStep("Monthly credit refresh completed successfully", {
      totalUsersRefreshed: stats.totalRefreshed,
      creditsByTier: stats.creditsByTier,
      usersByTier: stats.usersByTier,
      completedAt: new Date().toISOString()
    });

    // Optional: Send notification email to admin about completion
    // This would require setting up email notifications

    return new Response(JSON.stringify({
      success: true,
      message: "Monthly credit refresh completed",
      statistics: stats,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logStep("CRITICAL ERROR in monthly refresh", { error: errorMessage });
    
    // In a production environment, you'd want to send an alert here
    // to notify administrators of the failed refresh
    
    return new Response(JSON.stringify({ 
      error: "Monthly credit refresh failed",
      details: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
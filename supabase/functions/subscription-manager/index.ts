import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[SUBSCRIPTION-MANAGER] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Subscription manager started");
    
    const { action, user_id } = await req.json();
    
    if (!action) {
      throw new Error("Action parameter required");
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let result;
    
    switch (action) {
      case 'refresh_credits':
        result = await refreshUserCredits(supabaseService, user_id);
        break;
        
      case 'refresh_all_credits':
        result = await refreshAllSubscriberCredits(supabaseService);
        break;
        
      case 'check_credit_status':
        result = await checkCreditStatus(supabaseService, user_id);
        break;
        
      case 'get_subscription_stats':
        result = await getSubscriptionStats(supabaseService);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Error in subscription manager", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function refreshUserCredits(supabase: any, userId: string) {
  logStep("Refreshing credits for user", { userId });
  
  if (!userId) {
    throw new Error("User ID required for credit refresh");
  }

  // Get user's subscription info
  const { data: subscriber, error: subError } = await supabase
    .from('subscribers')
    .select('subscription_tier, monthly_credit_limit, subscribed, credits_reset_date')
    .eq('user_id', userId)
    .maybeSingle();

  if (subError) {
    throw new Error(`Error fetching subscription: ${subError.message}`);
  }

  let creditLimit = 5; // Default free tier
  let resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1);

  if (subscriber?.subscribed && subscriber.monthly_credit_limit) {
    creditLimit = subscriber.monthly_credit_limit;
    
    // Update reset date if needed
    if (!subscriber.credits_reset_date || new Date(subscriber.credits_reset_date) <= new Date()) {
      await supabase
        .from('subscribers')
        .update({ 
          credits_reset_date: resetDate.toISOString().split('T')[0] 
        })
        .eq('user_id', userId);
    }
  }

  // Update user credits
  const { error: creditError } = await supabase
    .from('user_credits')
    .upsert({
      user_id: userId,
      credits_remaining: creditLimit,
      last_credit_update: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (creditError) {
    throw new Error(`Error updating credits: ${creditError.message}`);
  }

  logStep("Credits refreshed successfully", { 
    userId, 
    newCredits: creditLimit,
    tier: subscriber?.subscription_tier || 'free'
  });

  return {
    success: true,
    credits_refreshed: creditLimit,
    subscription_tier: subscriber?.subscription_tier || 'free',
    next_reset: resetDate.toISOString()
  };
}

async function refreshAllSubscriberCredits(supabase: any) {
  logStep("Refreshing credits for all subscribers");

  // Call the database function to refresh monthly credits
  const { data, error } = await supabase.rpc('refresh_monthly_credits');
  
  if (error) {
    throw new Error(`Error refreshing credits: ${error.message}`);
  }

  // Get stats on how many were refreshed
  const { data: stats, error: statsError } = await supabase
    .from('subscribers')
    .select('subscription_tier')
    .eq('subscribed', true);

  if (statsError) {
    logStep("Warning: Could not get refresh stats", statsError);
  }

  const tierCounts = stats?.reduce((acc: any, sub: any) => {
    acc[sub.subscription_tier] = (acc[sub.subscription_tier] || 0) + 1;
    return acc;
  }, {}) || {};

  logStep("Bulk credit refresh completed", { tierCounts });

  return {
    success: true,
    message: "Monthly credits refreshed for all active subscribers",
    subscribers_refreshed: stats?.length || 0,
    breakdown_by_tier: tierCounts
  };
}

async function checkCreditStatus(supabase: any, userId: string) {
  if (!userId) {
    throw new Error("User ID required for credit status check");
  }

  // Get current credit status
  const { data: credits, error: creditError } = await supabase
    .from('user_credits')
    .select('credits_remaining, total_credits_used, last_credit_update')
    .eq('user_id', userId)
    .maybeSingle();

  if (creditError) {
    throw new Error(`Error fetching credits: ${creditError.message}`);
  }

  // Get subscription info
  const { data: subscriber, error: subError } = await supabase
    .from('subscribers')
    .select('subscription_tier, monthly_credit_limit, subscribed, credits_reset_date, subscription_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (subError) {
    throw new Error(`Error fetching subscription: ${subError.message}`);
  }

  const now = new Date();
  const resetDate = subscriber?.credits_reset_date ? new Date(subscriber.credits_reset_date) : null;
  const isResetDue = resetDate ? resetDate <= now : false;

  return {
    credits: {
      remaining: credits?.credits_remaining || 0,
      used_this_period: credits?.total_credits_used || 0,
      last_updated: credits?.last_credit_update,
      reset_due: isResetDue
    },
    subscription: {
      tier: subscriber?.subscription_tier || 'free',
      monthly_limit: subscriber?.monthly_credit_limit || 5,
      subscribed: subscriber?.subscribed || false,
      next_reset: subscriber?.credits_reset_date,
      expires: subscriber?.subscription_end
    }
  };
}

async function getSubscriptionStats(supabase: any) {
  logStep("Getting subscription statistics");

  // Get subscription breakdown
  const { data: subscriptions, error: subError } = await supabase
    .from('subscribers')
    .select('subscription_tier, subscribed, created_at, monthly_credit_limit');

  if (subError) {
    throw new Error(`Error fetching subscription stats: ${subError.message}`);
  }

  // Get credit usage stats
  const { data: creditStats, error: creditError } = await supabase
    .from('user_credits')
    .select('credits_remaining, total_credits_used');

  if (creditError) {
    throw new Error(`Error fetching credit stats: ${creditError.message}`);
  }

  // Process statistics
  const activeSubs = subscriptions?.filter(s => s.subscribed) || [];
  const tierBreakdown = activeSubs.reduce((acc: any, sub: any) => {
    const tier = sub.subscription_tier || 'free';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const totalCreditsInCirculation = creditStats?.reduce((sum, c) => sum + (c.credits_remaining || 0), 0) || 0;
  const totalCreditsUsed = creditStats?.reduce((sum, c) => sum + (c.total_credits_used || 0), 0) || 0;

  return {
    total_users: subscriptions?.length || 0,
    active_subscribers: activeSubs.length,
    tier_breakdown: tierBreakdown,
    credit_stats: {
      total_credits_in_circulation: totalCreditsInCirculation,
      total_credits_used: totalCreditsUsed,
      average_credits_per_user: subscriptions?.length ? Math.round(totalCreditsInCirculation / subscriptions.length) : 0
    },
    generated_at: new Date().toISOString()
  };
}
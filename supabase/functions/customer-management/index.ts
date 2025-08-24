import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-MANAGEMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify JWT and get user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) throw new Error(`Role check error: ${roleError.message}`);
    
    const isAdmin = userRoles?.some(role => role.role === 'admin');
    if (!isAdmin) throw new Error("Admin access required");
    logStep("Admin access verified");

    const { method, url } = req;
    const urlObj = new URL(url);
    const action = urlObj.searchParams.get('action');

    switch (method) {
      case 'GET':
        return await handleGetCustomers(supabaseClient, action);
      case 'POST':
        const body = await req.json();
        return await handleCustomerAction(supabaseClient, action, body);
      default:
        throw new Error(`Method ${method} not allowed`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-management", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleGetCustomers(supabaseClient: any, action: string | null) {
  logStep("Fetching customers data");

  if (action === 'analytics') {
    return await getCustomerAnalytics(supabaseClient);
  }

  // Fetch comprehensive customer data
  const { data: profiles, error: profilesError } = await supabaseClient
    .from('profiles')
    .select(`
      user_id,
      display_name,
      created_at,
      updated_at,
      onboarding_completed
    `)
    .order('created_at', { ascending: false });

  if (profilesError) throw new Error(`Error fetching profiles: ${profilesError.message}`);

  const { data: subscribers, error: subscribersError } = await supabaseClient
    .from('subscribers')
    .select(`
      user_id,
      email,
      stripe_customer_id,
      subscribed,
      subscription_tier,
      subscription_end,
      created_at,
      updated_at
    `);

  const { data: userCredits, error: creditsError } = await supabaseClient
    .from('user_credits')
    .select(`
      user_id,
      credits_remaining,
      total_credits_used,
      last_credit_update
    `);

  const { data: userRoles, error: rolesError } = await supabaseClient
    .from('user_roles')
    .select(`
      user_id,
      role
    `);

  // Create lookup maps
  const subscribersMap = new Map(subscribers?.map((s: any) => [s.user_id, s]) || []);
  const creditsMap = new Map(userCredits?.map((c: any) => [c.user_id, c]) || []);
  const rolesMap = new Map(userRoles?.map((r: any) => [r.user_id, r.role]) || []);

  // Combine all data
  const customers = profiles?.map((profile: any) => {
    const subscription = subscribersMap.get(profile.user_id);
    const credits = creditsMap.get(profile.user_id);
    const role = rolesMap.get(profile.user_id);

    return {
      id: profile.user_id,
      email: subscription?.email || 'Onbekend',
      display_name: profile.display_name,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      onboarding_completed: profile.onboarding_completed,
      role: role || 'user',
      subscribed: subscription?.subscribed || false,
      subscription_tier: subscription?.subscription_tier,
      subscription_end: subscription?.subscription_end,
      stripe_customer_id: subscription?.stripe_customer_id,
      credits_remaining: credits?.credits_remaining || 0,
      total_credits_used: credits?.total_credits_used || 0,
      last_credit_update: credits?.last_credit_update,
    };
  }) || [];

  logStep("Customer data fetched successfully", { count: customers.length });

  return new Response(JSON.stringify({ customers }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function getCustomerAnalytics(supabaseClient: any) {
  logStep("Fetching customer analytics");

  const [
    { data: totalCustomers },
    { data: activeSubscribers },
    { data: totalCreditsData },
    { data: recentSignups }
  ] = await Promise.all([
    supabaseClient.from('profiles').select('user_id', { count: 'exact', head: true }),
    supabaseClient.from('subscribers').select('user_id', { count: 'exact', head: true }).eq('subscribed', true),
    supabaseClient.from('user_credits').select('credits_remaining, total_credits_used'),
    supabaseClient.from('profiles').select('created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  ]);

  const totalCreditsRemaining = totalCreditsData?.reduce((sum: number, c: any) => sum + (c.credits_remaining || 0), 0) || 0;
  const totalCreditsUsed = totalCreditsData?.reduce((sum: number, c: any) => sum + (c.total_credits_used || 0), 0) || 0;

  const analytics = {
    totalCustomers: totalCustomers?.length || 0,
    activeSubscribers: activeSubscribers?.length || 0,
    totalCreditsRemaining,
    totalCreditsUsed,
    recentSignups: recentSignups?.length || 0,
    conversionRate: totalCustomers && activeSubscribers ? 
      ((activeSubscribers.length / totalCustomers.length) * 100).toFixed(2) : '0.00'
  };

  return new Response(JSON.stringify({ analytics }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function handleCustomerAction(supabaseClient: any, action: string | null, body: any) {
  logStep("Processing customer action", { action, body });

  switch (action) {
    case 'add_credits':
      return await addCreditsToCustomer(supabaseClient, body);
    case 'update_role':
      return await updateCustomerRole(supabaseClient, body);
    case 'export_customers':
      return await exportCustomers(supabaseClient);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function addCreditsToCustomer(supabaseClient: any, { userId, credits }: { userId: string, credits: number }) {
  logStep("Adding credits to customer", { userId, credits });

  const { data, error } = await supabaseClient.rpc('add_credits', {
    user_uuid: userId,
    credit_amount: credits
  });

  if (error) throw new Error(`Failed to add credits: ${error.message}`);

  return new Response(JSON.stringify({ success: true, message: `${credits} credits toegevoegd` }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function updateCustomerRole(supabaseClient: any, { userId, role }: { userId: string, role: string }) {
  logStep("Updating customer role", { userId, role });

  // First delete existing role
  await supabaseClient
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  // Then insert new role
  const { error } = await supabaseClient
    .from('user_roles')
    .insert({ user_id: userId, role });

  if (error) throw new Error(`Failed to update role: ${error.message}`);

  return new Response(JSON.stringify({ success: true, message: `Rol bijgewerkt naar ${role}` }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function exportCustomers(supabaseClient: any) {
  logStep("Exporting customers");

  // This would return CSV data for export
  const { customers } = JSON.parse((await handleGetCustomers(supabaseClient, null)).body);
  
  const csvData = customers.map((c: any) => ({
    Email: c.email,
    'Display Name': c.display_name || '',
    Role: c.role,
    Subscribed: c.subscribed ? 'Ja' : 'Nee',
    'Subscription Tier': c.subscription_tier || '',
    'Credits Remaining': c.credits_remaining,
    'Total Credits Used': c.total_credits_used,
    'Created At': c.created_at
  }));

  return new Response(JSON.stringify({ csvData }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}
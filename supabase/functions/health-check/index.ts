import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
  timestamp: string;
  details?: any;
}

interface SystemHealth {
  overall_status: 'healthy' | 'degraded' | 'down';
  checks: HealthCheck[];
  uptime: number;
  version: string;
}

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[HEALTH-CHECK] ${timestamp} - ${step}`, details ? JSON.stringify(details) : '');
};

const checkDatabase = async (supabase: any): Promise<HealthCheck> => {
  const start = Date.now();
  try {
    logStep("Checking database connection");
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - start;
    
    if (error) {
      logStep("Database check failed", { error: error.message });
      return {
        service: 'database',
        status: 'down',
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: { error: error.message }
      };
    }
    
    logStep("Database check successful", { response_time: responseTime });
    return {
      service: 'database',
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      details: { query: 'profiles table accessible' }
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    logStep("Database check error", { error: error.message });
    return {
      service: 'database',
      status: 'down',
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      details: { error: error.message }
    };
  }
};

const checkOpenAI = async (): Promise<HealthCheck> => {
  const start = Date.now();
  try {
    logStep("Checking OpenAI API");
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return {
        service: 'openai',
        status: 'down',
        response_time: 0,
        timestamp: new Date().toISOString(),
        details: { error: 'API key not configured' }
      };
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const responseTime = Date.now() - start;
    
    if (!response.ok) {
      logStep("OpenAI check failed", { status: response.status });
      return {
        service: 'openai',
        status: 'down',
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: { error: `HTTP ${response.status}` }
      };
    }

    logStep("OpenAI check successful", { response_time: responseTime });
    return {
      service: 'openai',
      status: responseTime < 2000 ? 'healthy' : 'degraded',
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      details: { api_accessible: true }
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    logStep("OpenAI check error", { error: error.message });
    return {
      service: 'openai',
      status: 'down',
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      details: { error: error.message }
    };
  }
};

const checkStripe = async (): Promise<HealthCheck> => {
  const start = Date.now();
  try {
    logStep("Checking Stripe API");
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return {
        service: 'stripe',
        status: 'down',
        response_time: 0,
        timestamp: new Date().toISOString(),
        details: { error: 'Stripe key not configured' }
      };
    }

    // Simple account check
    const response = await fetch('https://api.stripe.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const responseTime = Date.now() - start;
    
    if (!response.ok) {
      logStep("Stripe check failed", { status: response.status });
      return {
        service: 'stripe',
        status: 'down',
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: { error: `HTTP ${response.status}` }
      };
    }

    logStep("Stripe check successful", { response_time: responseTime });
    return {
      service: 'stripe',
      status: responseTime < 2000 ? 'healthy' : 'degraded',
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      details: { api_accessible: true }
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    logStep("Stripe check error", { error: error.message });
    return {
      service: 'stripe',
      status: 'down',
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      details: { error: error.message }
    };
  }
};

const checkStorage = async (supabase: any): Promise<HealthCheck> => {
  const start = Date.now();
  try {
    logStep("Checking storage");
    
    const { data, error } = await supabase.storage.listBuckets();
    
    const responseTime = Date.now() - start;
    
    if (error) {
      logStep("Storage check failed", { error: error.message });
      return {
        service: 'storage',
        status: 'down',
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: { error: error.message }
      };
    }
    
    logStep("Storage check successful", { response_time: responseTime, buckets: data?.length || 0 });
    return {
      service: 'storage',
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      details: { buckets_accessible: data?.length || 0 }
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    logStep("Storage check error", { error: error.message });
    return {
      service: 'storage',
      status: 'down',
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      details: { error: error.message }
    };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Health check started");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Run all health checks in parallel
    const [databaseCheck, openaiCheck, stripeCheck, storageCheck] = await Promise.all([
      checkDatabase(supabase),
      checkOpenAI(),
      checkStripe(),
      checkStorage(supabase)
    ]);

    const checks = [databaseCheck, openaiCheck, stripeCheck, storageCheck];
    
    // Determine overall status
    const downServices = checks.filter(check => check.status === 'down');
    const degradedServices = checks.filter(check => check.status === 'degraded');
    
    let overallStatus: 'healthy' | 'degraded' | 'down';
    if (downServices.length > 0) {
      overallStatus = 'down';
    } else if (degradedServices.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const systemHealth: SystemHealth = {
      overall_status: overallStatus,
      checks,
      uptime: Date.now(), // In production, track actual uptime
      version: '1.0.0'
    };

    logStep("Health check completed", { 
      overall_status: overallStatus,
      services_down: downServices.length,
      services_degraded: degradedServices.length 
    });

    // Log to database for monitoring history
    try {
      await supabase.from('system_health_logs').insert({
        overall_status: overallStatus,
        checks: checks,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logStep("Failed to log health check to database", { error: error.message });
    }

    return new Response(JSON.stringify(systemHealth), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
      status: overallStatus === 'down' ? 503 : 200,
    });

  } catch (error) {
    logStep("Health check error", { error: error.message });
    
    const errorResponse: SystemHealth = {
      overall_status: 'down',
      checks: [{
        service: 'system',
        status: 'down',
        response_time: 0,
        timestamp: new Date().toISOString(),
        details: { error: error.message }
      }],
      uptime: 0,
      version: '1.0.0'
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 503,
    });
  }
});
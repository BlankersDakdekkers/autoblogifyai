import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
  identifier: string;
}

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[RATE-LIMITER] ${timestamp} - ${step}`, details ? JSON.stringify(details) : '');
};

const getRateLimitKey = (req: Request, userId?: string): string => {
  // Use user ID if available, otherwise fall back to IP
  if (userId) {
    return `user:${userId}`;
  }
  
  // Get IP from various headers (for different proxy setups)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  return `ip:${ip}`;
};

const checkRateLimit = async (
  supabase: any, 
  identifier: string, 
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> => {
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes);

  try {
    logStep("Checking rate limit", { identifier, config });

    // Get existing rate limit record
    const { data: existingLimit, error: fetchError } = await supabase
      .from('auth_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('attempt_type', 'api_request')
      .gte('window_start', windowStart.toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      logStep("Error fetching rate limit", { error: fetchError.message });
      // On error, allow the request but log it
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: new Date(Date.now() + config.windowMinutes * 60 * 1000)
      };
    }

    const now = new Date();
    
    if (!existingLimit) {
      // First request in this window
      logStep("First request in window, creating new record");
      
      await supabase.from('auth_rate_limits').insert({
        identifier,
        attempt_type: 'api_request',
        attempts: 1,
        window_start: now.toISOString(),
        created_at: now.toISOString()
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: new Date(now.getTime() + config.windowMinutes * 60 * 1000)
      };
    }

    // Check if we're still in the same window
    const windowStartTime = new Date(existingLimit.window_start);
    const windowEnd = new Date(windowStartTime.getTime() + config.windowMinutes * 60 * 1000);
    
    if (now > windowEnd) {
      // Window expired, start new window
      logStep("Window expired, starting new window");
      
      await supabase
        .from('auth_rate_limits')
        .update({
          attempts: 1,
          window_start: now.toISOString(),
          created_at: now.toISOString()
        })
        .eq('id', existingLimit.id);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: new Date(now.getTime() + config.windowMinutes * 60 * 1000)
      };
    }

    // Still in current window
    if (existingLimit.attempts >= config.maxRequests) {
      logStep("Rate limit exceeded", { 
        attempts: existingLimit.attempts, 
        maxRequests: config.maxRequests 
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowEnd
      };
    }

    // Increment attempt count
    logStep("Incrementing attempt count", { 
      currentAttempts: existingLimit.attempts,
      maxRequests: config.maxRequests 
    });
    
    await supabase
      .from('auth_rate_limits')
      .update({
        attempts: existingLimit.attempts + 1
      })
      .eq('id', existingLimit.id);

    return {
      allowed: true,
      remaining: config.maxRequests - (existingLimit.attempts + 1),
      resetTime: windowEnd
    };

  } catch (error) {
    logStep("Rate limit check error", { error: error.message });
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: new Date(Date.now() + config.windowMinutes * 60 * 1000)
    };
  }
};

const getRateLimitConfig = (endpoint: string, isAuthenticated: boolean): RateLimitConfig => {
  // Different rate limits for different endpoints and user types
  const configs: Record<string, RateLimitConfig> = {
    // AI Content Generation (expensive operations)
    'generate-content': {
      maxRequests: isAuthenticated ? 50 : 5,
      windowMinutes: 60,
      identifier: 'generate-content'
    },
    'generate-keywords': {
      maxRequests: isAuthenticated ? 100 : 10,
      windowMinutes: 60,
      identifier: 'generate-keywords'
    },
    'generate-blog-images': {
      maxRequests: isAuthenticated ? 30 : 3,
      windowMinutes: 60,
      identifier: 'generate-images'
    },
    
    // CSV Processing (resource intensive)
    'process-csv': {
      maxRequests: isAuthenticated ? 20 : 2,
      windowMinutes: 60,
      identifier: 'process-csv'
    },
    
    // Authentication (security sensitive)
    'create-checkout': {
      maxRequests: isAuthenticated ? 10 : 3,
      windowMinutes: 15,
      identifier: 'create-checkout'
    },
    'check-subscription': {
      maxRequests: isAuthenticated ? 60 : 10,
      windowMinutes: 60,
      identifier: 'check-subscription'
    },
    
    // Default for other endpoints
    'default': {
      maxRequests: isAuthenticated ? 200 : 20,
      windowMinutes: 60,
      identifier: 'default'
    }
  };

  return configs[endpoint] || configs['default'];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'GET' } = await req.json();
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint parameter required' }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    logStep("Rate limit check requested", { endpoint, method });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Try to get user from auth header
    let userId: string | undefined;
    let isAuthenticated = false;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabase.auth.getUser(token);
        if (data.user) {
          userId = data.user.id;
          isAuthenticated = true;
        }
      } catch (error) {
        logStep("Failed to authenticate user", { error: error.message });
      }
    }

    const config = getRateLimitConfig(endpoint, isAuthenticated);
    const identifier = getRateLimitKey(req, userId);
    
    const result = await checkRateLimit(supabase, identifier, config);
    
    const headers = {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": config.maxRequests.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": Math.floor(result.resetTime.getTime() / 1000).toString(),
    };

    if (!result.allowed) {
      logStep("Rate limit exceeded", { 
        identifier, 
        endpoint,
        resetTime: result.resetTime 
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${result.resetTime.toISOString()}`,
          resetTime: result.resetTime.toISOString()
        }),
        { status: 429, headers }
      );
    }

    logStep("Rate limit check passed", { 
      identifier,
      endpoint, 
      remaining: result.remaining 
    });

    return new Response(
      JSON.stringify({ 
        allowed: true,
        remaining: result.remaining,
        resetTime: result.resetTime.toISOString()
      }),
      { status: 200, headers }
    );

  } catch (error) {
    logStep("Rate limiter error", { error: error.message });
    
    return new Response(
      JSON.stringify({ 
        error: 'Rate limiter service error',
        message: 'Unable to check rate limits. Request allowed by default.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
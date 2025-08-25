import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { siteUrl, username, appPassword } = await req.json();

    if (!siteUrl || !username || !appPassword) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Alle WordPress gegevens zijn vereist'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean and normalize inputs
    const normalizedUrl = siteUrl.trim().replace(/\/$/, '');
    const cleanUsername = username.trim();
    const cleanAppPassword = appPassword.replace(/\s+/g, '');
    
    console.log('Testing WordPress connection:', {
      siteUrl: normalizedUrl,
      username: cleanUsername,
      passwordLength: cleanAppPassword.length
    });

    // Step 1: Test if WordPress site is reachable
    console.log('Step 1: Testing site reachability...');
    try {
      const siteResponse = await fetch(normalizedUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': 'AutoblogifyAI/1.0' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      console.log('Site response:', {
        status: siteResponse.status,
        statusText: siteResponse.statusText,
        ok: siteResponse.ok
      });
      
      if (!siteResponse.ok) {
        console.log('Site not reachable, status:', siteResponse.status);
        return new Response(
          JSON.stringify({
            success: false,
            step: 'site_reachability',
            error: `WordPress site niet bereikbaar (${siteResponse.status}). Controleer de URL: ${normalizedUrl}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Site is reachable');
    } catch (siteError: any) {
      console.error('Site reachability failed:', siteError.message);
      return new Response(
        JSON.stringify({
          success: false,
          step: 'site_reachability',
          error: `Kan WordPress site niet bereiken: ${siteError.message}. Controleer of de URL correct is en toegankelijk.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Test WordPress REST API availability
    console.log('Step 2: Testing WordPress REST API...');
    const apiTestUrl = `${normalizedUrl}/wp-json/wp/v2`;
    try {
      const apiResponse = await fetch(apiTestUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'AutoblogifyAI/1.0' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      console.log('REST API response:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        ok: apiResponse.ok
      });
      
      if (!apiResponse.ok) {
        console.log('REST API not available, status:', apiResponse.status);
        return new Response(
          JSON.stringify({
            success: false,
            step: 'rest_api',
            error: `WordPress REST API niet beschikbaar (${apiResponse.status}). Controleer of permalinks zijn ingeschakeld in WordPress → Settings → Permalinks.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('REST API is available');
    } catch (apiError: any) {
      console.error('REST API test failed:', apiError.message);
      return new Response(
        JSON.stringify({
          success: false,
          step: 'rest_api',
          error: `WordPress REST API fout: ${apiError.message}. Mogelijk zijn permalinks niet ingeschakeld.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Test authentication
    console.log('Step 3: Testing authentication...');
    const credentials = btoa(`${cleanUsername}:${cleanAppPassword}`);
    const authUrl = `${normalizedUrl}/wp-json/wp/v2/users/me`;
    
    console.log('Making auth request to:', authUrl);
    console.log('Credentials length:', credentials.length);
    
    try {
      const authResponse = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'AutoblogifyAI/1.0',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout for auth
      });

      console.log('Auth response:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        ok: authResponse.ok,
        headers: Object.fromEntries(authResponse.headers.entries())
      });

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.log('Auth failed, response body:', errorText);
        
        let errorDetails = errorText;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.message || errorJson.code || errorText;
          console.log('Parsed error:', errorJson);
        } catch (e) {
          console.log('Could not parse error as JSON');
        }

        if (authResponse.status === 401) {
          return new Response(
            JSON.stringify({
              success: false,
              step: 'authentication',
              error: `Authenticatie gefaald. Controleer:
• Gebruikersnaam '${cleanUsername}' bestaat en is correct gespeld
• Application Password is geldig (geen gewoon wachtwoord!)
• Application Password is gegeneerd in WordPress → Users → Profile
• Gebruiker is actief en niet geblokkeerd

Details: ${errorDetails}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: false,
            step: 'authentication',
            error: `Authenticatie fout (${authResponse.status}): ${errorDetails}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userData = await authResponse.json();
      console.log('Auth successful, user data:', {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        roles: userData.roles
      });
      
      // Step 4: Check user permissions
      const canPublish = userData.capabilities?.publish_posts || 
                        userData.roles?.includes('administrator') || 
                        userData.roles?.includes('editor');

      if (!canPublish) {
        return new Response(
          JSON.stringify({
            success: false,
            step: 'permissions',
            error: `Gebruiker '${cleanUsername}' heeft geen rechten om posts te publiceren. Huidige rollen: ${userData.roles?.join(', ') || 'geen'}. Vereist: Administrator of Editor.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Success!
      return new Response(
        JSON.stringify({
          success: true,
          message: 'WordPress verbinding succesvol getest!',
          user: {
            id: userData.id,
            username: userData.username,
            name: userData.name,
            roles: userData.roles
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (authError) {
      return new Response(
        JSON.stringify({
          success: false,
          step: 'authentication',
          error: `Verbindingsfout: ${authError.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('WordPress connection test error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Onbekende fout bij verbindingstest'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

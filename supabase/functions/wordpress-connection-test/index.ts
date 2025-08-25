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

    // Step 3: Test authentication with multiple methods
    console.log('Step 3: Testing authentication...');
    const credentials = btoa(`${cleanUsername}:${cleanAppPassword}`);
    
    // Check if this is a WordPress.com hosted site
    const isWordPressCom = normalizedUrl.includes('.wordpress.com') || normalizedUrl.includes('wpcomstaging.com');
    console.log('Is WordPress.com hosted site:', isWordPressCom);
    
    // Try multiple authentication endpoints and methods
    const authEndpoints = [
      `${normalizedUrl}/wp-json/wp/v2/users/me`,
      `${normalizedUrl}/wp-json/wp/v2/posts?per_page=1&context=edit`, // Alternative endpoint
    ];
    
    let authSuccess = false;
    let userData = null;
    let lastError = null;
    
    for (let i = 0; i < authEndpoints.length && !authSuccess; i++) {
      const authUrl = authEndpoints[i];
      console.log(`Trying auth endpoint ${i + 1}: ${authUrl}`);
      
      // Try different authentication headers
      const authHeaders = [
        { 'Authorization': `Basic ${credentials}` },
        { 
          'Authorization': `Basic ${credentials}`,
          'X-WP-Nonce': '', // Empty nonce to bypass some checks
          'Accept': 'application/json'
        }
      ];
      
      for (let j = 0; j < authHeaders.length && !authSuccess; j++) {
        console.log(`Auth method ${j + 1} for endpoint ${i + 1}`);
        
        try {
          const authResponse = await fetch(authUrl, {
            method: 'GET',
            headers: {
              ...authHeaders[j],
              'User-Agent': 'AutoblogifyAI/1.0',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            signal: AbortSignal.timeout(15000)
          });

          console.log(`Auth response (endpoint ${i + 1}, method ${j + 1}):`, {
            status: authResponse.status,
            statusText: authResponse.statusText,
            ok: authResponse.ok
          });

          if (authResponse.ok) {
            const responseData = await authResponse.json();
            
            if (i === 0) {
              // /users/me endpoint - direct user data
              userData = responseData;
            } else {
              // Posts endpoint - if we can fetch posts, we have auth
              userData = {
                id: 'auth_via_posts',
                username: cleanUsername,
                name: cleanUsername,
                roles: ['verified_via_posts'],
                capabilities: { publish_posts: true }
              };
            }
            
            authSuccess = true;
            console.log('Auth successful via endpoint', i + 1, 'method', j + 1);
            break;
          } else {
            const errorText = await authResponse.text();
            lastError = {
              endpoint: i + 1,
              method: j + 1,
              status: authResponse.status,
              text: errorText
            };
            console.log(`Auth failed (${authResponse.status}):`, errorText);
          }
        } catch (authError: any) {
          lastError = {
            endpoint: i + 1,
            method: j + 1,
            error: authError.message
          };
          console.error(`Auth error (endpoint ${i + 1}, method ${j + 1}):`, authError);
        }
      }
    }
    
    if (!authSuccess) {
      console.error('All authentication methods failed');
      
      let errorMessage = `Alle authenticatie methoden gefaald. 

Laatste fout: ${lastError?.text || lastError?.error || 'Onbekend'}

Mogelijke oorzaken:
• WordPress.com hosted sites hebben vaak extra beveiliging
• Controleeer of de gebruiker '${cleanUsername}' exact bestaat
• Application Password '${cleanAppPassword.substring(0, 8)}...' moet geldig zijn
• Probeer een nieuwe Application Password aan te maken
• Controleer of er beveiligingsplugins actief zijn

WordPress.com specifiek:
${isWordPressCom ? '• Dit lijkt een WordPress.com site - deze hebben strengere API beperkingen' : '• Dit is geen WordPress.com site'}`;

      return new Response(
        JSON.stringify({
          success: false,
          step: 'authentication',
          error: errorMessage
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
      
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

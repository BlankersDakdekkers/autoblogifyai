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
    
    // Try multiple authentication methods to bypass nonce issues
    const authTests = [
      // Test 1: Direct user endpoint with clean headers
      {
        url: `${normalizedUrl}/wp-json/wp/v2/users/me`,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json',
          'User-Agent': 'AutoblogifyAI/1.0'
        }
      },
      // Test 2: Posts endpoint with minimal headers (bypass nonce)
      {
        url: `${normalizedUrl}/wp-json/wp/v2/posts?per_page=1&context=edit`,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'AutoblogifyAI/1.0'
        }
      },
      // Test 3: Try with X-Requested-With header (some plugins require this)
      {
        url: `${normalizedUrl}/wp-json/wp/v2/users/me`,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'AutoblogifyAI/1.0'
        }
      },
      // Test 4: Try CREATE operation to test full permissions
      {
        url: `${normalizedUrl}/wp-json/wp/v2/posts`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AutoblogifyAI/1.0'
        },
        body: JSON.stringify({
          title: 'AutoblogifyAI Test Post',
          content: 'This is a test post to verify authentication and publishing permissions.',
          status: 'draft'
        })
      }
    ];
    
    let authSuccess = false;
    let userData = null;
    let lastError = null;
    let testResults = [];
    
    for (let i = 0; i < authTests.length && !authSuccess; i++) {
      const test = authTests[i];
      console.log(`Auth test ${i + 1}: ${test.method} ${test.url}`);
      
      try {
        const authResponse = await fetch(test.url, {
          method: test.method,
          headers: test.headers,
          body: test.body,
          signal: AbortSignal.timeout(15000)
        });

        const result = {
          test: i + 1,
          method: test.method,
          status: authResponse.status,
          statusText: authResponse.statusText,
          ok: authResponse.ok
        };

        console.log(`Auth test ${i + 1} result:`, result);
        testResults.push(result);

        if (authResponse.ok) {
          const responseData = await authResponse.json();
          
          if (i === 0 || i === 2) {
            // /users/me endpoint - direct user data
            userData = responseData;
          } else if (i === 1) {
            // Posts endpoint - if we can fetch posts, we have read auth
            userData = {
              id: 'auth_via_posts_read',
              username: cleanUsername,
              name: cleanUsername,
              roles: ['verified_via_posts'],
              capabilities: { read: true }
            };
          } else if (i === 3) {
            // POST endpoint - we can create posts
            userData = {
              id: responseData.id || 'auth_via_post_creation',
              username: cleanUsername,
              name: cleanUsername,
              roles: ['verified_via_creation'],
              capabilities: { publish_posts: true, create_posts: true }
            };
            
            // Clean up test post if it was created
            if (responseData.id) {
              try {
                await fetch(`${normalizedUrl}/wp-json/wp/v2/posts/${responseData.id}?force=true`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Basic ${credentials}`,
                    'User-Agent': 'AutoblogifyAI/1.0'
                  }
                });
                console.log('Test post cleaned up successfully');
              } catch (cleanupError) {
                console.log('Could not clean up test post:', cleanupError);
              }
            }
          }
          
          authSuccess = true;
          console.log(`Auth successful via test ${i + 1}`);
          break;
        } else {
          const errorText = await authResponse.text();
          lastError = {
            test: i + 1,
            status: authResponse.status,
            text: errorText
          };
          console.log(`Auth test ${i + 1} failed (${authResponse.status}):`, errorText);
        }
      } catch (authError: any) {
        const errorResult = {
          test: i + 1,
          error: authError.message
        };
        testResults.push(errorResult);
        lastError = errorResult;
        console.error(`Auth test ${i + 1} error:`, authError);
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

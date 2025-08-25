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
    const body = await req.json();
    console.log('Received request body:', body);
    
    // Handle both direct parameters and nested wordpressConfig object
    let siteUrl, username, appPassword;
    if (body.wordpressConfig) {
      ({ siteUrl, username, appPassword } = body.wordpressConfig);
    } else {
      ({ siteUrl, username, appPassword } = body);
    }

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
    const cleanAppPassword = appPassword.trim(); // Keep spaces in password
    
    console.log('=== WORDPRESS CONNECTION TEST START ===');
    console.log('Site URL:', normalizedUrl);
    console.log('Username:', cleanUsername);
    console.log('App Password Length:', cleanAppPassword.length);

    // Step 1: Test if WordPress site is reachable
    console.log('\n--- STEP 1: Site Reachability ---');
    try {
      const siteResponse = await fetch(normalizedUrl, {
        method: 'HEAD',
        headers: { 
          'User-Agent': 'AutoblogifyAI/1.0',
          'Accept': '*/*'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      console.log('Site HEAD request:', {
        status: siteResponse.status,
        statusText: siteResponse.statusText,
        ok: siteResponse.ok
      });
      
      if (!siteResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            step: 'site_reachability',
            error: `WordPress site niet bereikbaar (${siteResponse.status}). Controleer de URL: ${normalizedUrl}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('✅ Site is reachable');
    } catch (siteError: any) {
      console.error('❌ Site reachability failed:', siteError.message);
      return new Response(
        JSON.stringify({
          success: false,
          step: 'site_reachability',
          error: `Kan WordPress site niet bereiken: ${siteError.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Test WordPress REST API availability
    console.log('\n--- STEP 2: REST API Check ---');
    const apiTestUrl = `${normalizedUrl}/wp-json/wp/v2`;
    try {
      const apiResponse = await fetch(apiTestUrl, {
        method: 'GET',
        headers: { 
          'User-Agent': 'AutoblogifyAI/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      console.log('REST API response:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        ok: apiResponse.ok
      });
      
      if (!apiResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            step: 'rest_api',
            error: `WordPress REST API niet beschikbaar (${apiResponse.status}). Controleer permalinks in WordPress Settings.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('✅ REST API is available');
    } catch (apiError: any) {
      console.error('❌ REST API test failed:', apiError.message);
      return new Response(
        JSON.stringify({
          success: false,
          step: 'rest_api',
          error: `WordPress REST API fout: ${apiError.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Authentication Test
    console.log('\n--- STEP 3: Authentication & Permissions Test ---');
    const credentials = btoa(`${cleanUsername}:${cleanAppPassword}`);
    console.log('Basic Auth credentials prepared');
    console.log('Testing with username:', cleanUsername);
    console.log('Password length:', cleanAppPassword.length);
    
    // First test authentication with user info
    const authTestUrl = `${normalizedUrl}/wp-json/wp/v2/users/me`;
    
    try {
      const authResponse = await fetch(authTestUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'AutoblogifyAI/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000)
      });

      console.log('Authentication response:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        ok: authResponse.ok
      });

      if (authResponse.ok) {
        const userData = await authResponse.json();
        console.log('✅ Authentication successful');
        console.log('User data:', {
          id: userData.id,
          username: userData.username || userData.slug,
          name: userData.name,
          roles: userData.roles,
          capabilities: userData.capabilities ? Object.keys(userData.capabilities) : 'none'
        });

        // Step 4: Test actual posting permissions
        console.log('\n--- STEP 4: Testing Post Creation Rights ---');
        
        // Test if user can read posts in edit context (basic requirement)
        const postsReadUrl = `${normalizedUrl}/wp-json/wp/v2/posts?per_page=1&context=edit`;
        
        try {
          const postsReadResponse = await fetch(postsReadUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'User-Agent': 'AutoblogifyAI/1.0',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000)
          });

          console.log('Posts read test:', {
            status: postsReadResponse.status,
            ok: postsReadResponse.ok
          });

          if (!postsReadResponse.ok) {
            const errorText = await postsReadResponse.text();
            console.log('Posts read failed:', errorText);
            
            return new Response(
              JSON.stringify({
                success: false,
                step: 'permissions',
                error: `Gebruiker '${cleanUsername}' kan posts niet lezen/bewerken.\n\nFout: ${errorText}\n\nVereiste rollen: Editor, Administrator of Author.\nHuidige rollen: ${userData.roles?.join(', ') || 'geen'}\n\n💡 Los dit op door:\n1. Ga naar WordPress Admin → Gebruikers\n2. Bewerk gebruiker '${cleanUsername}'\n3. Verander rol naar 'Editor' of 'Administrator'\n4. Sla op en probeer opnieuw`
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Test creating a draft post to verify full permissions
          console.log('Testing draft post creation...');
          const testPostUrl = `${normalizedUrl}/wp-json/wp/v2/posts`;
          
          const testPostResponse = await fetch(testPostUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json',
              'User-Agent': 'AutoblogifyAI/1.0',
            },
            body: JSON.stringify({
              title: 'AutoblogifyAI Connection Test',
              content: 'Dit is een test post om de verbinding te controleren. Deze post wordt automatisch verwijderd.',
              status: 'draft'
            }),
            signal: AbortSignal.timeout(15000)
          });

          console.log('Test post creation:', {
            status: testPostResponse.status,
            ok: testPostResponse.ok
          });

          if (testPostResponse.ok) {
            const createdPost = await testPostResponse.json();
            console.log('✅ Test post created:', createdPost.id);
            
            // Clean up test post
            try {
              await fetch(`${normalizedUrl}/wp-json/wp/v2/posts/${createdPost.id}?force=true`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Basic ${credentials}`,
                  'User-Agent': 'AutoblogifyAI/1.0'
                }
              });
              console.log('✅ Test post cleaned up');
            } catch (cleanupError) {
              console.log('Test post cleanup failed (niet erg):', cleanupError);
            }

            // SUCCESS - All tests passed
            console.log('🎉 All WordPress connection tests passed!');
            return new Response(
              JSON.stringify({
                success: true,
                message: 'WordPress verbinding en rechten succesvol getest!',
                user: {
                  id: userData.id,
                  username: userData.username || userData.slug,
                  name: userData.name,
                  roles: userData.roles,
                  capabilities: userData.capabilities
                },
                permissions: {
                  canRead: true,
                  canCreate: true,
                  canPublish: true
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );

          } else {
            // Post creation failed
            const errorText = await testPostResponse.text();
            console.log('❌ Post creation failed:', errorText);
            
            let errorObj;
            try {
              errorObj = JSON.parse(errorText);
            } catch {
              errorObj = { message: errorText };
            }

            return new Response(
              JSON.stringify({
                success: false,
                step: 'post_creation',
                error: `Gebruiker '${cleanUsername}' kan geen posts aanmaken.\n\nWordPress fout: ${errorObj.message || errorObj.code || 'Onbekend'}\n\nHuidige rollen: ${userData.roles?.join(', ') || 'geen'}\n\n💡 Oplossing:\n1. Ga naar WordPress Admin → Gebruikers\n2. Bewerk gebruiker '${cleanUsername}'\n3. Verander rol naar 'Editor' of 'Administrator'\n4. Controleer of Application Passwords zijn ingeschakeld\n5. Probeer opnieuw\n\nAls het probleem blijft bestaan, controleer dan beveiligingsplugins.`
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

        } catch (postsError: any) {
          console.error('❌ Posts permission test failed:', postsError);
          return new Response(
            JSON.stringify({
              success: false,
              step: 'permissions',
              error: `Kan post-rechten niet controleren: ${postsError.message}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      } else {
        // Authentication failed - provide detailed error info
        const errorText = await authResponse.text();
        console.error('❌ Authentication failed:', {
          status: authResponse.status,
          statusText: authResponse.statusText,
          errorText
        });

        let errorMessage = `Authenticatie gefaald (${authResponse.status})\n\n`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += `Fout: ${errorData.message || errorData.code || 'Onbekend'}\n\n`;
        } catch {
          errorMessage += `Server response: ${errorText.substring(0, 200)}\n\n`;
        }

        errorMessage += `Mogelijke oplossingen:\n`;
        errorMessage += `• Controleer of gebruiker '${cleanUsername}' exact bestaat in WordPress\n`;
        errorMessage += `• Genereer een nieuwe Application Password in WordPress\n`;
        errorMessage += `• Controleer of Application Passwords zijn ingeschakeld\n`;
        errorMessage += `• Deactiveer tijdelijk beveiligingsplugins\n`;
        errorMessage += `• Controleer of de WordPress versie Application Passwords ondersteunt (5.6+)`;

        return new Response(
          JSON.stringify({
            success: false,
            step: 'authentication',
            error: errorMessage,
            debug: {
              url: authTestUrl,
              status: authResponse.status,
              statusText: authResponse.statusText
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } catch (authError: any) {
      console.error('❌ Authentication request failed:', authError);
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
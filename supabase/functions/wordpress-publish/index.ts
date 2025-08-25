import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, wordpressConfig } = await req.json();

    if (!postId || !wordpressConfig) {
      return new Response(
        JSON.stringify({ error: 'Post ID en WordPress configuratie zijn vereist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: 'Blogpost niet gevonden' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Publish to WordPress
    const result = await publishToWordPress(post, wordpressConfig);

    // Update post status if successful
    if (result.success) {
      await supabase
        .from('blog_posts')
        .update({ 
          status: 'published',
          canonical_url: result.url
        })
        .eq('id', postId);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in wordpress-publish function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function publishToWordPress(post: any, config: any) {
  try {
    const { siteUrl, username, appPassword } = config;
    
    // Normalize site URL
    const normalizedUrl = siteUrl.replace(/\/$/, '');
    
    // Basic auth credentials
    const credentials = btoa(`${username}:${appPassword}`);
    
    // First, test authentication and user permissions
    const userCheckUrl = `${normalizedUrl}/wp-json/wp/v2/users/me`;
    console.log('Checking user authentication and permissions:', userCheckUrl);
    
    try {
      const userResponse = await fetch(userCheckUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'AutoblogifyAI/1.0'
        }
      });
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('User authentication failed:', userResponse.status, errorText);
        
        if (userResponse.status === 401) {
          throw new Error('Authenticatie gefaald. Controleer je WordPress gebruikersnaam en applicatie wachtwoord. Zorg ervoor dat het applicatie wachtwoord correct is aangemaakt in WordPress → Users → Profile.');
        }
        throw new Error(`Gebruikersverificatie gefaald (${userResponse.status}). Controleer je WordPress inloggegevens.`);
      }
      
      const userData = await userResponse.json();
      console.log('User authenticated successfully:', {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        roles: userData.roles,
        capabilities: Object.keys(userData.capabilities || {}).filter(cap => userData.capabilities[cap])
      });
      
      // Check if user can publish posts
      const canPublish = userData.capabilities?.publish_posts || userData.roles?.includes('administrator') || userData.roles?.includes('editor');
      if (!canPublish) {
        throw new Error(`Gebruiker '${username}' heeft geen rechten om posts te publiceren. Vereiste rollen: Administrator of Editor. Huidige rollen: ${userData.roles?.join(', ') || 'geen'}`);
      }
      
      console.log('User has publish permissions');
      
    } catch (authError) {
      console.error('Authentication check failed:', authError);
      if (authError.message.includes('Authenticatie gefaald') || authError.message.includes('geen rechten')) {
        throw authError;
      }
      throw new Error(`Kan verbinding met WordPress niet verifiëren: ${authError.message}`);
    }
    
    // Check if WordPress REST API is available for posts
    const apiDiscoveryUrl = `${normalizedUrl}/wp-json/wp/v2/posts`;
    console.log('Checking WordPress posts endpoint:', apiDiscoveryUrl);
    
    try {
      const discoveryResponse = await fetch(apiDiscoveryUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'AutoblogifyAI/1.0'
        }
      });
      
      if (!discoveryResponse.ok && discoveryResponse.status !== 405) {
        console.error('WordPress posts endpoint not available:', discoveryResponse.status);
        throw new Error(`WordPress posts endpoint is niet beschikbaar. Status: ${discoveryResponse.status}. Controleer of permalinks zijn ingeschakeld en de REST API actief is.`);
      }
      
      console.log('WordPress posts endpoint is beschikbaar');
    } catch (discoveryError) {
      console.error('Failed to check posts endpoint:', discoveryError);
      throw new Error(`Kan posts endpoint niet bereiken: ${discoveryError.message}`);
    }
    
    // WordPress REST API endpoint for posts
    const apiUrl = `${normalizedUrl}/wp-json/wp/v2/posts`;
    
    // Convert markdown to HTML (basic conversion)
    const htmlContent = markdownToHtml(post.body_markdown || '');
    
    const wordpressPost = {
      title: post.title,
      content: htmlContent,
      status: post.status === 'published' ? 'publish' : 'draft',
      excerpt: post.summary || '',
      slug: post.slug,
      meta: {
        _yoast_wpseo_title: post.meta_title || post.title,
        _yoast_wpseo_metadesc: post.meta_description || '',
        _yoast_wpseo_canonical: post.canonical_url || ''
      }
    };

    console.log('Publishing to WordPress:', apiUrl);
    console.log('Post data:', JSON.stringify(wordpressPost, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AutoblogifyAI/1.0'
      },
      body: JSON.stringify(wordpressPost),
    });

    console.log('WordPress response status:', response.status);
    console.log('WordPress response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error:', response.status, errorText);
      
      // Try to parse as JSON for better error messages
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.code) {
          errorMessage = `${errorJson.code}: ${errorJson.message || 'Onbekende fout'}`;
        }
      } catch (e) {
        // Not JSON, use the raw text but truncate if too long
        if (errorText.length > 500) {
          errorMessage = errorText.substring(0, 500) + '...';
        }
      }
      
      // Provide specific error messages based on status code
      let userFriendlyError = '';
      switch (response.status) {
        case 401:
          userFriendlyError = 'Authenticatie gefaald. Controleer je WordPress gebruikersnaam en applicatie wachtwoord.';
          break;
        case 403:
          userFriendlyError = 'Geen rechten om posts te maken. Controleer of je WordPress gebruiker de juiste rechten heeft.';
          break;
        case 404:
          userFriendlyError = 'WordPress REST API niet gevonden. Controleer of permalinks zijn ingeschakeld in WordPress.';
          break;
        case 500:
          userFriendlyError = 'WordPress server fout. Controleer de WordPress site logs voor meer details.';
          break;
        default:
          userFriendlyError = `WordPress API fout (${response.status}): ${errorMessage}`;
      }
      
      throw new Error(userFriendlyError);
    }

    const result = await response.json();
    
    return {
      success: true,
      message: 'Post succesvol gepubliceerd naar WordPress',
      url: result.link,
      wordpressId: result.id
    };

  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Basic markdown to HTML conversion
  return markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Lists
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(\<li\>.*\<\/li\>)/gs, '<ul>$1</ul>')
    
    // Numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    
    // Wrap in paragraphs
    .replace(/^(?!<[hlu])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>');
}
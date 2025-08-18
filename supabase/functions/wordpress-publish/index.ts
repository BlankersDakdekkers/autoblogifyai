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
    
    // WordPress REST API endpoint
    const apiUrl = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
    
    // Basic auth credentials
    const credentials = btoa(`${username}:${appPassword}`);
    
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
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wordpressPost),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('WordPress API error:', response.status, error);
      throw new Error(`WordPress API fout: ${response.status} - ${error}`);
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
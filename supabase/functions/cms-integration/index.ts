import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CMS-INTEGRATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { method, url } = req;
    const urlObj = new URL(url);
    const queryAction = urlObj.searchParams.get('action');

    switch (method) {
      case 'GET':
        return await handleGetIntegrations(supabaseClient, user.id, queryAction);
      case 'POST':
        const body = await req.json();
        const effectiveAction = queryAction || body.action;
        return await handleCMSAction(supabaseClient, user.id, effectiveAction, body);
      case 'PUT':
        const updateBody = await req.json();
        return await handleUpdateIntegration(supabaseClient, user.id, updateBody);
      case 'DELETE':
        const deleteBody = await req.json();
        return await handleDeleteIntegration(supabaseClient, user.id, deleteBody);
      default:
        throw new Error(`Method ${method} not allowed`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cms-integration", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleGetIntegrations(supabaseClient: any, userId: string, action: string | null) {
  logStep("Fetching CMS integrations", { userId, action });

  if (action === 'publish-history') {
    const { data: history, error } = await supabaseClient
      .from('cms_publish_history')
      .select(`
        *,
        blog_posts(title, slug),
        cms_integrations(name, cms_type)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(`Failed to fetch publish history: ${error.message}`);

    return new Response(JSON.stringify({ history }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  const { data: integrations, error } = await supabaseClient
    .from('cms_integrations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch integrations: ${error.message}`);

  // Remove sensitive data before sending to client
  const sanitizedIntegrations = integrations.map(integration => ({
    ...integration,
    api_credentials: { configured: true }
  }));

  return new Response(JSON.stringify({ integrations: sanitizedIntegrations }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function handleCMSAction(supabaseClient: any, userId: string, action: string | null, body: any) {
  logStep("Processing CMS action", { action, body });

  switch (action) {
    case 'create':
      return await createIntegration(supabaseClient, userId, body);
    case 'test':
      return await testIntegration(supabaseClient, userId, body);
    case 'publish':
      return await publishToIntegration(supabaseClient, userId, body);
    case 'bulk-publish':
      return await bulkPublishToIntegrations(supabaseClient, userId, body);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function createIntegration(supabaseClient: any, userId: string, body: any) {
  const { name, cms_type, site_url, api_credentials } = body;
  
  logStep("Creating CMS integration", { name, cms_type, site_url });

  // Test connection before saving
  const testResult = await testCMSConnection(cms_type, site_url, api_credentials);
  if (!testResult.success) {
    throw new Error(`Connection test failed: ${testResult.error}`);
  }

  const { data, error } = await supabaseClient
    .from('cms_integrations')
    .insert({
      user_id: userId,
      name,
      cms_type,
      site_url,
      api_credentials,
      is_active: true
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create integration: ${error.message}`);

  return new Response(JSON.stringify({ 
    success: true, 
    integration: { ...data, api_credentials: { configured: true } },
    message: `${cms_type} integratie succesvol aangemaakt`
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function testIntegration(supabaseClient: any, userId: string, body: any) {
  const { cms_type, site_url, api_credentials, integration_id } = body;
  
  logStep("Testing CMS connection", { cms_type, site_url });

  let credentialsToUse = api_credentials;
  
  // If no credentials provided, try to fetch from existing integration
  if (!credentialsToUse && integration_id) {
    const { data: integration, error } = await supabaseClient
      .from('cms_integrations')
      .select('api_credentials')
      .eq('id', integration_id)
      .eq('user_id', userId)
      .single();
    
    if (!error && integration) {
      credentialsToUse = integration.api_credentials;
    }
  }
  
  // If still no credentials, try to find by cms_type and site_url
  if (!credentialsToUse) {
    const { data: integration, error } = await supabaseClient
      .from('cms_integrations')
      .select('api_credentials')
      .eq('cms_type', cms_type)
      .eq('site_url', site_url)
      .eq('user_id', userId)
      .single();
    
    if (!error && integration) {
      credentialsToUse = integration.api_credentials;
    }
  }
  
  if (!credentialsToUse) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Geen credentials gevonden voor deze integratie'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  const result = await testCMSConnection(cms_type, site_url, credentialsToUse);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function publishToIntegration(supabaseClient: any, userId: string, body: any) {
  const { blog_post_id, cms_integration_id } = body;
  
  logStep("Publishing to CMS", { blog_post_id, cms_integration_id });

  // Get blog post
  const { data: post, error: postError } = await supabaseClient
    .from('blog_posts')
    .select('*')
    .eq('id', blog_post_id)
    .eq('user_id', userId)
    .single();

  if (postError || !post) {
    throw new Error('Blog post not found');
  }

  // Get CMS integration
  const { data: integration, error: integrationError } = await supabaseClient
    .from('cms_integrations')
    .select('*')
    .eq('id', cms_integration_id)
    .eq('user_id', userId)
    .single();

  if (integrationError || !integration) {
    throw new Error('CMS integration not found');
  }

  // Create publish history entry
  const { data: historyEntry, error: historyError } = await supabaseClient
    .from('cms_publish_history')
    .upsert({
      user_id: userId,
      blog_post_id,
      cms_integration_id,
      status: 'pending'
    }, { 
      onConflict: 'blog_post_id,cms_integration_id' 
    })
    .select()
    .single();

  if (historyError) {
    logStep("Failed to create history entry", { error: historyError });
  }

  try {
    const result = await publishToCMS(post, integration);
    
    // Update history with success
    if (historyEntry) {
      await supabaseClient
        .from('cms_publish_history')
        .update({
          status: 'success',
          cms_post_id: result.cms_post_id,
          cms_post_url: result.cms_post_url,
          published_at: new Date().toISOString()
        })
        .eq('id', historyEntry.id);
    }

    // Update blog post status
    await supabaseClient
      .from('blog_posts')
      .update({ 
        status: 'published',
        canonical_url: result.cms_post_url
      })
      .eq('id', blog_post_id);

    return new Response(JSON.stringify({
      success: true,
      message: `Post succesvol gepubliceerd naar ${integration.cms_type}`,
      ...result
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // Update history with failure
    if (historyEntry) {
      await supabaseClient
        .from('cms_publish_history')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', historyEntry.id);
    }

    throw error;
  }
}

async function bulkPublishToIntegrations(supabaseClient: any, userId: string, body: any) {
  const { blog_post_ids, cms_integration_ids } = body;
  
  logStep("Bulk publishing", { blog_post_ids, cms_integration_ids });

  const results = [];

  for (const post_id of blog_post_ids) {
    for (const integration_id of cms_integration_ids) {
      try {
        const result = await publishToIntegration(supabaseClient, userId, {
          blog_post_id: post_id,
          cms_integration_id: integration_id
        });
        results.push({ post_id, integration_id, success: true });
      } catch (error) {
        results.push({ 
          post_id, 
          integration_id, 
          success: false, 
          error: error.message 
        });
      }
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function handleUpdateIntegration(supabaseClient: any, userId: string, body: any) {
  const { id, ...updateData } = body;
  
  logStep("Updating integration", { id, updateData });

  const { data, error } = await supabaseClient
    .from('cms_integrations')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update integration: ${error.message}`);

  return new Response(JSON.stringify({ 
    success: true, 
    integration: { ...data, api_credentials: { configured: true } },
    message: 'Integratie bijgewerkt'
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function handleDeleteIntegration(supabaseClient: any, userId: string, body: any) {
  const { id } = body;
  
  logStep("Deleting integration", { id });

  const { error } = await supabaseClient
    .from('cms_integrations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to delete integration: ${error.message}`);

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Integratie verwijderd'
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function testCMSConnection(cmsType: string, siteUrl: string, credentials: any): Promise<any> {
  logStep("Testing CMS connection", { cmsType, siteUrl });

  try {
    switch (cmsType) {
      case 'wordpress':
        return await testWordPressConnection(siteUrl, credentials);
      case 'drupal':
        return await testDrupalConnection(siteUrl, credentials);
      case 'joomla':
        return await testJoomlaConnection(siteUrl, credentials);
      case 'contentful':
        return await testContentfulConnection(credentials);
      case 'strapi':
        return await testStrapiConnection(siteUrl, credentials);
      case 'ghost':
        return await testGhostConnection(siteUrl, credentials);
      case 'webflow':
        return await testWebflowConnection(credentials);
      default:
        return { success: false, error: `Unsupported CMS type: ${cmsType}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testWordPressConnection(siteUrl: string, credentials: any) {
  const { username, app_password } = credentials;
  const apiUrl = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`;
  const auth = btoa(`${username}:${app_password}`);

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { success: false, error: `WordPress API error: ${response.status}` };
  }

  const user = await response.json();
  return { 
    success: true, 
    message: `Connected as ${user.name}`,
    user_info: { name: user.name, roles: user.roles }
  };
}

async function testDrupalConnection(siteUrl: string, credentials: any) {
  const { username, password } = credentials;
  const apiUrl = `${siteUrl.replace(/\/$/, '')}/jsonapi`;

  // Test basic connection
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    return { success: false, error: `Drupal API error: ${response.status}` };
  }

  return { success: true, message: 'Drupal API connection successful' };
}

async function testJoomlaConnection(siteUrl: string, credentials: any) {
  const { api_token } = credentials;
  const apiUrl = `${siteUrl.replace(/\/$/, '')}/api/index.php/v1/content/articles`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${api_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { success: false, error: `Joomla API error: ${response.status}` };
  }

  return { success: true, message: 'Joomla API connection successful' };
}

async function testContentfulConnection(credentials: any) {
  const { space_id, access_token } = credentials;
  const apiUrl = `https://api.contentful.com/spaces/${space_id}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { success: false, error: `Contentful API error: ${response.status}` };
  }

  const space = await response.json();
  return { 
    success: true, 
    message: `Connected to space: ${space.name}`,
    space_info: { name: space.name, locales: space.locales }
  };
}

async function testStrapiConnection(siteUrl: string, credentials: any) {
  const { api_token } = credentials;
  const apiUrl = `${siteUrl.replace(/\/$/, '')}/api/articles`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${api_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { success: false, error: `Strapi API error: ${response.status}` };
  }

  return { success: true, message: 'Strapi API connection successful' };
}

async function testGhostConnection(siteUrl: string, credentials: any) {
  const { admin_api_key } = credentials;
  const apiUrl = `${siteUrl.replace(/\/$/, '')}/ghost/api/v3/admin/site/`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Ghost ${admin_api_key}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { success: false, error: `Ghost API error: ${response.status}` };
  }

  return { success: true, message: 'Ghost API connection successful' };
}

async function testWebflowConnection(credentials: any) {
  const { api_token } = credentials;
  const apiUrl = 'https://api.webflow.com/sites';

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${api_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { success: false, error: `Webflow API error: ${response.status}` };
  }

  return { success: true, message: 'Webflow API connection successful' };
}

async function publishToCMS(post: any, integration: any): Promise<any> {
  logStep("Publishing to CMS", { cmsType: integration.cms_type, postId: post.id });

  switch (integration.cms_type) {
    case 'wordpress':
      return await publishToWordPress(post, integration);
    case 'drupal':
      return await publishToDrupal(post, integration);
    case 'joomla':
      return await publishToJoomla(post, integration);
    case 'contentful':
      return await publishToContentful(post, integration);
    case 'strapi':
      return await publishToStrapi(post, integration);
    case 'ghost':
      return await publishToGhost(post, integration);
    case 'webflow':
      return await publishToWebflow(post, integration);
    default:
      throw new Error(`Publishing to ${integration.cms_type} not yet implemented`);
  }
}

async function publishToWordPress(post: any, integration: any) {
  const { site_url, api_credentials } = integration;
  const { username, app_password } = api_credentials;
  
  const apiUrl = `${site_url.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
  const auth = btoa(`${username}:${app_password}`);
  
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

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wordpressPost),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WordPress API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  
  return {
    cms_post_id: result.id.toString(),
    cms_post_url: result.link,
    cms_edit_url: `${site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${result.id}&action=edit`
  };
}

async function publishToDrupal(post: any, integration: any) {
  // Drupal JSON:API implementation
  const { site_url, api_credentials } = integration;
  const { username, password } = api_credentials;
  
  // Basic implementation - would need more specific Drupal setup
  throw new Error('Drupal publishing implementation needed');
}

async function publishToJoomla(post: any, integration: any) {
  // Joomla API implementation
  throw new Error('Joomla publishing implementation needed');
}

async function publishToContentful(post: any, integration: any) {
  // Contentful Management API implementation
  throw new Error('Contentful publishing implementation needed');
}

async function publishToStrapi(post: any, integration: any) {
  const { site_url, api_credentials } = integration;
  const { api_token } = api_credentials;
  
  const apiUrl = `${site_url.replace(/\/$/, '')}/api/articles`;
  
  const strapiPost = {
    data: {
      title: post.title,
      content: post.body_markdown,
      slug: post.slug,
      description: post.summary,
      publishedAt: post.status === 'published' ? new Date().toISOString() : null
    }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${api_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(strapiPost),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strapi API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  
  return {
    cms_post_id: result.data.id.toString(),
    cms_post_url: `${site_url}/articles/${post.slug}`,
    cms_edit_url: `${site_url}/admin/content-manager/collectionType/api::article.article/${result.data.id}`
  };
}

async function publishToGhost(post: any, integration: any) {
  // Ghost Admin API implementation
  throw new Error('Ghost publishing implementation needed');
}

async function publishToWebflow(post: any, integration: any) {
  // Webflow CMS API implementation
  throw new Error('Webflow publishing implementation needed');
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(\<li\>.*\<\/li\>)/gs, '<ul>$1</ul>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(?!<[hlu])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>');
}
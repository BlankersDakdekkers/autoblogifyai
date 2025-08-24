import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Resource {
  id?: string;
  title: string;
  description: string;
  type: 'tutorial' | 'template' | 'guide' | 'video' | 'tool';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  rating?: number;
  download_url?: string;
  external_url?: string;
  featured?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract JWT from Bearer token
    const jwt = authHeader.replace('Bearer ', '');
    
    // Verify JWT token using service role client
    const { data: { user }, error: jwtError } = await supabase.auth.getUser(jwt);
    
    if (jwtError || !user) {
      console.error('JWT verification failed:', jwtError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user has admin role using service role client
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !userRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url)
    const method = req.method

    // GET - List all resources
    if (method === 'GET') {
      const { data: resources, error } = await supabase
        .from('resources')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resources:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch resources' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ resources }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // POST - Create new resource
    if (method === 'POST') {
      const body = await req.json() as Resource

      const { data: resource, error } = await supabase
        .from('resources')
        .insert([{
          title: body.title,
          description: body.description,
          type: body.type,
          category: body.category,
          difficulty: body.difficulty,
          duration: body.duration || null,
          rating: body.rating || 0,
          download_url: body.download_url || null,
          external_url: body.external_url || null,
          featured: body.featured || false
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating resource:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create resource' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ resource }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // PUT - Update existing resource
    if (method === 'PUT') {
      const body = await req.json() as Resource & { id: string }
      if (!body.id) {
        return new Response(
          JSON.stringify({ error: 'Resource ID required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { data: resource, error } = await supabase
        .from('resources')
        .update({
          title: body.title,
          description: body.description,
          type: body.type,
          category: body.category,
          difficulty: body.difficulty,
          duration: body.duration || null,
          rating: body.rating || 0,
          download_url: body.download_url || null,
          external_url: body.external_url || null,
          featured: body.featured || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating resource:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update resource' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ resource }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // DELETE - Remove resource
    if (method === 'DELETE') {
      const body = await req.json() as { id: string }
      if (!body.id) {
        return new Response(
          JSON.stringify({ error: 'Resource ID required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', body.id)

      if (error) {
        console.error('Error deleting resource:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to delete resource' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Resource deleted successfully' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
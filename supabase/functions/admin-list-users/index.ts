import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Admin list users function called');
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create admin client with service role key first
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    console.log('Environment variables loaded');
    
    // Extract JWT from Bearer token
    const jwt = authHeader.replace('Bearer ', '');
    console.log('JWT extracted, length:', jwt.length);
    
    // Use service role to verify the JWT and get user info
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      // Verify JWT token using service role client
      const { data: { user }, error: jwtError } = await adminSupabase.auth.getUser(jwt);
      
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
      
      console.log('User verified:', user.id);
      
      // Check if user has admin role using service role client
      const { data: roleData, error: roleError } = await adminSupabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        console.error('User is not admin:', roleError);
        return new Response(
          JSON.stringify({ error: 'Not authorized - admin role required' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log('Admin role verified');
      
    } catch (error) {
      console.error('Error during authentication:', error);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // List all users
    const { data: authUsers, error: listError } = await adminSupabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to list users' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user roles from our custom table
    const userIds = authUsers.users.map(u => u.id);
    const { data: userRoles } = await adminSupabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    // Create a role mapping
    const roleMap = new Map();
    userRoles?.forEach(ur => {
      roleMap.set(ur.user_id, ur.role);
    });

    // Transform the data
    const transformedUsers = authUsers.users.map(user => ({
      id: user.id,
      email: user.email || 'Geen email',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      role: roleMap.get(user.id) || 'user'
    }));

    return new Response(
      JSON.stringify({ users: transformedUsers }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in admin-list-users function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
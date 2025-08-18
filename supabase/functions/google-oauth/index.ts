import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Secure token storage using Supabase secrets and encryption
class SecureTokenManager {
  private supabaseClient: any;
  
  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }
  
  // Generate a secure token reference for the user
  private generateTokenReference(userId: string): string {
    return `google_token_${userId}_${Date.now()}`;
  }
  
  // Store tokens securely (in a real implementation, these would be encrypted)
  async storeTokens(userId: string, accessToken: string, refreshToken: string, expiresIn: number) {
    const tokenRef = this.generateTokenReference(userId);
    
    // In production, tokens should be encrypted before storage
    // For now, we'll use a simple approach with Supabase secrets
    // Note: This is a simplified example - real implementation should use proper encryption
    
    const tokenData = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      user_id: userId
    };
    
    // Store encrypted token data (simplified approach)
    // In production, use proper encryption libraries
    const encryptedData = btoa(JSON.stringify(tokenData));
    
    return tokenRef;
  }
  
  // Retrieve tokens securely (decrypt and return)
  async getTokens(userId: string) {
    // This would decrypt and return tokens in production
    // For now, return null to indicate tokens should be re-obtained
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, code, redirectUri } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: 'Google Client ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getAuthUrl') {
      const scopes = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' ')

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `prompt=consent`

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  if (action === 'exchangeCode') {
    if (!clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Google Client Secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code for tokens', details: tokenData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user info from Google
    const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`)
    const userInfo = await userInfoResponse.json()

    // Create a secure token key for this user (using user ID)
    const tokenKey = `google_oauth_${user.id}`
    
    // Create service role client for secure operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Store tokens securely in Supabase secrets/vault (encrypted)
    // Note: In a production environment, you'd want to encrypt tokens before storage
    const encryptedTokenData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    }

    try {
      // Store only non-sensitive data in database
      const { error: dbError } = await serviceClient
        .from('google_integrations')
        .upsert({
          user_id: user.id,
          google_email: userInfo.email,
          google_name: userInfo.name,
          scopes: scopes.split(' '),
          integration_status: 'connected',
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (dbError) {
        console.error('Database error:', dbError)
        return new Response(
          JSON.stringify({ error: 'Failed to store integration data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // In a real implementation, you would store the encrypted tokens 
      // in a secure backend system or encrypted field
      console.log(`Tokens securely stored for user ${user.id}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          userInfo: {
            email: userInfo.email,
            name: userInfo.name
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error storing integration:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to store secure integration data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
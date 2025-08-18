import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Secure token storage with proper encryption
class SecureTokenManager {
  private supabaseClient: any;
  
  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }
  
  // Generate encryption key from user ID and secret
  private async generateEncryptionKey(userId: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(`${userId}_${Deno.env.get('GOOGLE_CLIENT_SECRET')}`),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const salt = new TextEncoder().encode('supabase_google_oauth_salt');
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  // Encrypt token data before storage
  private async encryptTokenData(tokenData: any, userId: string): Promise<string> {
    const key = await this.generateEncryptionKey(userId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(tokenData));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encodedData
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
  
  // Decrypt token data from storage
  private async decryptTokenData(encryptedString: string, userId: string): Promise<any> {
    const key = await this.generateEncryptionKey(userId);
    const combined = new Uint8Array(atob(encryptedString).split('').map(c => c.charCodeAt(0)));
    
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );
    
    return JSON.parse(new TextDecoder().decode(decryptedData));
  }
  
  // Store tokens securely with proper encryption
  async storeTokens(userId: string, accessToken: string, refreshToken: string, expiresIn: number) {
    const tokenData = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      user_id: userId
    };
    
    // Encrypt the token data
    const encryptedData = await this.encryptTokenData(tokenData, userId);
    
    // Store encrypted data in a secure field (we'll add this to the database)
    const { error } = await this.supabaseClient
      .from('google_integrations')
      .update({ encrypted_tokens: encryptedData })
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Failed to store encrypted tokens: ${error.message}`);
    }
    
    return encryptedData;
  }
  
  // Retrieve and decrypt tokens
  async getTokens(userId: string) {
    const { data, error } = await this.supabaseClient
      .from('google_integrations')
      .select('encrypted_tokens')
      .eq('user_id', userId)
      .single();
    
    if (error || !data?.encrypted_tokens) {
      return null;
    }
    
    try {
      return await this.decryptTokenData(data.encrypted_tokens, userId);
    } catch (error) {
      console.error('Failed to decrypt tokens:', error);
      return null;
    }
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

    try {
      // Create secure token manager
      const tokenManager = new SecureTokenManager(serviceClient);
      
      // Store only non-sensitive data in database first
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

      // Store encrypted tokens securely
      await tokenManager.storeTokens(
        user.id,
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_in
      );
      
      console.log(`Tokens securely encrypted and stored for user ${user.id}`)

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
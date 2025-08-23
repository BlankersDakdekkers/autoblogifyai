import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[CUSTOM-PERSONA-MANAGER] ${step}`, details ? JSON.stringify(details) : '');
};

interface AIPersona {
  id: string;
  name: string;
  description: string;
  tone: string;
  expertise: string[];
  examples: string[];
  systemPrompt: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Parse request
    const { action, persona, content, personaId } = await req.json();
    logStep("Request parsed", { action, personaId });

    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    logStep("User authenticated", { userId: user.id });

    // Check Enterprise subscription
    const { data: subscription } = await supabaseClient
      .from('subscribers')
      .select('subscription_tier, subscribed')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.subscribed || subscription.subscription_tier !== 'Enterprise') {
      throw new Error('Enterprise subscription required for custom AI personas');
    }

    logStep("Enterprise subscription verified");

    // Use service role for database operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result;

    switch (action) {
      case 'create':
        result = await createPersona(supabaseService, user.id, persona);
        break;
      
      case 'update':
        result = await updatePersona(supabaseService, user.id, personaId, persona);
        break;
      
      case 'delete':
        result = await deletePersona(supabaseService, user.id, personaId);
        break;
      
      case 'list':
        result = await listPersonas(supabaseService, user.id);
        break;
      
      case 'generate':
        result = await generateWithPersona(supabaseService, user.id, personaId, content);
        break;
      
      case 'train':
        result = await trainPersona(supabaseService, user.id, personaId, persona);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    logStep("Action completed", { action, success: true });

    return new Response(JSON.stringify({
      success: true,
      action,
      data: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep("Error in custom persona manager", error);
    console.error('Error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createPersona(supabase: any, userId: string, persona: any) {
  logStep("Creating new persona", { name: persona.name });

  // Generate system prompt based on persona characteristics
  const systemPrompt = generateSystemPrompt(persona);

  // Create persona table if it doesn't exist (we'll assume it exists)
  const { data, error } = await supabase
    .from('ai_personas')
    .insert({
      user_id: userId,
      name: persona.name,
      description: persona.description,
      tone: persona.tone,
      expertise: persona.expertise || [],
      examples: persona.examples || [],
      system_prompt: systemPrompt
    })
    .select()
    .single();

  if (error) {
    // If table doesn't exist, create it
    if (error.code === '42P01') {
      await createPersonaTable(supabase);
      // Retry the insert
      const { data: retryData, error: retryError } = await supabase
        .from('ai_personas')
        .insert({
          user_id: userId,
          name: persona.name,
          description: persona.description,
          tone: persona.tone,
          expertise: persona.expertise || [],
          examples: persona.examples || [],
          system_prompt: systemPrompt
        })
        .select()
        .single();
      
      if (retryError) throw retryError;
      return retryData;
    }
    throw error;
  }

  return data;
}

async function updatePersona(supabase: any, userId: string, personaId: string, persona: any) {
  logStep("Updating persona", { personaId });

  const systemPrompt = generateSystemPrompt(persona);

  const { data, error } = await supabase
    .from('ai_personas')
    .update({
      name: persona.name,
      description: persona.description,
      tone: persona.tone,
      expertise: persona.expertise || [],
      examples: persona.examples || [],
      system_prompt: systemPrompt,
      updated_at: new Date().toISOString()
    })
    .eq('id', personaId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deletePersona(supabase: any, userId: string, personaId: string) {
  logStep("Deleting persona", { personaId });

  const { error } = await supabase
    .from('ai_personas')
    .delete()
    .eq('id', personaId)
    .eq('user_id', userId);

  if (error) throw error;
  return { deleted: true, personaId };
}

async function listPersonas(supabase: any, userId: string) {
  logStep("Listing personas for user", { userId });

  const { data, error } = await supabase
    .from('ai_personas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error && error.code !== '42P01') throw error;
  return data || [];
}

async function generateWithPersona(supabase: any, userId: string, personaId: string, content: any) {
  logStep("Generating content with persona", { personaId });

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error("OpenAI API key not configured");
  }

  // Get persona
  const { data: persona, error } = await supabase
    .from('ai_personas')
    .select('*')
    .eq('id', personaId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  if (!persona) throw new Error('Persona not found');

  // Generate content using persona's system prompt
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: persona.system_prompt },
        { role: 'user', content: content.prompt || content }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;

  // Deduct credit
  await supabase.rpc('deduct_credit', { user_uuid: userId });

  return {
    persona: persona.name,
    generatedContent,
    usage: {
      model: 'gpt-4o',
      creditsUsed: 1
    }
  };
}

async function trainPersona(supabase: any, userId: string, personaId: string, trainingData: any) {
  logStep("Training persona with new examples", { personaId });

  // Get current persona
  const { data: persona, error } = await supabase
    .from('ai_personas')
    .select('*')
    .eq('id', personaId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  if (!persona) throw new Error('Persona not found');

  // Add new examples and regenerate system prompt
  const updatedExamples = [...(persona.examples || []), ...(trainingData.examples || [])];
  const updatedSystemPrompt = generateSystemPrompt({
    ...persona,
    examples: updatedExamples
  });

  const { data: updatedPersona, error: updateError } = await supabase
    .from('ai_personas')
    .update({
      examples: updatedExamples,
      system_prompt: updatedSystemPrompt,
      updated_at: new Date().toISOString()
    })
    .eq('id', personaId)
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) throw updateError;

  return updatedPersona;
}

function generateSystemPrompt(persona: any): string {
  const { name, description, tone, expertise, examples } = persona;

  let prompt = `You are ${name}, ${description}\n\n`;
  
  prompt += `TONE & STYLE: ${tone}\n\n`;
  
  if (expertise && expertise.length > 0) {
    prompt += `EXPERTISE: ${expertise.join(', ')}\n\n`;
  }
  
  prompt += `WRITING GUIDELINES:
- Always maintain the specified tone and style
- Use your expertise to provide valuable insights
- Write in a natural, engaging manner
- Adapt your language to the target audience
- Ensure accuracy and credibility in your content\n\n`;

  if (examples && examples.length > 0) {
    prompt += `EXAMPLE CONTENT STYLE:\n`;
    examples.forEach((example: string, index: number) => {
      prompt += `Example ${index + 1}: ${example}\n`;
    });
    prompt += '\n';
  }

  prompt += `Generate content that matches this persona's voice and expertise level. Always stay in character and provide value to the reader.`;

  return prompt;
}

async function createPersonaTable(supabase: any) {
  logStep("Creating ai_personas table");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS public.ai_personas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      tone TEXT,
      expertise TEXT[] DEFAULT '{}',
      examples TEXT[] DEFAULT '{}',
      system_prompt TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.ai_personas ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own personas" ON public.ai_personas
    FOR SELECT USING (user_id = auth.uid());

    CREATE POLICY "Users can create their own personas" ON public.ai_personas
    FOR INSERT WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update their own personas" ON public.ai_personas
    FOR UPDATE USING (user_id = auth.uid());

    CREATE POLICY "Users can delete their own personas" ON public.ai_personas
    FOR DELETE USING (user_id = auth.uid());

    CREATE POLICY "Service role full access personas" ON public.ai_personas
    FOR ALL USING (true) WITH CHECK (true);
  `;

  // Execute the table creation (this is a simplified version)
  // In reality, this should be done via migration
  logStep("AI Personas table creation attempted");
}
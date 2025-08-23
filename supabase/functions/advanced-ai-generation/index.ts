import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[ADVANCED-AI-GENERATION] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get API keys
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!openAIApiKey && !anthropicApiKey) {
      throw new Error("No AI API keys configured");
    }

    // Parse request
    const { model, languages, persona, topic, contentType, customInstructions } = await req.json();
    logStep("Request parsed", { model, languages, topic, contentType });

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

    // Check if user has Enterprise subscription
    const { data: subscription } = await supabaseClient
      .from('subscribers')
      .select('subscription_tier, subscribed')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.subscribed || subscription.subscription_tier !== 'Enterprise') {
      throw new Error('Enterprise subscription required for advanced AI features');
    }

    logStep("Enterprise subscription verified");

    // Prepare AI prompt
    const systemPrompt = `You are an advanced AI content generator. Generate high-quality, SEO-optimized content based on the following specifications:

Topic: ${topic}
Content Type: ${contentType}
Target Languages: ${languages?.join(', ') || 'Dutch'}
Persona: ${persona || 'Professional'}
Custom Instructions: ${customInstructions || 'None'}

Generate comprehensive, engaging content that matches the specified persona and style. Include relevant keywords naturally and structure the content for optimal readability.`;

    let generatedContent;

    // Generate content based on selected model
    if (model === 'claude-opus' && anthropicApiKey) {
      logStep("Using Claude Opus");
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: systemPrompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      generatedContent = data.content[0].text;

    } else if (openAIApiKey) {
      logStep(`Using OpenAI model: ${model}`);
      
      const modelMap: { [key: string]: string } = {
        'gpt-4o': 'gpt-4o',
        'gpt-4-turbo': 'gpt-4-turbo-preview',
        'gpt-3.5-turbo': 'gpt-3.5-turbo'
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelMap[model] || 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an expert content generator specializing in SEO-optimized, engaging content.' },
            { role: 'user', content: systemPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      generatedContent = data.choices[0].message.content;
    } else {
      throw new Error('No compatible API key found for selected model');
    }

    logStep("Content generated successfully");

    // Process content for multiple languages if requested
    const results: any = {
      primary: {
        language: languages?.[0] || 'nl',
        content: generatedContent
      },
      translations: []
    };

    // If multiple languages requested, generate translations
    if (languages && languages.length > 1 && openAIApiKey) {
      for (const lang of languages.slice(1)) {
        try {
          const translationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: `You are a professional translator. Translate the following content to ${lang} while maintaining the tone, style, and SEO optimization.` },
                { role: 'user', content: generatedContent }
              ],
              max_tokens: 2000,
              temperature: 0.3,
            }),
          });

          if (translationResponse.ok) {
            const translationData = await translationResponse.json();
            results.translations.push({
              language: lang,
              content: translationData.choices[0].message.content
            });
          }
        } catch (translationError) {
          logStep(`Translation error for ${lang}`, translationError);
        }
      }
    }

    // Deduct credits for Enterprise usage
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseService.rpc('deduct_credit', { user_uuid: user.id });

    logStep("Content generation completed", { 
      primaryLanguage: results.primary.language,
      translationsCount: results.translations.length 
    });

    return new Response(JSON.stringify({
      success: true,
      model: model,
      content: results,
      usage: {
        model: model,
        languages: languages?.length || 1,
        creditsUsed: 1
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep("Error in advanced AI generation", error);
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
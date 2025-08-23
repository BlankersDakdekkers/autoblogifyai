import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[MULTILINGUAL-TRANSLATOR] ${step}`, details ? JSON.stringify(details) : '');
};

// Language mappings for better translation context
const languageNames: { [key: string]: string } = {
  'nl': 'Dutch',
  'en': 'English',
  'de': 'German',
  'fr': 'French',
  'es': 'Spanish',
  'it': 'Italian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Parse request
    const { 
      sourceContent, 
      sourceLanguage = 'nl', 
      targetLanguages = [], 
      contentType = 'blog',
      maintainSEO = true,
      customInstructions = ''
    } = await req.json();

    logStep("Request parsed", { 
      sourceLanguage, 
      targetLanguages, 
      contentType,
      contentLength: sourceContent?.length 
    });

    if (!sourceContent || !targetLanguages?.length) {
      throw new Error("Source content and target languages are required");
    }

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
      throw new Error('Enterprise subscription required for multilingual translation');
    }

    logStep("Enterprise subscription verified");

    const translations: any[] = [];
    const errors: any[] = [];

    // Process each target language
    for (const targetLang of targetLanguages) {
      try {
        logStep(`Translating to ${targetLang}`, { from: sourceLanguage, to: targetLang });

        const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
        const targetLangName = languageNames[targetLang] || targetLang;

        // Create specialized translation prompt
        let translationPrompt = `Translate the following ${contentType} content from ${sourceLangName} to ${targetLangName}.

IMPORTANT REQUIREMENTS:
- Maintain the original tone and style
- Preserve all formatting (headers, bullet points, etc.)
- Keep brand names and technical terms unchanged where appropriate
${maintainSEO ? '- Maintain SEO optimization and keyword density' : ''}
- Ensure cultural appropriateness for ${targetLangName} speakers
- Use natural, native-level ${targetLangName}

${customInstructions ? `CUSTOM INSTRUCTIONS: ${customInstructions}` : ''}

CONTENT TO TRANSLATE:
${sourceContent}

Provide only the translation without any additional commentary or explanation.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { 
                role: 'system', 
                content: `You are a professional translator specialized in ${contentType} content. You provide accurate, culturally appropriate translations that maintain the original meaning, tone, and formatting.` 
              },
              { role: 'user', content: translationPrompt }
            ],
            max_tokens: Math.min(4000, sourceContent.length * 2),
            temperature: 0.2, // Low temperature for consistency
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error for ${targetLang}: ${response.statusText}`);
        }

        const data = await response.json();
        const translatedContent = data.choices[0].message.content.trim();

        translations.push({
          language: targetLang,
          languageName: targetLangName,
          content: translatedContent,
          wordCount: translatedContent.split(/\s+/).length,
          success: true
        });

        logStep(`Translation completed for ${targetLang}`, { 
          wordCount: translatedContent.split(/\s+/).length 
        });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        logStep(`Translation error for ${targetLang}`, error);
        errors.push({
          language: targetLang,
          error: error.message
        });
        
        translations.push({
          language: targetLang,
          languageName: languageNames[targetLang] || targetLang,
          content: null,
          error: error.message,
          success: false
        });
      }
    }

    // Deduct credits based on number of translations
    const creditsUsed = Math.max(1, Math.ceil(targetLanguages.length / 2));
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (let i = 0; i < creditsUsed; i++) {
      await supabaseService.rpc('deduct_credit', { user_uuid: user.id });
    }

    const successfulTranslations = translations.filter(t => t.success);
    
    logStep("Translation batch completed", { 
      totalRequested: targetLanguages.length,
      successful: successfulTranslations.length,
      failed: errors.length,
      creditsUsed
    });

    return new Response(JSON.stringify({
      success: true,
      sourceLanguage,
      sourceContent,
      translations,
      summary: {
        totalRequested: targetLanguages.length,
        successful: successfulTranslations.length,
        failed: errors.length,
        languages: successfulTranslations.map(t => t.language)
      },
      usage: {
        creditsUsed,
        timestamp: new Date().toISOString()
      },
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep("Error in multilingual translation", error);
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
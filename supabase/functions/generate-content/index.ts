import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      title, 
      targetKeyword, 
      city, 
      contentType = 'blog', 
      wordCount = 800,
      language = 'nl',
      includeLocalSEO = false,
      includeImages = false,
      includeSchema = false
    } = await req.json();

    // Use anon key for auth, service role key for database writes
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key niet geconfigureerd' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine content prompt based on type and language
    const getContentPrompt = () => {
      const basePrompts = {
        nl: {
          blog: `Schrijf een professionele, SEO-geoptimaliseerde blogpost van ongeveer ${wordCount} woorden over "${title}". 
Focus op het keyword "${targetKeyword}"${city ? ` voor de locatie ${city}` : ''}. 
Structuur: inleiding, 3-4 hoofdsecties met H2 headings, conclusie.
Gebruik een conversational tone, voeg praktische tips toe en zorg voor goede leesbaarheid.
${includeLocalSEO ? 'Voeg lokale SEO elementen toe zoals lokale keywords en referenties.' : ''}`,
          
          landing: `Creëer een conversie-geoptimaliseerde landing page voor "${title}" gericht op "${targetKeyword}".
Structuur: krachtige headline, probleem identificatie, oplossing presentatie, voordelen, social proof, urgentie, duidelijke CTA.
Focus op conversie en overtuigingskracht.`,
          
          review: `Schrijf een uitgebreide product/service review voor "${title}" met focus op "${targetKeyword}".
Inclusief: specificaties, voor- en nadelen, prijsvergelijking, persoonlijke ervaring, aanbeveling.
Balanceer eerlijkheid met positieve tone.`
        },
        en: {
          blog: `Write a professional, SEO-optimized blog post of approximately ${wordCount} words about "${title}".
Focus on the keyword "${targetKeyword}"${city ? ` for the location ${city}` : ''}. 
Structure: introduction, 3-4 main sections with H2 headings, conclusion.
Use a conversational tone, add practical tips and ensure good readability.
${includeLocalSEO ? 'Add local SEO elements like local keywords and references.' : ''}`,
          
          landing: `Create a conversion-optimized landing page for "${title}" targeting "${targetKeyword}".
Structure: powerful headline, problem identification, solution presentation, benefits, social proof, urgency, clear CTA.
Focus on conversion and persuasion.`,
          
          review: `Write a comprehensive product/service review for "${title}" focusing on "${targetKeyword}".
Include: specifications, pros and cons, price comparison, personal experience, recommendation.
Balance honesty with positive tone.`
        }
      };

      return basePrompts[language]?.[contentType] || basePrompts.nl.blog;
    };

    // Generate main content
    const contentPrompt = getContentPrompt();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: `Je bent een expert SEO content schrijver. Schrijf altijd in perfect ${language === 'nl' ? 'Nederlands' : 'Engels'} met correcte grammatica en spelling. Gebruik markdown formatting voor headings en structuur.` 
          },
          { role: 'user', content: contentPrompt }
        ],
        max_completion_tokens: Math.min(4000, Math.floor(wordCount * 6)),
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Fout bij content generatie' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Generate meta description
    const metaPrompt = language === 'nl' 
      ? `Schrijf een SEO-geoptimaliseerde meta description van maximaal 155 karakters voor: "${title}". Focus op keyword "${targetKeyword}" en maak het aantrekkelijk voor klikken.`
      : `Write an SEO-optimized meta description of maximum 155 characters for: "${title}". Focus on keyword "${targetKeyword}" and make it compelling for clicks.`;

    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'user', content: metaPrompt }
        ],
        max_completion_tokens: 100,
      }),
    });

    const metaData = await metaResponse.json();
    const metaDescription = metaData.choices[0].message.content.replace(/"/g, '');

    // Generate FAQ if requested
    let faqJson = null;
    if (includeSchema) {
      const faqPrompt = language === 'nl'
        ? `Genereer 5 veelgestelde vragen en antwoorden over "${title}" en "${targetKeyword}". Geef terug als JSON array met "q" en "a" velden.`
        : `Generate 5 frequently asked questions and answers about "${title}" and "${targetKeyword}". Return as JSON array with "q" and "a" fields.`;

      const faqResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-mini-2025-08-07',
          messages: [
            { role: 'user', content: faqPrompt }
          ],
          max_completion_tokens: 800,
        }),
      });

      const faqData = await faqResponse.json();
      try {
        faqJson = JSON.parse(faqData.choices[0].message.content);
      } catch (e) {
        console.error('FAQ JSON parse error:', e);
      }
    }

    // Generate CTA
    const ctaPrompt = language === 'nl'
      ? `Schrijf een overtuigende call-to-action heading en subtext voor "${title}" service. Heading max 8 woorden, subtext max 15 woorden.`
      : `Write a compelling call-to-action heading and subtext for "${title}" service. Heading max 8 words, subtext max 15 words.`;

    const ctaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'user', content: ctaPrompt }
        ],
        max_completion_tokens: 150,
      }),
    });

    const ctaData = await ctaResponse.json();
    const ctaText = ctaData.choices[0].message.content;
    const ctaLines = ctaText.split('\n').filter(line => line.trim());
    const ctaHeading = ctaLines[0]?.replace(/^Heading:\s*/i, '').replace(/"/g, '') || (language === 'nl' ? 'Neem Contact Op' : 'Get In Touch');
    const ctaSubtext = ctaLines[1]?.replace(/^Subtext:\s*/i, '').replace(/"/g, '') || (language === 'nl' ? 'Start vandaag nog' : 'Start today');

    // Save to database using service role client to bypass RLS
    const { data: blogPost, error: dbError } = await supabaseServiceClient
      .from('blog_posts')
      .insert({
        user_id: user.id,
        title: title,
        slug: title.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-'),
        status: 'draft',
        publish_date: new Date().toISOString().split('T')[0],
        summary: metaDescription,
        tags: [targetKeyword, city].filter(Boolean),
        author: 'AutoblogifyAI',
        meta_title: title,
        meta_description: metaDescription,
        body_markdown: generatedContent,
        faq_json: faqJson,
        cta_heading: ctaHeading,
        cta_subtext: ctaSubtext,
        city: city,
        word_count: generatedContent.split(' ').length
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Fout bij opslaan content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        post: blogPost,
        content: generatedContent,
        metaDescription,
        faq: faqJson,
        cta: { heading: ctaHeading, subtext: ctaSubtext }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in content generation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
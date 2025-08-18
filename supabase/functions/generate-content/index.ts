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

    // Enhanced system prompt for comprehensive, SEO-optimized long-form content
    const systemPrompt = `Je bent een SEO-expert content writer die uitgebreide, professionele artikelen schrijft van 3000-5000 woorden.

BELANGRIJKE EISEN:
- Schrijf ALTIJD artikelen van minimaal 3000-5000 woorden
- Gebruik moderne SEO-technieken (2024/2025)
- Gebruik perfecte Nederlandse markdown opmaak
- Maak de tekst zeer uitgebreid en informatief
- Gebruik headers (H2, H3), lijsten, tabellen waar relevant
- Voeg praktische tips en voorbeelden toe
- Optimaliseer voor zoekintentie en gebruikerservaring

MARKDOWN OPMAAK VEREISTEN:
- Gebruik ## voor hoofdstukken (H2)
- Gebruik ### voor subsecties (H3) 
- Gebruik **vetgedrukte tekst** voor belangrijke punten
- Gebruik bullet points (- ) en genummerde lijsten (1. )
- Voeg tabellen toe met | syntax waar relevant
- Gebruik > voor belangrijke quotes/tips
- Voeg code blocks toe met \`\`\` waar relevant

MODERNE SEO TECHNIEKEN:
- Focus op zoekintentie en gebruikerservaring
- Gebruik LSI keywords en semantische varianten
- Optimaliseer voor featured snippets
- Voeg FAQ secties toe
- Gebruik interne linking concepten
- Optimaliseer voor Core Web Vitals
- Focus op E-A-T (Expertise, Authority, Trust)

STRUCTUUR TEMPLATE:
1. Inleiding (300-500 woorden)
2. 6-8 hoofdstukken (400-600 woorden elk)
3. Praktische tips sectie
4. FAQ sectie
5. Conclusie (200-300 woorden)

Taal: ${language}`;

    // Enhanced user prompt for comprehensive content
    const userPrompt = `Schrijf een uitgebreid, professioneel artikel van 3000-5000 woorden over: "${title}"

ONDERWERP FOCUS: ${title}
DOELGROEP: ${city} - lokaal bedrijf/organisatie
TREFWOORDEN: Gebruik "${targetKeyword}" en varianten natuurlijk door de tekst

ARTIKEL INHOUD VEREISTEN:
- Minimaal 3000-5000 woorden
- Uitgebreide inleiding die de waarde duidelijk maakt
- 6-8 hoofdstukken met diepgaande informatie
- Praktische tips en stap-voor-stap instructies
- Echte voorbeelden en case studies
- Actuele trends en ontwikkelingen (2024/2025)
- Lokale relevantie voor ${city} waar mogelijk
- Actionable insights die direct bruikbaar zijn

STRUCTUUR:
## Inleiding
Leg uit waarom dit onderwerp belangrijk is, wat de lezer kan verwachten

## [6-8 Hoofdstukken]
Elk hoofdstuk 400-600 woorden met diepgaande informatie

## Praktische Tips
Concrete, uitvoerbare adviezen

## Veelgestelde Vragen (FAQ)
5-8 relevante vragen met uitgebreide antwoorden

## Conclusie
Samenvatting en volgende stappen

Gebruik perfecte markdown opmaak met headers, lijsten, **vetgedrukte tekst**, tabellen en quotes.`;
    // Generate main content with enhanced parameters
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 16000, // Increased for longer content
        temperature: 0.7,
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
    console.log('Generated content length:', generatedContent?.length || 0);

    // Generate hero image
    let heroImageUrl = null;
    let heroImageAlt = null;
    
    try {
      const imagePrompt = `Professional, high-quality image for article about "${title}". Modern, clean design suitable for business website. ${language === 'nl' ? 'Dutch business context' : ''}.`;
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: imagePrompt,
          size: '1536x1024',
          quality: 'high',
          output_format: 'webp',
          output_compression: 80
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        heroImageUrl = imageData.data[0].url;
        heroImageAlt = `Afbeelding voor artikel: ${title}`;
        console.log('Hero image generated successfully');
      } else {
        console.log('Image generation failed, continuing without image');
      }
    } catch (imageError) {
      console.log('Image generation error:', imageError);
    }

    // Generate enhanced meta description (SEO optimized)
    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: `Je bent een SEO-expert. Schrijf perfecte meta descriptions die:
- Maximaal 155 karakters zijn
- De hoofdkeyword bevatten
- Een duidelijke waardepropositie hebben
- Een call-to-action bevatten
- Zoekintentie matchen
Taal: ${language}` 
          },
          { 
            role: 'user', 
            content: `Schrijf een SEO-geoptimaliseerde meta description voor artikel: "${title}" gericht op ${city}. Focus op de belangrijkste voordelen en gebruik een actieve toon.` 
          }
        ],
        max_completion_tokens: 200,
      }),
    });

    const metaData = await metaResponse.json();
    const metaDescription = metaData.choices[0].message.content.replace(/"/g, '');

    // Generate comprehensive FAQ section
    let faqJson = null;
    const faqResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: `Je bent een SEO content specialist. Maak uitgebreide FAQ secties die:
- 6-8 relevante vragen bevatten
- Lange, gedetailleerde antwoorden hebben (100-200 woorden per antwoord)
- Zoekintentie optimaliseren
- Featured snippets targeten
- LSI keywords gebruiken
Output formaat: JSON array met objecten die "q" en "a" properties hebben.
Taal: ${language}` 
          },
          { 
            role: 'user', 
            content: `Maak een uitgebreide FAQ sectie voor artikel over "${title}" in ${city}. Focus op praktische vragen die mensen écht stellen.` 
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    const faqData = await faqResponse.json();
    try {
      const faqContent = faqData.choices[0].message.content;
      const jsonMatch = faqContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        faqJson = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('FAQ generation failed:', e);
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
        summary: generatedContent ? generatedContent.substring(0, 300) + '...' : '',
        tags: [targetKeyword, city].filter(Boolean),
        author: 'AutoblogifyAI',
        meta_title: title,
        meta_description: metaDescription,
        hero_image_url: heroImageUrl,
        hero_image_alt: heroImageAlt,
        body_markdown: generatedContent,
        faq_json: faqJson,
        cta_heading: ctaHeading,
        cta_subtext: ctaSubtext,
        city: city,
        word_count: generatedContent ? generatedContent.split(/\s+/).filter(word => word.length > 0).length : 0
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
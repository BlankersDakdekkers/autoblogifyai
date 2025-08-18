import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { seedKeyword, location = 'Nederland', language = 'nl' } = await req.json();

    if (!seedKeyword) {
      return new Response(
        JSON.stringify({ error: 'Seed keyword is vereist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating keywords for:', seedKeyword);

    let keywords = [];
    let contentIdeas = [];

    if (openAIApiKey) {
      // Use AI for keyword research
      const result = await generateKeywordsWithAI(seedKeyword, location, language);
      keywords = result.keywords;
      contentIdeas = result.contentIdeas;
    } else {
      // Use mock data
      keywords = generateMockKeywords(seedKeyword);
      contentIdeas = generateMockContentIdeas(seedKeyword);
    }

    return new Response(
      JSON.stringify({
        keywords,
        contentIdeas,
        totalResults: keywords.length,
        sources: openAIApiKey ? ['openai', 'analysis'] : ['mock_data']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-keywords function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateKeywordsWithAI(seedKeyword: string, location: string, language: string) {
  try {
    const prompt = `Genereer een uitgebreide keyword research voor "${seedKeyword}" in ${location}.

Geef terug:
1. 15 gerelateerde keywords met geschatte zoekvolumes, difficulty (1-100), en CPC in euro's
2. 5 content ideeën gebaseerd op deze keywords

Format als JSON:
{
  "keywords": [
    {
      "keyword": "string",
      "searchVolume": number,
      "difficulty": number,
      "cpc": number,
      "intent": "informational|commercial|transactional|navigational",
      "relatedTerms": ["string"]
    }
  ],
  "contentIdeas": [
    {
      "title": "string",
      "angle": "string", 
      "targetKeyword": "string",
      "estimatedTraffic": number,
      "contentType": "string"
    }
  ]
}

Focus op Nederlandse zoektermen en lokale varianten.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: 'Je bent een SEO specialist gespecialiseerd in Nederlandse keyword research. Geef alleen geldige JSON terug.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      throw new Error('AI keyword generation failed');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      keywords: result.keywords || [],
      contentIdeas: result.contentIdeas || []
    };

  } catch (error) {
    console.error('Error with AI keyword generation:', error);
    // Fallback to mock data
    return {
      keywords: generateMockKeywords(seedKeyword),
      contentIdeas: generateMockContentIdeas(seedKeyword)
    };
  }
}

function generateMockKeywords(seedKeyword: string) {
  const locations = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven'];
  const modifiers = ['kosten', 'prijzen', 'tips', 'gids', 'advies', 'service', 'bedrijf', 'specialist'];
  
  const keywords = [];
  
  // Base keyword variations
  keywords.push({
    keyword: seedKeyword,
    searchVolume: Math.floor(Math.random() * 2000) + 500,
    difficulty: Math.floor(Math.random() * 40) + 20,
    cpc: Math.round((Math.random() * 3 + 1) * 100) / 100,
    intent: 'commercial',
    relatedTerms: [`beste ${seedKeyword}`, `${seedKeyword} vergelijken`, `${seedKeyword} reviews`]
  });

  // Location + keyword
  locations.forEach(location => {
    keywords.push({
      keyword: `${seedKeyword} ${location}`,
      searchVolume: Math.floor(Math.random() * 1000) + 200,
      difficulty: Math.floor(Math.random() * 35) + 25,
      cpc: Math.round((Math.random() * 4 + 2) * 100) / 100,
      intent: 'commercial',
      relatedTerms: [`beste ${seedKeyword} ${location}`, `${seedKeyword} ${location} kosten`]
    });
  });

  // Keyword + modifiers
  modifiers.forEach(modifier => {
    keywords.push({
      keyword: `${seedKeyword} ${modifier}`,
      searchVolume: Math.floor(Math.random() * 800) + 100,
      difficulty: Math.floor(Math.random() * 30) + 15,
      cpc: Math.round((Math.random() * 2.5 + 0.5) * 100) / 100,
      intent: modifier === 'kosten' || modifier === 'prijzen' ? 'informational' : 'commercial',
      relatedTerms: [`${modifier} ${seedKeyword}`, `${seedKeyword} ${modifier} 2024`]
    });
  });

  return keywords.slice(0, 15);
}

function generateMockContentIdeas(seedKeyword: string) {
  return [
    {
      title: `Complete ${seedKeyword} Gids Nederland 2024`,
      angle: "Uitgebreide handleiding",
      targetKeyword: `${seedKeyword} gids`,
      estimatedTraffic: Math.floor(Math.random() * 800) + 200,
      contentType: "Pillar Content"
    },
    {
      title: `${seedKeyword} Kosten: Wat Betaal Je in 2024?`,
      angle: "Prijsvergelijking",
      targetKeyword: `${seedKeyword} kosten`,
      estimatedTraffic: Math.floor(Math.random() * 600) + 150,
      contentType: "Commercial"
    },
    {
      title: `Top 10 ${seedKeyword} Bedrijven in Amsterdam`,
      angle: "Lokale directory",
      targetKeyword: `${seedKeyword} Amsterdam`,
      estimatedTraffic: Math.floor(Math.random() * 500) + 100,
      contentType: "Local SEO"
    },
    {
      title: `${seedKeyword} Tips van Experts: Zo Doe Je Het Goed`,
      angle: "Expert advies",
      targetKeyword: `${seedKeyword} tips`,
      estimatedTraffic: Math.floor(Math.random() * 400) + 100,
      contentType: "Informational"
    },
    {
      title: `Waarom Kiezen voor Professionele ${seedKeyword}?`,
      angle: "Overtuigingsartikel",
      targetKeyword: `professionele ${seedKeyword}`,
      estimatedTraffic: Math.floor(Math.random() * 300) + 80,
      contentType: "Commercial"
    }
  ];
}
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content, category } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a descriptive prompt based on the blog content
    const categoryEmoji = {
      'seo': '🎯',
      'marketing': '📈', 
      'techniek': '⚙️',
      'workflow': '🔄',
      'planning': '📅',
      'tools': '🛠️',
      'analytics': '📊',
      'content': '📝',
      'wordpress': '📱',
      'automation': '🚀'
    };

    const prompt = `Create a professional, modern blog header image for an article titled "${title}". 
    Category: ${category}. 
    Style: Clean, minimalist, professional business design with subtle tech elements. 
    Colors: Modern blue and white palette with subtle gradients. 
    Include relevant icons or symbols related to ${category} and content marketing. 
    No text overlay needed. 
    High quality, 16:9 aspect ratio, suitable for blog headers.`;

    console.log('Generating image with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        size: '1536x1024',
        quality: 'high',
        output_format: 'png',
        n: 1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Image generation successful');

    // Return the base64 image data
    return new Response(
      JSON.stringify({ 
        imageUrl: data.data[0].b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : data.data[0].url,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-blog-images function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
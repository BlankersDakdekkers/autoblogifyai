import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, width = 1080, height = 1080, platform, campaignType, audience } = await req.json();

    console.log('Generating social media mockup with prompt:', prompt);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate image using OpenAI
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: `${width}x${height}`,
        quality: 'hd',
        style: 'natural'
      }),
    });

    if (!imageResponse.ok) {
      const errorData = await imageResponse.text();
      console.error('Image generation failed:', errorData);
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0].url;

    console.log('Image generated successfully:', imageUrl);

    // Optional: Store the generated image in Supabase Storage for persistence
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Download the generated image
      const imageBlob = await fetch(imageUrl).then(res => res.blob());
      const fileName = `social-mockup-${platform}-${campaignType}-${audience}-${Date.now()}.png`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, imageBlob, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);
        
        console.log('Image stored in Supabase:', publicUrlData.publicUrl);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            imageUrl: publicUrlData.publicUrl,
            tempUrl: imageUrl 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (storageError) {
      console.warn('Failed to store image in Supabase storage:', storageError);
      // Continue with temporary URL if storage fails
    }

    // Return the temporary URL if storage fails
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: imageUrl,
        tempUrl: imageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-social-mockups function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
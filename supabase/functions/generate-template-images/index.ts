import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { templateType, templateName, prompt } = await req.json()

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // Genereer een specifieke prompt gebaseerd op template type
    let imagePrompt = prompt || generatePromptForTemplate(templateType, templateName)

    console.log('Generating image with prompt:', imagePrompt)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'webp',
        background: 'opaque'
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const result = await response.json()
    
    // gpt-image-1 returns base64 directly
    const imageData = result.data[0].b64_json

    return new Response(
      JSON.stringify({ 
        success: true,
        image: `data:image/webp;base64,${imageData}`,
        prompt: imagePrompt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error generating template image:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to generate template image', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

function generatePromptForTemplate(templateType: string, templateName: string): string {
  const prompts = {
    blog: "A modern, professional blog post layout on a laptop screen showing a well-formatted article with headers, paragraphs, and images. Clean typography, white background, professional lighting. Photorealistic, high quality.",
    service: "A professional service website homepage displayed on a desktop computer. Modern business layout with hero section, service descriptions, contact information, and call-to-action buttons. Corporate style, clean design, professional photography.",
    landing: "A high-converting landing page design on multiple devices (desktop, tablet, mobile). Modern web design with compelling headlines, benefit sections, testimonials, and clear call-to-action buttons. Marketing focused, professional presentation.",
    email: "A professional email template displayed in an email client interface. Clean layout with header, body content, call-to-action buttons, and footer. Business communication style, modern email design.",
    social: "Social media content creation workspace with multiple platform previews (Instagram, Facebook, LinkedIn). Content calendar, engagement metrics, professional social media management setup. Modern, colorful, engaging design."
  }

  return prompts[templateType as keyof typeof prompts] || 
    "A professional digital marketing template design displayed on a modern computer screen. Clean, modern web interface with structured content layout."
}
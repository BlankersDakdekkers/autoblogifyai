import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Runware WebSocket service for high-quality ad images
class RunwareService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private pendingRequests = new Map();
  
  constructor(private apiKey: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('wss://ws-api.runware.ai/v1');
      
      this.ws.onopen = () => {
        console.log('Connected to Runware AI');
        this.authenticate().then(resolve).catch(reject);
      };

      this.ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === 'authentication') {
              console.log('Runware authenticated successfully');
              this.isConnected = true;
            } else if (item.taskUUID && this.pendingRequests.has(item.taskUUID)) {
              const { resolve } = this.pendingRequests.get(item.taskUUID);
              this.pendingRequests.delete(item.taskUUID);
              resolve(item);
            }
          });
        }
      };

      this.ws.onerror = (error) => {
        console.error('Runware WebSocket error:', error);
        reject(error);
      };
    });
  }

  async authenticate(): Promise<void> {
    const authMessage = [{
      taskType: "authentication",
      apiKey: this.apiKey
    }];
    
    this.ws!.send(JSON.stringify(authMessage));
  }

  async generateImage(prompt: string, width = 1024, height = 1024): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Not connected to Runware AI');
    }

    const taskUUID = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const message = [{
        taskType: "imageInference",
        taskUUID,
        positivePrompt: prompt,
        model: "runware:100@1",
        width,
        height,
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: 7,
        scheduler: "FlowMatchEulerDiscreteScheduler",
        steps: 4
      }];

      this.pendingRequests.set(taskUUID, { resolve, reject });
      
      // Set timeout
      setTimeout(() => {
        if (this.pendingRequests.has(taskUUID)) {
          this.pendingRequests.delete(taskUUID);
          reject(new Error('Runware request timeout'));
        }
      }, 30000);

      this.ws!.send(JSON.stringify(message));
    });
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

// Enhanced prompt templates for professional ad visuals
function getPromptTemplate(platform: string, campaignType: string): string {
  const templates = {
    'facebook-feed': 'Professional Facebook feed advertisement with clean layout, engaging visuals, clear branding, call-to-action button',
    'facebook-video': 'Facebook video advertisement thumbnail with play button overlay, compelling visual hook, professional branding',
    'instagram-feed': 'Square Instagram feed post with modern aesthetic, lifestyle imagery, brand integration, professional photography style',
    'instagram-story': 'Vertical Instagram story advertisement with mobile-optimized design, swipe-up indicator, engaging content flow',
    'linkedin': 'Professional LinkedIn advertisement with business-focused imagery, corporate aesthetic, trustworthy design elements'
  };
  
  return templates[`${platform}-${campaignType}`] || 'Professional social media advertisement with modern design and clear branding';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let runwareService: RunwareService | null = null;
  
  try {
    const { prompt, width = 1080, height = 1080, platform, campaignType, audience } = await req.json();
    
    // Build enhanced prompt for professional advertisement visuals
    const promptTemplate = getPromptTemplate(platform || 'facebook', campaignType || 'feed');
    const enhancedPrompt = `${promptTemplate}. AutoblogifyAI content automation tool. ${prompt}. Professional business marketing, high-quality visuals, modern design, eye-catching composition, commercial photography style.`;
    
    console.log('Generating social media mockup with enhanced prompt:', enhancedPrompt);
    
    let imageUrl: string | null = null;
    let provider = 'none';
    
    // Try Runware AI first for superior quality
    if (runwareApiKey) {
      try {
        console.log('Attempting to generate with Runware AI...');
        runwareService = new RunwareService(runwareApiKey);
        await runwareService.connect();
        
        const result = await runwareService.generateImage(enhancedPrompt, width, height);
        if (result && result.imageURL) {
          imageUrl = result.imageURL;
          provider = 'runware';
          console.log('Runware AI image generated successfully:', imageUrl);
        }
      } catch (runwareError) {
        console.error('Runware AI failed, falling back to DALL-E:', runwareError.message);
      } finally {
        if (runwareService) {
          runwareService.close();
        }
      }
    }
    
    // Fallback to DALL-E if Runware failed or not available
    if (!imageUrl && openAIApiKey) {
      try {
        console.log('Using DALL-E as fallback...');
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: enhancedPrompt,
            n: 1,
            size: width <= 1024 && height <= 1024 ? '1024x1024' : '1792x1024',
            quality: 'hd',
            style: 'natural'
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.data[0].url;
          provider = 'dalle';
          console.log('DALL-E image generated successfully:', imageUrl);
        } else {
          const errorData = await imageResponse.text();
          console.error('DALL-E generation failed:', errorData);
        }
      } catch (dalleError) {
        console.error('DALL-E API error:', dalleError.message);
      }
    }

    if (!imageUrl) {
      throw new Error('Failed to generate image with both Runware AI and DALL-E');
    }

    // Store the generated image in Supabase Storage for persistence
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Download the generated image
      const imageBlob = await fetch(imageUrl).then(res => res.blob());
      const fileExtension = provider === 'runware' ? 'webp' : 'png';
      const fileName = `social-mockup-${platform}-${campaignType}-${audience}-${Date.now()}.${fileExtension}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, imageBlob, {
          contentType: provider === 'runware' ? 'image/webp' : 'image/png',
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
            tempUrl: imageUrl,
            provider,
            platform,
            campaignType,
            audience
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (storageError) {
      console.warn('Failed to store image in Supabase storage:', storageError);
      // Continue with original URL if storage fails
    }

    // Return the original URL if storage fails
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: imageUrl,
        tempUrl: imageUrl,
        provider,
        platform,
        campaignType,
        audience
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
  } finally {
    // Ensure Runware connection is always closed
    if (runwareService) {
      runwareService.close();
    }
  }
});
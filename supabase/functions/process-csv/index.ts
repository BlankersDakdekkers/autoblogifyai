import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Enhanced logging
const logStep = (step: string, details?: any) => {
  console.log(`[CSV-PROCESSOR] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Rate limiting configuration
const BATCH_SIZE = 5; // Process 5 rows at a time
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay
const MAX_RETRIES = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing CSV request started");
    
    // Check for authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Authorization header is vereist'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      logStep("ERROR: Invalid JSON body", { parseError: parseError.message });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid request body' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { csvUrl, options = {} } = body;

    if (!csvUrl) {
      logStep("ERROR: Missing CSV URL");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'CSV URL is vereist' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    
    // Create client for user authentication check
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user authentication
    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user) {
      logStep("ERROR: User authentication failed", { userError });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Unauthorized - gebruiker niet gevonden'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep("User authenticated", { userId: user.id });

    // Create service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing processing jobs for this URL
    const { data: existingJobs } = await supabase
      .from('csv_processing_jobs')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('csv_url', csvUrl)
      .eq('status', 'processing')
      .limit(1);

    if (existingJobs && existingJobs.length > 0) {
      logStep("Found existing processing job", { jobId: existingJobs[0].id });
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'CSV wordt al verwerkt',
          jobId: existingJobs[0].id,
          status: 'processing'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create processing job
    const { data: job, error: jobError } = await supabase
      .from('csv_processing_jobs')
      .insert({
        user_id: user.id,
        csv_url: csvUrl,
        status: 'processing'
      })
      .select()
      .single();

    if (jobError) {
      logStep("ERROR: Job creation failed", { jobError });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Database fout bij aanmaken job'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep("Job created", { jobId: job.id });

    // Process CSV synchronously with timeout (no background task)
    try {
      await processCSVData(csvUrl, job.id, user.id, supabase, options, authHeader);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'CSV processing voltooid',
          jobId: job.id,
          status: 'completed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      logStep("ERROR: CSV processing failed", { error: error.message });
      
      // Update job status to failed
      await supabase
        .from('csv_processing_jobs')
        .update({ 
          status: 'failed',
          error_message: error.message 
        })
        .eq('id', job.id);
        
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'CSV processing gefaald',
          jobId: job.id,
          status: 'failed',
          error: error.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    logStep("ERROR: Request processing failed", { error: error.message });
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Onbekende fout'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processCSVData(csvUrl: string, jobId: string, userId: string, supabase: any, options: any = {}, authHeader?: string) {
  const startTime = Date.now();
  let processedCount = 0;
  
  try {
    logStep("Background processing started", { jobId, csvUrl: csvUrl.substring(0, 100) + '...' });
    
    // Security: Validate CSV URL to prevent SSRF attacks
    if (!isValidCsvUrl(csvUrl)) {
      throw new Error('Invalid or potentially dangerous CSV URL provided');
    }
    
    // Validate and correct CSV URL format for Google Sheets
    let correctedUrl = csvUrl;
    
    // Check if it's a Google Sheets URL and correct format if needed
    if (csvUrl.includes('docs.google.com/spreadsheets')) {
      console.log('Detected Google Sheets URL, checking format...');
      console.log('Original URL:', csvUrl);
      
      // If it's already a published CSV URL, use it as-is
      if (csvUrl.includes('/pub?') && csvUrl.includes('output=csv')) {
        console.log('URL is already published CSV format, using as-is');
        correctedUrl = csvUrl;
      } 
      // If it's an export URL, use it as-is
      else if (csvUrl.includes('/export?format=csv')) {
        console.log('URL is already export format, using as-is');
        correctedUrl = csvUrl;
      }
      // Otherwise, try to convert to export format
      else {
        let spreadsheetId = '';
        
        // Extract spreadsheet ID from various Google Sheets URL formats
        const patterns = [
          /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/, // Standard format: /d/ID/
        ];
        
        for (const pattern of patterns) {
          const match = csvUrl.match(pattern);
          if (match) {
            spreadsheetId = match[1];
            break;
          }
        }
        
        if (spreadsheetId) {
          // Extract gid if present
          let gid = '0'; // Default to first sheet
          const gidMatch = csvUrl.match(/[?&#]gid=([0-9]+)/);
          if (gidMatch) {
            gid = gidMatch[1];
          }
          
          // Use the correct export format for Google Sheets
          correctedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
          console.log('Corrected URL:', correctedUrl);
        } else {
          console.log('Could not extract spreadsheet ID from URL');
          // Don't throw error, try the original URL
          console.log('Using original URL as fallback');
          correctedUrl = csvUrl;
        }
      }
    }
    
    console.log('Attempting to fetch CSV from:', correctedUrl);
    
    let csvResponse;
    try {
      csvResponse = await fetch(correctedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CSV-Processor/1.0)',
          'Accept': 'text/csv,text/plain,application/csv,*/*',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow'
      });
    } catch (fetchError) {
      console.error('Network error fetching CSV:', fetchError);
      throw new Error(`Network error: Could not reach CSV URL. Check if the URL is accessible: ${fetchError.message}`);
    }
    
    console.log('CSV fetch response status:', csvResponse.status, csvResponse.statusText);
    console.log('CSV fetch response headers:', Object.fromEntries(csvResponse.headers.entries()));
    
    if (!csvResponse.ok) {
      const errorBody = await csvResponse.text().catch(() => 'Could not read error body');
      console.error('CSV fetch failed. Status:', csvResponse.status, 'Body:', errorBody);
      
      if (csvResponse.status === 404) {
        throw new Error(`CSV bestand niet gevonden (404). Voor Google Sheets:
1. Ga naar je Google Sheet
2. Klik op 'Bestand' > 'Publiceren op internet'  
3. Kies 'Hele document' en 'CSV'
4. Klik 'Publiceren' en kopieer de link
5. Of gebruik het format: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv

Voor andere CSV bestanden: controleer of de URL publiek toegankelijk is.`);
      } else if (csvResponse.status === 403) {
        throw new Error(`Toegang geweigerd (403). Het CSV bestand is niet publiek toegankelijk. 
Voor Google Sheets: zorg dat het document gedeeld is met 'Iedereen met de link kan bekijken'.`);
      } else {
        throw new Error(`Fout bij ophalen CSV (${csvResponse.status}): ${csvResponse.statusText}. 
Response: ${errorBody}
        
Tip: Test je URL eerst in de browser om te controleren of deze werkt.`);
      }
    }
    
    const csvText = await csvResponse.text();
    console.log('CSV content length:', csvText.length);
    console.log('CSV content preview:', csvText.substring(0, 300) + '...');
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV file is empty or contains no data');
    }
    
    // Security: Validate file size
    if (!validateFileSize(csvText)) {
      throw new Error('CSV file is too large (max 10MB)');
    }
    
    // Security: Sanitize CSV content
    const sanitizedCsvText = sanitizeCsvContent(csvText);
    
    const rows = parseCSV(sanitizedCsvText);
    console.log(`Parsed ${rows.length} rows from CSV`);
    
    if (rows.length === 0) {
      throw new Error('No valid data rows found in CSV. Please check the CSV format and content.');
    }
    
    console.log('First row sample:', JSON.stringify(rows[0], null, 2));

    // Update job with total rows
    await supabase
      .from('csv_processing_jobs')
      .update({ 
        total_rows: rows.length,
        processed_rows: 0 
      })
      .eq('id', jobId);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process rows in batches for better performance and rate limiting
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      logStep("Processing batch", { 
        batchNumber: Math.floor(i / BATCH_SIZE) + 1, 
        batchSize: batch.length,
        totalBatches: Math.ceil(rows.length / BATCH_SIZE)
      });

      // Process batch rows in parallel with error handling
      const batchPromises = batch.map(async (row, index) => {
        const rowIndex = i + index;
        let retryCount = 0;
        
        while (retryCount < MAX_RETRIES) {
          try {
            await processRow(row, userId, supabase, rowIndex, authHeader);
            successCount++;
            return { success: true, rowIndex };
          } catch (error) {
            retryCount++;
            logStep("Row processing error", { 
              rowIndex, 
              attempt: retryCount, 
              error: error.message 
            });
            
            if (retryCount >= MAX_RETRIES) {
              errorCount++;
              return { success: false, rowIndex, error: error.message };
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
          }
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);
      processedCount += batch.length;
      
      // Update progress every batch
      await supabase
        .from('csv_processing_jobs')
        .update({ 
          processed_rows: processedCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      // Add delay between batches to respect rate limits
      if (i + BATCH_SIZE < rows.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;

    // Mark job as completed with statistics
    await supabase
      .from('csv_processing_jobs')
      .update({ 
        status: 'completed',
        processed_rows: processedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    logStep("Processing completed successfully", { 
      jobId,
      totalRows: rows.length,
      processedCount,
      successCount,
      errorCount,
      processingTimeSeconds: processingTime
    });

  } catch (error) {
    logStep("ERROR: Background processing failed", { 
      jobId, 
      error: error.message,
      processedRows: processedCount
    });
    
    // Mark job as failed with detailed error info
    await supabase
      .from('csv_processing_jobs')
      .update({ 
        status: 'failed',
        error_message: `Processing failed after ${processedCount} rows: ${error.message}`,
        processed_rows: processedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
      
    throw error;
  }
}

async function processRow(row: any, userId: string, supabase: any, rowIndex?: number, authHeader?: string) {
  logStep("Processing row", { rowIndex, userId, rowKeys: Object.keys(row) });
  
  // Enhanced row validation
  const requiredFields = ['title'];
  const missingFields = requiredFields.filter(field => !row[field] && !row[field.charAt(0).toUpperCase() + field.slice(1)]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Deduct credit before processing
  logStep("Attempting to deduct credit", { userId, rowIndex });
  const { data: creditResult, error: creditError } = await supabase
    .rpc('deduct_credit', { user_uuid: userId });

  if (creditError) {
    logStep("Credit deduction failed", { error: creditError.message, rowIndex });
    throw new Error(`Credit deduction failed: ${creditError.message}`);
  }

  if (!creditResult) {
    logStep("Insufficient credits", { userId, rowIndex });
    throw new Error('Insufficient credits to process this row');
  }

  logStep("Credit deducted successfully", { userId, rowIndex });

  // Generate enhanced AI content with all features from generate-content function
  let aiContent;
  try {
    aiContent = await generateContentWithAI(row);
  } catch (error) {
    logStep("Enhanced AI generation failed, using fallback", { rowIndex, error: error.message });
    const mockContent = generateMockContent(row);
    aiContent = {
      content: mockContent,
      metaDescription: `${row.title} - Complete gids met praktische tips en strategieën.`,
      faq: [],
      cta: { heading: 'Neem Contact Op', subtext: 'Start vandaag nog' }
    };
  }
  
  // Validate and normalize status
  const validStatuses = ['draft', 'published', 'scheduled'];
  let normalizedStatus = 'draft'; // default
  
  if (row.status && typeof row.status === 'string') {
    const statusLower = row.status.toLowerCase().trim();
    if (validStatuses.includes(statusLower)) {
      normalizedStatus = statusLower;
    } else if (statusLower.includes('publish') || statusLower.includes('live')) {
      normalizedStatus = 'published';
    } else if (statusLower.includes('schedule') || statusLower.includes('plan')) {
      normalizedStatus = 'scheduled';
    }
  }

  // Generate hero image if not provided
  let heroImageUrl = row.hero_image_url || aiContent.heroImageUrl || '';
  let heroImageAlt = row.hero_image_alt || aiContent.heroImageAlt || '';
  
  if (!heroImageUrl) {
    logStep("Generating hero image", { rowIndex, title: row.title });
    try {
      const imageResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-blog-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: row.title || row.Title || 'Artikel',
          content: aiContent.content.substring(0, 500) || '',
          category: parseTagsFromString(row.tags)?.[0] || 'content'
        })
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        if (imageData.success && imageData.imageUrl) {
          heroImageUrl = imageData.imageUrl;
          heroImageAlt = `${row.title || row.Title} - Hero afbeelding`;
          logStep("Hero image generated successfully", { rowIndex, imageUrl: heroImageUrl });
        }
      }
    } catch (imageError) {
      logStep("Image generation failed, continuing without image", { rowIndex, error: imageError.message });
    }
  }

  const blogPost = {
    user_id: userId,
    title: row.title || row.Title || 'Untitled',
    slug: generateUniqueSlug(row.title || row.Title || 'untitled', supabase),
    status: normalizedStatus,
    publish_date: validateAndFormatDate(row.publish_date) || new Date().toISOString().split('T')[0],
    summary: row.summary || aiContent.content.substring(0, 300) + '...',
    meta_title: row.meta_title || row.title || row.Title,
    meta_description: row.meta_description || aiContent.metaDescription,
    canonical_url: row.canonical_url || '',
    hero_image_url: heroImageUrl,
    hero_image_alt: heroImageAlt,
    body_markdown: aiContent.content,
    faq_json: aiContent.faq.length > 0 ? aiContent.faq : parseFAQ(row.faq_json),
    cta_heading: row.cta_heading || aiContent.cta.heading,
    cta_subtext: row.cta_subtext || aiContent.cta.subtext,
    tags: parseTagsFromString(row.tags) || [row.title?.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim() || 'seo'],
    author: row.author || 'AutoblogifyAI',
    city: row.city || 'Nederland',
    word_count: calculateWordCount(aiContent.content)
  };

  logStep("Inserting blog post", { rowIndex, title: blogPost.title, slug: blogPost.slug });

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(blogPost)
    .select();

  if (error) {
    logStep("ERROR: Blog post insertion failed", { rowIndex, error, blogPost: Object.keys(blogPost) });
    throw new Error(`Database insertion failed: ${error.message}`);
  }
  
  logStep("Blog post inserted successfully", { rowIndex, postId: data[0]?.id });
  
  // Auto-publish to CMS if integration is active
  if (data[0]?.id) {
    await autoPublishToCMS(data[0].id, userId, supabase, rowIndex, authHeader);
  }

  // Update blog post status tracking
  if (data[0]?.id) {
    await supabase
      .from('blog_posts')
      .update({
        processing_status: 'completed',
        ai_enhanced: true
      })
      .eq('id', data[0].id);
  }
  
  return data[0];
}

// Enhanced content generation with retry logic
async function generateContentWithRetry(row: any, maxRetries: number = 2): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateContent(row);
    } catch (error) {
      logStep("Content generation attempt failed", { attempt, error: error.message });
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error('All content generation attempts failed');
}

// Enhanced content generation that matches the Knowledge Base blog generator
async function generateContentWithAI(row: any): Promise<{
  content: string;
  metaDescription: string;
  faq: any[];
  cta: { heading: string; subtext: string };
  heroImageUrl?: string;
  heroImageAlt?: string;
}> {
  if (!openAIApiKey) {
    const mockContent = generateMockContent(row);
    return {
      content: mockContent,
      metaDescription: `${row.title} - Complete gids met praktische tips en strategieën.`,
      faq: [],
      cta: { heading: 'Neem Contact Op', subtext: 'Start vandaag nog' }
    };
  }

  const title = row.title || row.Title || 'Algemeen onderwerp';
  const targetKeyword = title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
  const city = row.city || 'Nederland';
  const wordCount = parseInt(row.word_count_target) || 1200;
  const language = 'nl';

  // Enhanced system prompt with neuromarketing - EXACT copy from generate-content
  const basePrompt = `Je bent een expert SEO content writer die hoogkwalitatieve, professionele artikelen schrijft van ${wordCount} woorden.

KWALITEITSEISEN:
- Schrijf CONSISTENTE, hoogkwalitatieve artikelen van exact ${wordCount} woorden
- Gebruik moderne SEO-technieken (2024/2025)
- Gebruik perfecte Nederlandse markdown opmaak
- Maak de tekst informatief en boeiend
- Gebruik headers (H2, H3), lijsten, tabellen waar relevant
- Voeg praktische tips en concrete voorbeelden toe
- Optimaliseer voor zoekintentie en gebruikerservaring

MARKDOWN OPMAAK VEREISTEN:
- Gebruik ## voor hoofdstukken (H2)
- Gebruik ### voor subsecties (H3) 
- Gebruik **vetgedrukte tekst** voor belangrijke punten
- Gebruik bullet points (- ) en genummerde lijsten (1. )
- Voeg tabellen toe met | syntax waar relevant
- Gebruik > voor belangrijke quotes/tips

MODERNE SEO TECHNIEKEN:
- Focus op zoekintentie en gebruikerservaring
- Gebruik LSI keywords en semantische varianten
- Optimaliseer voor featured snippets
- Gebruik interne linking concepten
- Focus op E-A-T (Expertise, Authority, Trust)

NEUROMARKETING TECHNIEKEN:
- Gebruik emotionele triggers (angst, verlangen, urgentie)
- Voeg sociale bewijskracht toe (testimonials, cijfers)
- Gebruik machtsproblemen en oplossingsgerichte taal
- Creëer urgentie en schaarste waar relevant
- Gebruik specifieke, concrete taal in plaats van vaag
- Voeg vertrouwenssignalen toe
- Gebruik actieve, overtuigende taal

Taal: ${language}`;

  // Enhanced user prompt for consistent, high-quality content - EXACT copy from generate-content
  const userPrompt = `Schrijf een professioneel, hoogkwalitatief artikel van exact ${wordCount} woorden over: "${title}"

ONDERWERP FOCUS: ${title}
DOELGROEP: ${city} - Nederlandse doelgroep
TREFWOORDEN: Gebruik "${targetKeyword}" en varianten natuurlijk door de tekst (keyword density 1-2%)

ARTIKEL INHOUD VEREISTEN:
- Exact ${wordCount} woorden (tel zorgvuldig!)
- Boeiende inleiding die de waarde direct duidelijk maakt
- 4-6 goed gestructureerde hoofdstukken
- Praktische tips en concrete voorbeelden
- Actuele trends en ontwikkelingen (2024/2025)
- Lokale relevantie voor ${city} waar mogelijk
- Actionable insights die direct bruikbaar zijn
- Professionele, betrouwbare toon

VERPLICHTE STRUCTUUR:
## Inleiding
Directe waardepropositie en overview (150-200 woorden)

## [4-6 Hoofdstukken met beschrijvende titels]
Elk hoofdstuk ${Math.floor(wordCount / 6)}-${Math.floor(wordCount / 4)} woorden met diepgaande, praktische informatie

## Conclusie
Samenvatting, key takeaways en volgende stappen (100-150 woorden)

KWALITEITSVEREISTEN:
- Gebruik perfecte markdown opmaak met ##, ###, **vet**, lijsten
- Voeg concrete voorbeelden en data toe
- Schrijf in de derde persoon, professioneel
- Gebruik actieve zinnen
- Vermijd clichés en vage taal
- Tel woorden nauwkeurig en kom uit op exact ${wordCount} woorden`;

  try {
    // Generate main content
    logStep("Generating main content with enhanced AI");
    const contentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Use same model as generate-content
        messages: [
          { role: 'system', content: basePrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: Math.min(16000, Math.max(4000, wordCount * 10)),
        temperature: 0.7,
        seed: Math.abs(title.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0))
      }),
    });

    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      throw new Error(`Content generation failed: ${errorText}`);
    }

    const contentData = await contentResponse.json();
    const generatedContent = contentData.choices[0].message.content;

    // Generate hero image - EXACT copy from generate-content
    let heroImageUrl = null;
    let heroImageAlt = null;
    
    try {
      const imagePrompt = `Create a professional, modern blog header image for an article titled "${title}". Style: Clean, minimalist, professional business design with subtle tech elements. Colors: Modern blue and white palette with subtle gradients. Include relevant icons or symbols related to the topic. No text overlay needed. High quality, 16:9 aspect ratio, suitable for blog headers.`;
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          size: '1792x1024',
          quality: 'standard',
          n: 1
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        heroImageUrl = imageData.data[0].url;
        heroImageAlt = `Afbeelding voor artikel: ${title}`;
      }
    } catch (imageError) {
      logStep('Image generation failed', { error: imageError.message });
    }

    // Generate meta description - EXACT copy from generate-content
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

    // Generate FAQ section - EXACT copy from generate-content
    let faqJson = [];
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
      logStep('FAQ parsing failed', { error: e.message });
    }

    // Generate CTA - EXACT copy from generate-content
    const ctaPrompt = `Schrijf een overtuigende call-to-action heading en subtext voor "${title}" service. Heading max 8 woorden, subtext max 15 woorden.`;

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
    const ctaHeading = ctaLines[0]?.replace(/^Heading:\s*/i, '').replace(/"/g, '') || 'Neem Contact Op';
    const ctaSubtext = ctaLines[1]?.replace(/^Subtext:\s*/i, '').replace(/"/g, '') || 'Start vandaag nog';

    return {
      content: generatedContent,
      metaDescription,
      faq: faqJson,
      cta: { heading: ctaHeading, subtext: ctaSubtext },
      heroImageUrl,
      heroImageAlt
    };

  } catch (error) {
    logStep("Enhanced AI generation failed, using fallback", { error: error.message });
    throw error;
  }
}

async function generateContent(row: any): Promise<string> {
  // This is now a wrapper for backwards compatibility
  try {
    const aiResult = await generateContentWithAI(row);
    return aiResult.content;
  } catch (error) {
    return generateMockContent(row);
  }
}

function generateMockContent(row: any): string {
  const title = row.title || 'Algemeen Onderwerp';
  const city = row.city || 'Nederland';
  const summary = row.summary || 'Dit is een uitgebreide gids.';

  return `# ${title}

${summary}

## Waarom kiezen voor ${title.toLowerCase()} in ${city}?

In dit artikel behandelen we alle aspecten van ${title.toLowerCase()}. Of je nu op zoek bent naar informatie, tips, of praktische adviezen - we helpen je verder.

## Belangrijke voordelen

- **Kwaliteit**: Hoogwaardige service en resultaten
- **Ervaring**: Jarenlange expertise in de branche  
- **Service**: Uitstekende klantenservice
- **Prijs**: Concurrerende tarieven

## Praktische tips

1. **Onderzoek verschillende opties** - Vergelijk altijd meerdere aanbieders
2. **Let op kwaliteit** - Goedkoop is niet altijd voordeliger
3. **Vraag referenties** - Bekijk eerdere projecten en reviews
4. **Communicatie** - Zorg voor duidelijke afspraken

## Veelgestelde vragen

**Wat zijn de kosten?**
De kosten variëren afhankelijk van verschillende factoren. Vraag altijd een offerte aan.

**Hoe lang duurt het proces?**
Dit hangt af van de omvang van het project. Gemiddeld 2-4 weken.

## Conclusie

${title} in ${city} biedt vele mogelijkheden. Met de juiste aanpak en een betrouwbare partner kun je uitstekende resultaten behalen.

Neem contact op voor een vrijblijvende offerte en professioneel advies.`;
}

function parseCSV(csvText: string) {
  console.log('Parsing CSV with length:', csvText.length);
  
  if (!csvText || csvText.trim().length === 0) {
    console.log('CSV text is empty');
    return [];
  }
  
  const lines = csvText.trim().split('\n').filter(line => line.trim().length > 0);
  console.log('CSV lines after filtering:', lines.length);
  
  if (lines.length < 2) {
    console.log('CSV has insufficient lines:', lines.length);
    return [];
  }
  
  // Detect delimiter - prefer comma, but use semicolon if no commas found
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  
  const delimiter = semicolonCount > commaCount ? ';' : ',';
  console.log('Using delimiter:', delimiter, `(commas: ${commaCount}, semicolons: ${semicolonCount})`);
  
  // Parse headers
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  console.log('CSV headers:', headers);
  
  if (headers.length === 0) {
    console.log('No headers found');
    return [];
  }
  
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    
    // Skip rows with too few values (but allow some flexibility)
    if (values.length < Math.floor(headers.length / 2)) {
      console.log(`Skipping row ${i} - too few values. Expected ~${headers.length}, Got: ${values.length}`);
      continue;
    }
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Only include rows that have at least a title
    if (row.title || row.Title || row.TITLE || Object.values(row).some(v => v && String(v).trim().length > 0)) {
      rows.push(row);
    }
  }
  
  console.log('Successfully parsed rows:', rows.length);
  console.log('Sample rows:', JSON.stringify(rows.slice(0, 2), null, 2));
  return rows;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Security: Validate CSV URLs to prevent SSRF attacks
function isValidCsvUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Allow both HTTP and HTTPS for broader compatibility
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return false;
    }
    
    // Allow common CSV hosting domains
    const allowedDomains = [
      'docs.google.com',
      'drive.google.com',
      'sheets.googleapis.com',
      'raw.githubusercontent.com',
      'github.com',
      'pastebin.com',
      'dropbox.com',
      'onedrive.live.com',
      'sharepoint.com',
      // Allow any domain that doesn't look like private network
    ];
    
    // Block private IP ranges and localhost for security
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.2') ||
      hostname.startsWith('172.3') ||
      hostname.includes('::1') ||
      hostname === '0.0.0.0'
    ) {
      return false;
    }
    
    // For Google domains, ensure it's a proper format
    if (parsedUrl.hostname === 'docs.google.com') {
      return parsedUrl.pathname.includes('/spreadsheets/') || 
             parsedUrl.pathname.includes('/export');
    }
    
    // Check if it's a known allowed domain
    const isKnownDomain = allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    
    // If it's not a known domain, allow it but check if it looks like a reasonable CSV URL
    if (!isKnownDomain) {
      // Allow URLs that end with .csv or contain 'csv' in the path/query
      const fullUrl = url.toLowerCase();
      if (fullUrl.includes('.csv') || fullUrl.includes('csv') || fullUrl.includes('export')) {
        return true;
      }
      
      // Allow if it's clearly a public service (not IP address)
      if (!hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return true;
      }
    }
    
    return isKnownDomain;
  } catch (error) {
    console.log('URL validation error:', error);
    return false;
  }
}

// Security: Sanitize CSV content to prevent injection
function sanitizeCsvContent(content: string): string {
  // Remove potential script tags and dangerous content
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
}

// Security: Validate file size to prevent DoS
function validateFileSize(content: string): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB max
  return content.length <= maxSize;
}

function parseFAQ(faqString: string): any {
  if (!faqString) return null;
  try {
    // Security: Sanitize FAQ content before parsing
    const sanitized = faqString.replace(/<script[\s\S]*?<\/script>/gi, '');
    return JSON.parse(sanitized);
  } catch {
    return null;
  }
}

// Helper functions for enhanced processing
function generateUniqueSlug(title: string, supabase: any): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  // For now, return base slug with timestamp for uniqueness
  // In production, you might want to check database for duplicates
  return `${baseSlug}-${Date.now()}`;
}

function validateAndFormatDate(dateString: string): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3).trim() + '...';
}

function parseTagsFromString(tagsString: string): string[] {
  if (!tagsString) return [];
  return tagsString.toString()
    .split(/[;,]/)
    .map(tag => tag.trim())
    .filter(Boolean)
    .slice(0, 10); // Limit to 10 tags
}

function calculateWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

// Auto-publish to CMS function
async function autoPublishToCMS(blogPostId: string, userId: string, supabase: any, rowIndex?: number, authHeader?: string) {
  try {
    logStep("Checking for active CMS integrations", { blogPostId, userId, rowIndex });
    
    // Check for active CMS integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('cms_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (integrationsError) {
      logStep("Failed to fetch CMS integrations", { error: integrationsError.message, rowIndex });
      return;
    }
    
    if (!integrations || integrations.length === 0) {
      logStep("No active CMS integrations found, skipping auto-publish", { rowIndex });
      return;
    }
    
    logStep("Found active CMS integrations", { count: integrations.length, rowIndex });
    
    // Auto-publish to each active CMS integration
    for (const integration of integrations) {
      try {
        logStep("Auto-publishing to CMS", { 
          cmsType: integration.cms_type, 
          siteUrl: integration.site_url, 
          integrationId: integration.id,
          rowIndex 
        });
        
        // Call wordpress-publish function with authentication
        const publishResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/wordpress-publish`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader || `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || ''
          },
          body: JSON.stringify({
            postId: blogPostId,
            wordpressConfig: {
              siteUrl: integration.site_url,
              username: integration.api_credentials?.username,
              appPassword: integration.api_credentials?.appPassword
            }
          })
        });
        
        if (!publishResponse.ok) {
          const errorText = await publishResponse.text();
          logStep("Auto-publish to CMS failed", { 
            error: `Edge Function returned a non-2xx status code: ${publishResponse.status} - ${errorText}`, 
            integrationId: integration.id,
            rowIndex 
          });
        } else {
          const publishData = await publishResponse.json();
          if (publishData.success) {
            logStep("Auto-publish to CMS successful", { 
              cmsPostUrl: publishData.url,
              cmsPostId: publishData.wordpressId,
              integrationId: integration.id,
              rowIndex 
            });
          } else {
            logStep("Auto-publish to CMS returned unexpected result", { 
              result: publishData,
              integrationId: integration.id,
              rowIndex 
            });
          }
        }
      } catch (publishError) {
        logStep("Auto-publish to CMS error", { 
          error: publishError.message, 
          integrationId: integration.id,
          rowIndex 
        });
      }
    }
  } catch (error) {
    logStep("Auto-publish CMS check failed", { error: error.message, rowIndex });
  }
}
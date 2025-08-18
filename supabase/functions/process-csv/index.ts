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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvUrl } = await req.json();

    if (!csvUrl) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'CSV URL is vereist' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Create client for user authentication check
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user authentication
    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Unauthorized - gebruiker niet gevonden'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing CSV for user:', user.id);

    // Create service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      console.error('Error creating job:', jobError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Database fout bij aanmaken job'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created job:', job.id);

    // Start background processing immediately (not in background)
    try {
      await processCSVData(csvUrl, job.id, user.id, supabase);
    } catch (error) {
      console.error('Processing failed:', error);
      // Update job status to failed
      await supabase
        .from('csv_processing_jobs')
        .update({ 
          status: 'failed',
          error_message: error.message 
        })
        .eq('id', job.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'CSV processing gestart',
        jobId: job.id,
        status: 'processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-csv function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Onbekende fout'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processCSVData(csvUrl: string, jobId: string, userId: string, supabase: any) {
  try {
    console.log('Starting background processing for job:', jobId);
    console.log('Fetching CSV from:', csvUrl);
    
    // Security: Validate CSV URL to prevent SSRF attacks
    if (!isValidCsvUrl(csvUrl)) {
      throw new Error('Invalid or potentially dangerous CSV URL provided');
    }
    
    // Validate and correct CSV URL format for Google Sheets
    let correctedUrl = csvUrl;
    
    // Check if it's a Google Sheets URL and correct format if needed
    if (csvUrl.includes('docs.google.com/spreadsheets')) {
      console.log('Detected Google Sheets URL, correcting format...');
      console.log('Original URL:', csvUrl);
      
      let spreadsheetId = '';
      
      // Extract spreadsheet ID from various Google Sheets URL formats
      const patterns = [
        /\/d\/([a-zA-Z0-9-_]+)\//, // Standard format with trailing slash
        /\/d\/e\/([a-zA-Z0-9-_]+)\//, // Published format
        /spreadsheets\/d\/([a-zA-Z0-9-_]+)/, // Alternative format
      ];
      
      for (const pattern of patterns) {
        const match = csvUrl.match(pattern);
        if (match) {
          // For published sheets, use the second capture group
          spreadsheetId = match[2] || match[1];
          break;
        }
      }
      
      if (spreadsheetId) {
        // Extract gid if present
        let gid = '0'; // Default to first sheet
        const gidMatch = csvUrl.match(/[?&]gid=([0-9]+)/);
        if (gidMatch) {
          gid = gidMatch[1];
        }
        
        // Use the correct export format for Google Sheets
        correctedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
        console.log('Corrected URL:', correctedUrl);
      } else {
        console.log('Could not extract spreadsheet ID from URL');
        throw new Error(`Invalid Google Sheets URL format. Expected format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...`);
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

    // Process each row
    for (const row of rows) {
      try {
        await processRow(row, userId, supabase);
        processedCount++;
        
        // Update progress every 5 rows
        if (processedCount % 5 === 0) {
          await supabase
            .from('csv_processing_jobs')
            .update({ processed_rows: processedCount })
            .eq('id', jobId);
        }
      } catch (error) {
        console.error('Error processing row:', error);
        // Continue processing other rows
      }
    }

    // Mark job as completed
    await supabase
      .from('csv_processing_jobs')
      .update({ 
        status: 'completed',
        processed_rows: processedCount
      })
      .eq('id', jobId);

    console.log(`Successfully processed ${processedCount}/${rows.length} rows`);

  } catch (error) {
    console.error('Background processing error:', error);
    
    // Mark job as failed
    await supabase
      .from('csv_processing_jobs')
      .update({ 
        status: 'failed',
        error_message: error.message
      })
      .eq('id', jobId);
  }
}

async function processRow(row: any, userId: string, supabase: any) {
  console.log('Processing row for user:', userId, 'Row data:', Object.keys(row));
  
  // Generate content first to avoid async issues
  const bodyContent = await generateContent(row);
  
  const blogPost = {
    user_id: userId,
    title: row.title || row.Title || 'Untitled',
    slug: row.slug || generateSlug(row.title || row.Title || 'untitled'),
    status: row.status || 'draft',
    publish_date: row.publish_date || new Date().toISOString().split('T')[0],
    summary: row.summary || '',
    meta_title: row.meta_title || row.title || row.Title,
    meta_description: row.meta_description || '',
    canonical_url: row.canonical_url || '',
    hero_image_url: row.hero_image_url || '',
    hero_image_alt: row.hero_image_alt || '',
    body_markdown: bodyContent,
    faq_json: parseFAQ(row.faq_json),
    cta_heading: row.cta_heading || '',
    cta_subtext: row.cta_subtext || '',
    tags: row.tags ? row.tags.toString().split(';').map((tag: string) => tag.trim()).filter(Boolean) : [],
    author: row.author || 'AI Author',
    city: row.city || '',
    word_count: parseInt(row.word_count_target) || bodyContent.length / 5 // Rough estimate
  };

  console.log('Blog post object to insert:', JSON.stringify(blogPost, null, 2));

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(blogPost)
    .select();

  if (error) {
    console.error('Error inserting blog post:', error);
    console.error('Blog post data that failed:', blogPost);
    throw error;
  }
  
  console.log('Successfully inserted blog post:', data);
}

async function generateContent(row: any): Promise<string> {
  if (!openAIApiKey) {
    return generateMockContent(row);
  }

  try {
    const prompt = `Schrijf een SEO-geoptimaliseerde Nederlandse blogpost over: "${row.title || 'Algemeen onderwerp'}"

Context:
- Doelgroep: ${row.city || 'Nederland'}
- Samenvatting: ${row.summary || 'Geen samenvatting'}
- Doelwoordentelling: ${row.word_count_target || 800} woorden

De post moet:
- Een duidelijke H1, H2 en H3 structuur hebben
- SEO-vriendelijk zijn
- Praktische tips bevatten
- Een natuurlijke Nederlandse schrijfstijl hebben
- Relevante keywords bevatten

Schrijf de volledige blogpost in Markdown formaat:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Je bent een expert Nederlandse content schrijver gespecialiseerd in SEO-blogposts.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return generateMockContent(row);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error generating content with AI:', error);
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
    
    // Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    // Allow specific trusted domains for CSV hosting
    const allowedDomains = [
      'docs.google.com',
      'drive.google.com',
      'sheets.googleapis.com',
      // Add other trusted CSV hosting domains as needed
    ];
    
    // Block private IP ranges and localhost
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.') ||
      hostname.includes('::1')
    ) {
      return false;
    }
    
    // For Google domains, ensure it's a proper format
    if (parsedUrl.hostname === 'docs.google.com') {
      return parsedUrl.pathname.includes('/spreadsheets/') || 
             parsedUrl.pathname.includes('/export');
    }
    
    return allowedDomains.includes(parsedUrl.hostname);
  } catch {
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
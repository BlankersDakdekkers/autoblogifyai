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
        JSON.stringify({ error: 'CSV URL is vereist' }),
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
        JSON.stringify({ error: 'Unauthorized' }),
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
        JSON.stringify({ error: 'Database fout' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created job:', job.id);

    // Start background processing with error handling
    EdgeRuntime.waitUntil(
      processCSVData(csvUrl, job.id, user.id, supabase).catch(error => {
        console.error('Background processing failed:', error);
      })
    );

    return new Response(
      JSON.stringify({ 
        message: 'CSV processing gestart',
        jobId: job.id,
        status: 'processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-csv function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processCSVData(csvUrl: string, jobId: string, userId: string, supabase: any) {
  try {
    console.log('Starting background processing for job:', jobId);
    console.log('Fetching CSV from:', csvUrl);
    
    // Fetch CSV data
    const csvResponse = await fetch(csvUrl);
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.status} ${csvResponse.statusText}`);
    }
    
    const csvText = await csvResponse.text();
    console.log('CSV content preview:', csvText.substring(0, 200) + '...');
    
    const rows = parseCSV(csvText);
    console.log(`Parsed ${rows.length} rows from CSV. First row:`, rows[0]);

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
  console.log('Processing row for user:', userId, 'Row data:', row);
  
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
    body_markdown: await generateContent(row),
    faq_json: parseFAQ(row.faq_json),
    cta_heading: row.cta_heading || '',
    cta_subtext: row.cta_subtext || '',
    tags: row.tags ? row.tags.split(';').map((tag: string) => tag.trim()) : [],
    author: row.author || 'AI Author',
    city: row.city || '',
    word_count: parseInt(row.word_count_target) || 800
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
        model: 'gpt-5-2025-08-07',
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
  
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    console.log('CSV has insufficient lines:', lines.length);
    return [];
  }
  
  // Handle both comma and semicolon separated files
  const delimiter = csvText.includes(';') && !csvText.includes(',') ? ';' : ',';
  console.log('Using delimiter:', delimiter);
  
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
  console.log('CSV headers:', headers);
  
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) {
      console.log(`Skipping row ${i} - column count mismatch. Expected: ${headers.length}, Got: ${values.length}`);
      continue;
    }
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  console.log('Parsed rows:', rows.length, 'First few rows:', JSON.stringify(rows.slice(0, 2), null, 2));
  return rows;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseFAQ(faqJson: string) {
  try {
    return faqJson ? JSON.parse(faqJson) : null;
  } catch {
    return null;
  }
}
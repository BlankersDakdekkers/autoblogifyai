import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[PARSE-FILE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting file parsing");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'setup';
    
    if (!file) throw new Error("No file uploaded");
    
    logStep("File received", { fileName: file.name, size: file.size, type: file.type });

    let jsonData: any[][] = [];
    let headers: string[] = [];

    // Handle CSV files
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      logStep("Processing CSV file");
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must have at least a header and one data row");
      }

      // Parse CSV manually to handle quoted values
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      headers = parseCSVLine(lines[0]);
      jsonData = [headers, ...lines.slice(1).map(parseCSVLine)];
      
      logStep("CSV parsed", { rows: jsonData.length, headers });
    } 
    // Handle Excel files
    else {
      logStep("Processing Excel file");
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Import xlsx dynamically
      const XLSX = await import("https://esm.sh/xlsx@0.18.5");
      
      // Parse Excel file
      const workbook = XLSX.read(uint8Array, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      headers = jsonData[0] as string[];
      logStep("Excel parsed", { rows: jsonData.length });
    }

    if (!jsonData.length) throw new Error("File is empty");
    
    // Process the data - first row is headers
    const rows = jsonData.slice(1) as any[][];
    
    logStep("Processing rows", { headerCount: headers.length, dataRows: rows.length });
    
    // Find relevant columns
    const titleIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('title') || 
      h?.toLowerCase().includes('titel') ||
      h?.toLowerCase().includes('naam')
    );
    
    const contentIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('content') || 
      h?.toLowerCase().includes('inhoud') ||
      h?.toLowerCase().includes('beschrijving') ||
      h?.toLowerCase().includes('tekst')
    );
    
    const tagsIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('tag') ||
      h?.toLowerCase().includes('categorie')
    );
    
    if (titleIndex === -1 || contentIndex === -1) {
      throw new Error("File must contain 'title' and 'content' columns (or Dutch equivalents)");
    }
    
    logStep("Column mapping", { titleIndex, contentIndex, tagsIndex });
    
    // Store file in storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabaseClient.storage
      .from('knowledge-files')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    logStep("File uploaded to storage", { fileName });
    
    // Process each row for preview (don't insert yet)
    const previewItems = [];
    
    for (const row of rows) {
      const title = row[titleIndex]?.toString()?.trim();
      const content = row[contentIndex]?.toString()?.trim();
      const tagsString = tagsIndex !== -1 ? row[tagsIndex]?.toString()?.trim() : '';
      
      if (!title || !content) continue;
      
      const tags = tagsString ? tagsString.split(/[,;]/).map(t => t.trim()).filter(Boolean) : [];
      
      previewItems.push({
        title,
        content,
        category,
        type: 'article',
        author: user.email || 'Onbekend',
        tags
      });
    }
    
    logStep("Preview preparation complete", { 
      totalRows: rows.length, 
      previewItems: previewItems.length,
      skipped: rows.length - previewItems.length 
    });

    return new Response(JSON.stringify({
      success: true,
      preview: previewItems,
      message: `${previewItems.length} items gevonden voor preview`,
      total: rows.length,
      fileName
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
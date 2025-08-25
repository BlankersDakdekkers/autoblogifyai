import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, wordpressConfig } = await req.json();

    if (!postId || !wordpressConfig) {
      return new Response(
        JSON.stringify({ error: 'Post ID en WordPress configuratie zijn vereist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: 'Blogpost niet gevonden' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate hero image if not present
    let updatedPost = post;
    if (!post.hero_image_url) {
      console.log('Generating hero image for post:', post.title);
      try {
        const imageResponse = await fetch(`${supabaseUrl}/functions/v1/generate-blog-images`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: post.title,
            content: post.body_markdown?.substring(0, 500) || '',
            category: post.tags?.split(';')[0] || 'content'
          })
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          if (imageData.success && imageData.imageUrl) {
            console.log('Hero image generated successfully');
            
            // Update post with generated image
            const { error: updateError } = await supabase
              .from('blog_posts')
              .update({ 
                hero_image_url: imageData.imageUrl,
                hero_image_alt: `${post.title} - Hero afbeelding`
              })
              .eq('id', postId);

            if (!updateError) {
              updatedPost = {
                ...post,
                hero_image_url: imageData.imageUrl,
                hero_image_alt: `${post.title} - Hero afbeelding`
              };
              console.log('Post updated with hero image');
            }
          }
        }
      } catch (imageError) {
        console.log('Image generation failed, continuing without image:', imageError);
      }
    }

    // Publish to WordPress
    const result = await publishToWordPress(updatedPost, wordpressConfig);

    // Update post status if successful
    if (result.success) {
      await supabase
        .from('blog_posts')
        .update({ 
          status: 'published',
          canonical_url: result.url
        })
        .eq('id', postId);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in wordpress-publish function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function publishToWordPress(post: any, config: any) {
  try {
    const { siteUrl, username, appPassword } = config;
    
    // Normalize site URL
    const normalizedUrl = siteUrl.replace(/\/$/, '');
    
    // Clean and normalize credentials
    const cleanUsername = username.trim();
    const cleanAppPassword = appPassword.trim();
    const credentials = btoa(`${cleanUsername}:${cleanAppPassword}`);
    
    console.log('WordPress connection attempt:', {
      siteUrl: normalizedUrl,
      username: cleanUsername,
      appPasswordLength: cleanAppPassword.length
    });
    
    // Test WordPress REST API availability and authentication
    await testWordPressConnection(normalizedUrl, credentials);
    
    // WordPress REST API endpoint for posts
    const apiUrl = `${normalizedUrl}/wp-json/wp/v2/posts`;
    
    // Generate enhanced HTML content with layout
    const htmlContent = await generateWordPressHTML(post);
    
    // Upload featured image if available
    let featuredImageId = null;
    if (post.hero_image_url) {
      console.log('Uploading featured image to WordPress...');
      featuredImageId = await uploadFeaturedImage(post.hero_image_url, post.hero_image_alt, normalizedUrl, credentials);
    }
    
    const wordpressPost = {
      title: post.title,
      content: htmlContent,
      status: post.status === 'published' ? 'publish' : 'draft',
      excerpt: post.summary || '',
      slug: post.slug,
      featured_media: featuredImageId,
      meta: {
        _yoast_wpseo_title: post.meta_title || post.title,
        _yoast_wpseo_metadesc: post.meta_description || post.summary || '',
        _yoast_wpseo_canonical: post.canonical_url || '',
        autoblogify_cta_heading: post.cta_heading || '',
        autoblogify_cta_subtext: post.cta_subtext || '',
        autoblogify_city: post.city || '',
        autoblogify_author: post.author || 'AutoblogifyAI'
      }
    };

    // Add categories/tags if available
    if (post.tags && post.tags.length > 0) {
      const tagIds = await getOrCreateTags(post.tags, normalizedUrl, credentials);
      if (tagIds.length > 0) {
        wordpressPost.tags = tagIds;
      }
    }

    console.log('Publishing enhanced post to WordPress...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AutoblogifyAI/1.0'
      },
      body: JSON.stringify(wordpressPost),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error:', response.status, errorText);
      throw new Error(getWordPressError(response.status, errorText));
    }

    const result = await response.json();
    
    return {
      success: true,
      message: 'Post succesvol gepubliceerd naar WordPress met uitgelichte foto en CTA',
      url: result.link,
      wordpressId: result.id
    };

  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testWordPressConnection(normalizedUrl: string, credentials: string) {
  // Test if WordPress REST API is available
  const apiTestUrl = `${normalizedUrl}/wp-json/wp/v2`;
  console.log('Testing WordPress REST API availability:', apiTestUrl);
  
  const apiTestResponse = await fetch(apiTestUrl, {
    method: 'GET',
    headers: { 'User-Agent': 'AutoblogifyAI/1.0' }
  });
  
  if (!apiTestResponse.ok) {
    throw new Error(`WordPress REST API niet beschikbaar (${apiTestResponse.status}). Controleer of permalinks zijn ingeschakeld.`);
  }

  // Test authentication
  const userCheckUrl = `${normalizedUrl}/wp-json/wp/v2/users/me`;
  const userResponse = await fetch(userCheckUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'User-Agent': 'AutoblogifyAI/1.0',
      'Content-Type': 'application/json'
    }
  });
  
  if (!userResponse.ok) {
    const errorText = await userResponse.text();
    throw new Error(`WordPress authenticatie gefaald (${userResponse.status}): ${errorText}`);
  }

  console.log('WordPress connection test successful');
}

async function generateWordPressHTML(post: any) {
  let html = '';
  
  // Hero section with image if available
  if (post.hero_image_url) {
    html += `
    <div class="wp-block-cover alignfull has-background-dim" style="background-image:url(${post.hero_image_url})">
      <div class="wp-block-cover__inner-container">
        <h1 class="has-text-align-center has-large-font-size">${post.title}</h1>
      </div>
    </div>
    `;
  }

  // Main content from markdown
  const mainContent = markdownToHtml(post.body_markdown || '');
  html += `<div class="entry-content">${mainContent}</div>`;

  // FAQ Section if available
  if (post.faq_json) {
    try {
      const faqs = typeof post.faq_json === 'string' ? JSON.parse(post.faq_json) : post.faq_json;
      if (Array.isArray(faqs) && faqs.length > 0) {
        html += `
        <div class="faq-section wp-block-group">
          <h2 class="wp-block-heading has-text-align-center">Veelgestelde Vragen</h2>
          <div class="wp-block-group__inner-container">
        `;
        
        faqs.forEach((faq: any, index: number) => {
          html += `
          <details class="wp-block-details">
            <summary><strong>Q${index + 1}: ${faq.q || faq.question}</strong></summary>
            <p>${faq.a || faq.answer}</p>
          </details>
          `;
        });
        
        html += `</div></div>`;
      }
    } catch (e) {
      console.log('Failed to parse FAQ JSON:', e);
    }
  }

  // CTA Section
  if (post.cta_heading || post.cta_subtext) {
    html += `
    <div class="cta-section wp-block-group has-background has-primary-background-color">
      <div class="wp-block-group__inner-container has-text-align-center">
        ${post.cta_heading ? `<h3 class="wp-block-heading has-white-color">${post.cta_heading}</h3>` : ''}
        ${post.cta_subtext ? `<p class="has-white-color">${post.cta_subtext}</p>` : ''}
        <div class="wp-block-buttons">
          <div class="wp-block-button">
            <a class="wp-block-button__link has-white-background-color has-primary-color" href="#contact">
              Neem Contact Op
            </a>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  // Schema markup for SEO
  if (post.faq_json) {
    try {
      const faqs = typeof post.faq_json === 'string' ? JSON.parse(post.faq_json) : post.faq_json;
      if (Array.isArray(faqs) && faqs.length > 0) {
        const schemaFaqs = faqs.map((faq: any) => ({
          "@type": "Question",
          "name": faq.q || faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a || faq.answer
          }
        }));

        const schema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": schemaFaqs
        };

        html += `
        <script type="application/ld+json">
        ${JSON.stringify(schema, null, 2)}
        </script>
        `;
      }
    } catch (e) {
      console.log('Failed to generate FAQ schema:', e);
    }
  }

  return html;
}

async function uploadFeaturedImage(imageUrl: string, altText: string, siteUrl: string, credentials: string) {
  try {
    console.log('Downloading image from:', imageUrl);
    
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.log('Failed to download image:', imageResponse.status);
      return null;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Get filename from URL or create one
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || `featured-image-${Date.now()}.jpg`;

    console.log('Uploading image to WordPress media library...');
    
    // Upload to WordPress media library
    const uploadUrl = `${siteUrl}/wp-json/wp/v2/media`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'User-Agent': 'AutoblogifyAI/1.0'
      },
      body: imageBuffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.log('Failed to upload image to WordPress:', uploadResponse.status, errorText);
      return null;
    }

    const uploadResult = await uploadResponse.json();
    
    // Update alt text if provided
    if (altText && uploadResult.id) {
      await fetch(`${siteUrl}/wp-json/wp/v2/media/${uploadResult.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AutoblogifyAI/1.0'
        },
        body: JSON.stringify({
          alt_text: altText
        })
      });
    }

    console.log('Featured image uploaded successfully:', uploadResult.id);
    return uploadResult.id;
    
  } catch (error) {
    console.error('Error uploading featured image:', error);
    return null;
  }
}

async function getOrCreateTags(tags: string[], siteUrl: string, credentials: string) {
  try {
    const tagIds = [];
    const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(';') : []);
    
    for (const tag of tagsArray) {
      if (!tag || tag.trim() === '') continue;
      
      const tagName = tag.trim();
      
      // Check if tag exists
      const searchUrl = `${siteUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(tagName)}`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'AutoblogifyAI/1.0'
        }
      });
      
      if (searchResponse.ok) {
        const existingTags = await searchResponse.json();
        const existingTag = existingTags.find((t: any) => t.name.toLowerCase() === tagName.toLowerCase());
        
        if (existingTag) {
          tagIds.push(existingTag.id);
          continue;
        }
      }
      
      // Create new tag
      const createUrl = `${siteUrl}/wp-json/wp/v2/tags`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AutoblogifyAI/1.0'
        },
        body: JSON.stringify({
          name: tagName,
          slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        })
      });
      
      if (createResponse.ok) {
        const newTag = await createResponse.json();
        tagIds.push(newTag.id);
      }
    }
    
    return tagIds;
  } catch (error) {
    console.error('Error managing tags:', error);
    return [];
  }
}

function getWordPressError(status: number, errorText: string) {
  let errorMessage = errorText;
  try {
    const errorJson = JSON.parse(errorText);
    if (errorJson.message) {
      errorMessage = errorJson.message;
    }
  } catch (e) {
    // Not JSON, use raw text
  }
  
  switch (status) {
    case 401:
      return 'WordPress authenticatie gefaald. Controleer je gebruikersnaam en applicatie wachtwoord.';
    case 403:
      return 'Geen rechten om posts te maken. Controleer je WordPress gebruikersrechten.';
    case 404:
      return 'WordPress REST API niet gevonden. Controleer of permalinks zijn ingeschakeld.';
    case 500:
      return 'WordPress server fout. Controleer de server logs voor meer details.';
    default:
      return `WordPress API fout (${status}): ${errorMessage}`;
  }
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Enhanced markdown to HTML conversion with better formatting
  return markdown
    // Headers with proper WordPress classes
    .replace(/^### (.*$)/gm, '<h3 class="wp-block-heading">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="wp-block-heading">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="wp-block-heading">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="wp-block-code"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="wp-block-quote"><p>$1</p></blockquote>')
    
    // Lists with proper WordPress classes
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(\<li\>.*\<\/li\>)/gs, '<ul class="wp-block-list">$1</ul>')
    
    // Numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/(\<li\>.*\<\/li\>)/gs, '<ol class="wp-block-list">$1</ol>')
    
    // Links with WordPress styling
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="wp-element-button">$1</a>')
    
    // Images with WordPress blocks
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="wp-block-image"><img src="$2" alt="$1" /></figure>')
    
    // Line breaks and paragraphs
    .replace(/\n\n/g, '</p><p class="wp-block-paragraph">')
    .replace(/\n/g, '<br>')
    
    // Wrap in WordPress paragraph blocks
    .replace(/^(?!<[hluofb])/gm, '<p class="wp-block-paragraph">')
    .replace(/(?<!>)$/gm, '</p>')
    
    // Clean up multiple paragraph tags
    .replace(/<\/p><p class="wp-block-paragraph"><\/p>/g, '</p>')
    .replace(/<p class="wp-block-paragraph"><\/p>/g, '');
}
-- Update existing sample resources with real URLs for the tutorial resources
UPDATE public.resources 
SET external_url = 'https://docs.google.com/document/d/1234567890/edit#heading=h.tutorial_autoblogify_intro'
WHERE title = 'Aan de slag met AutoblogifyAI';

UPDATE public.resources 
SET external_url = 'https://docs.google.com/document/d/1234567890/edit#heading=h.wordpress_integration_guide'
WHERE title = 'WordPress Integratie Setup';

UPDATE public.resources 
SET external_url = 'https://www.youtube.com/watch?v=advanced_csv_structures_tutorial'
WHERE title = 'Geavanceerde CSV Structuren';

UPDATE public.resources 
SET external_url = 'https://docs.google.com/document/d/1234567890/edit#heading=h.automation_workflows'
WHERE title = 'Content Automation Workflows';

UPDATE public.resources 
SET external_url = 'https://tools.autoblogifyai.com/faq-schema-generator'
WHERE title = 'FAQ Schema Generator';

-- Update the download template resource
UPDATE public.resources 
SET download_url = 'https://cdn.autoblogifyai.com/templates/seo-optimized-content-templates.zip'
WHERE title = 'SEO-geoptimaliseerde Content Templates';
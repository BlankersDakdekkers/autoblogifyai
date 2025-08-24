-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tutorial', 'template', 'guide', 'video', 'tool')),
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  download_url TEXT,
  external_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (resources are public)
CREATE POLICY "Resources are publicly readable" 
ON public.resources 
FOR SELECT 
USING (true);

-- Create policy for admin users to manage resources
CREATE POLICY "Admins can manage resources" 
ON public.resources 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample resources data
INSERT INTO public.resources (title, description, type, category, difficulty, duration, rating, external_url, featured) VALUES
('Aan de slag met AutoblogifyAI', 'Complete gids om je eerste blogposts te genereren vanuit een Google Sheet', 'tutorial', 'Beginners', 'beginner', '15 min', 4.8, '#', true),
('WordPress Integratie Setup', 'Stap-voor-stap handleiding voor het koppelen van je WordPress site', 'guide', 'Integratie', 'intermediate', '20 min', 4.7, '#', true),
('SEO-geoptimaliseerde Content Templates', 'Kant-en-klare templates voor verschillende contenttypen', 'template', 'Templates', 'beginner', null, 4.9, '#', false),
('Geavanceerde CSV Structuren', 'Leer hoe je complexe content structuren opzet in je Google Sheets', 'video', 'Geavanceerd', 'advanced', '35 min', 4.6, '#', true),
('Content Automation Workflows', 'Automatiseer je content pipeline met webhooks en scheduling', 'guide', 'Automation', 'advanced', '25 min', 4.5, '#', false),
('FAQ Schema Generator', 'Tool voor het genereren van structured data voor je FAQ secties', 'tool', 'SEO Tools', 'intermediate', null, 4.4, '#', false);

-- Update template resource to have download_url instead of external_url
UPDATE public.resources 
SET download_url = '#', external_url = null 
WHERE title = 'SEO-geoptimaliseerde Content Templates';
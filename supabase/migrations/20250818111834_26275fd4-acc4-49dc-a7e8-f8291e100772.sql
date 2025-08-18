-- Create blog_posts table for storing generated posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  publish_date DATE NOT NULL,
  summary TEXT,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  hero_image_url TEXT,
  hero_image_alt TEXT,
  body_markdown TEXT,
  faq_json JSONB,
  cta_heading TEXT,
  cta_subtext TEXT,
  tags TEXT[],
  author TEXT,
  city TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blog posts" 
ON public.blog_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create CSV processing jobs table
CREATE TABLE public.csv_processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  csv_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for CSV jobs
ALTER TABLE public.csv_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for CSV jobs
CREATE POLICY "Users can view their own CSV jobs" 
ON public.csv_processing_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CSV jobs" 
ON public.csv_processing_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CSV jobs" 
ON public.csv_processing_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for CSV jobs timestamp updates
CREATE TRIGGER update_csv_jobs_updated_at
BEFORE UPDATE ON public.csv_processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
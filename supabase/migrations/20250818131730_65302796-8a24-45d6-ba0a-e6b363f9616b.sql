-- Create storage bucket for knowledge base files
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-files', 'knowledge-files', false);

-- Create policies for knowledge base file uploads
CREATE POLICY "Users can upload their own knowledge files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own knowledge files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own knowledge files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create knowledge_items table for persistent storage
CREATE TABLE public.knowledge_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'article',
  author TEXT,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'published',
  source_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge items
CREATE POLICY "Users can view their own knowledge items" 
ON public.knowledge_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge items" 
ON public.knowledge_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge items" 
ON public.knowledge_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge items" 
ON public.knowledge_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_knowledge_items_updated_at
BEFORE UPDATE ON public.knowledge_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
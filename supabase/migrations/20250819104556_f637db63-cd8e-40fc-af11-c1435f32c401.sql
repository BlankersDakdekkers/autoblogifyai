-- Create knowledge_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.knowledge_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'article',
  author TEXT,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_items
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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_knowledge_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_knowledge_items_updated_at ON public.knowledge_items;
CREATE TRIGGER update_knowledge_items_updated_at
  BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_items_updated_at();
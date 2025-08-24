-- Create media table for storing media metadata
CREATE TABLE public.media_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  file_size BIGINT NOT NULL,
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own media"
  ON public.media_items FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

CREATE POLICY "Users can insert their own media"
  ON public.media_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
  ON public.media_items FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

CREATE POLICY "Users can delete their own media"
  ON public.media_items FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true);

-- Create storage policies for media bucket
CREATE POLICY "Users can view media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Users can upload their own media files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own media files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own media files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger for updating timestamps
CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
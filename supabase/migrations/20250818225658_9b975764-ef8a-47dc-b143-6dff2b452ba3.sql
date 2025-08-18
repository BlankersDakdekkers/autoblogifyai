-- Controleer en verbeter RLS policies voor blog_posts tabel
-- Service role policy toevoegen voor betere backend operations

-- Verwijder bestaande service role policy en maak nieuwe
DROP POLICY IF EXISTS "Service role can manage all blog posts" ON public.blog_posts;

-- Nieuwe service role policy met expliciete toegang
CREATE POLICY "Service role full access blog posts" 
ON public.blog_posts 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Index toevoegen voor betere performance bij user queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_created 
ON public.blog_posts(user_id, created_at DESC);

-- Index voor status queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_status 
ON public.blog_posts(user_id, status);

-- Enable realtime voor live updates
ALTER TABLE public.blog_posts REPLICA IDENTITY FULL;

-- Voeg tabel toe aan realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
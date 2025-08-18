-- Fix RLS policies for blog_posts table to allow service role insertion
-- Drop existing policies and recreate with proper permissions

DROP POLICY IF EXISTS "Users can create their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view their own blog posts" ON blog_posts;

-- Create new policies that work with service role for CSV processing
CREATE POLICY "Users can view their own blog posts" 
ON blog_posts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blog posts" 
ON blog_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blog posts" 
ON blog_posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blog posts" 
ON blog_posts FOR DELETE 
USING (auth.uid() = user_id);

-- Allow service role to bypass RLS for CSV processing
CREATE POLICY "Service role can manage all blog posts"
ON blog_posts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
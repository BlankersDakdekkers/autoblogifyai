-- First, drop all existing policies for google_integrations to rebuild them properly
DROP POLICY IF EXISTS "Users can view their own Google integrations" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can insert their own Google integrations" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can update their own Google integrations" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can delete their own Google integrations" ON public.google_integrations;
DROP POLICY IF EXISTS "Service role can manage Google integrations" ON public.google_integrations;
DROP POLICY IF EXISTS "Deny anonymous access to google integrations" ON public.google_integrations;

-- Create new, more secure RLS policies
-- Policy 1: Authenticated users can view only their own Google integrations
CREATE POLICY "Authenticated users view own google integrations"
ON public.google_integrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can insert only their own Google integrations
CREATE POLICY "Authenticated users insert own google integrations"
ON public.google_integrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can update only their own Google integrations
CREATE POLICY "Authenticated users update own google integrations"
ON public.google_integrations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 4: Authenticated users can delete only their own Google integrations
CREATE POLICY "Authenticated users delete own google integrations"
ON public.google_integrations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 5: Service role has full access for backend operations
CREATE POLICY "Service role full access google integrations"
ON public.google_integrations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 6: Explicitly deny all access to anonymous users
CREATE POLICY "Deny all anonymous access google integrations"
ON public.google_integrations
FOR ALL
TO anon
USING (false)
WITH CHECK (false);
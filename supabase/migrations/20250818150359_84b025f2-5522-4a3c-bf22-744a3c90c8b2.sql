-- Add explicit deny policy for anonymous access to subscribers table
-- This prevents any unauthenticated users from accessing sensitive customer data
CREATE POLICY "Deny anonymous access to subscribers" ON public.subscribers
FOR ALL
TO anon
USING (false);

-- Add explicit deny policy for anonymous access to google_integrations table  
-- This prevents any unauthenticated users from accessing OAuth integration data
CREATE POLICY "Deny anonymous access to google integrations" ON public.google_integrations
FOR ALL
TO anon
USING (false);
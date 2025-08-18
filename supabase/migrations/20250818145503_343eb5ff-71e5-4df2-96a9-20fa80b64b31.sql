-- Fix critical security issues by recreating RLS policies properly

-- 1. Completely reset Google integrations policies
DROP POLICY IF EXISTS "Users can view their own Google integrations only" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can insert their own Google integrations only" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can update their own Google integrations only" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can delete their own Google integrations only" ON public.google_integrations;

-- Recreate secure Google integration policies
CREATE POLICY "Secure Google token access" 
ON public.google_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Secure Google token insert" 
ON public.google_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Secure Google token update" 
ON public.google_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Secure Google token delete" 
ON public.google_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Fix subscribers table - make service role specific
DROP POLICY IF EXISTS "Users can view only their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Only service role can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Only service role can update subscriptions" ON public.subscribers;

-- Create strict subscriber policies
CREATE POLICY "Users view own subscription only" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role subscription management" 
ON public.subscribers 
FOR ALL
USING (auth.role() = 'service_role');
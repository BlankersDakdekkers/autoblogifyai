-- Fix critical security issues with RLS policies

-- 1. Fix Google OAuth tokens exposure
-- Drop overly permissive policies and create secure ones
DROP POLICY IF EXISTS "Users can view their own Google integrations" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can insert their own Google integrations" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can update their own Google integrations" ON public.google_integrations;
DROP POLICY IF EXISTS "Users can delete their own Google integrations" ON public.google_integrations;

-- Create secure policies for Google integrations (only owner access)
CREATE POLICY "Users can view their own Google integrations only" 
ON public.google_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google integrations only" 
ON public.google_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google integrations only" 
ON public.google_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google integrations only" 
ON public.google_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Fix subscribers table - remove overly permissive policies
DROP POLICY IF EXISTS "Edge functions can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Edge functions can update subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure policies for subscribers (strict user ownership)
CREATE POLICY "Users can view only their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only service role can insert subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- 3. Ensure email privacy - verify that profiles table doesn't expose emails unnecessarily
-- Update profiles policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);
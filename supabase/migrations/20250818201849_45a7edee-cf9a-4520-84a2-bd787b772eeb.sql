-- First, drop all existing policies for subscribers table to rebuild them securely
DROP POLICY IF EXISTS "Users view own subscription only" ON public.subscribers;
DROP POLICY IF EXISTS "Deny anonymous access to subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Service role subscription management" ON public.subscribers;

-- Create new, more secure RLS policies for subscribers table
-- Policy 1: Only authenticated users can view their own subscription data
CREATE POLICY "Authenticated users view own subscription"
ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Only authenticated users can update their own subscription data
CREATE POLICY "Authenticated users update own subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Service role has full access for backend operations (Stripe webhooks, etc.)
CREATE POLICY "Service role manages all subscriptions"
ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 4: Explicitly deny all access to anonymous users
CREATE POLICY "Block all anonymous access to subscribers"
ON public.subscribers
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Policy 5: Only service role can insert new subscription records (backend operations only)
CREATE POLICY "Service role only inserts subscriptions"
ON public.subscribers
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy 6: Only service role can delete subscription records (for data cleanup)
CREATE POLICY "Service role only deletes subscriptions"
ON public.subscribers
FOR DELETE
TO service_role
USING (true);

-- Ensure the user_id column is NOT NULL to prevent orphaned records
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;
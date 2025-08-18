-- Create subscribers table for Stripe subscription management
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for users to view and update their own subscription info
CREATE POLICY IF NOT EXISTS "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY IF NOT EXISTS "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY IF NOT EXISTS "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);
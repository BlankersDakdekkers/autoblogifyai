-- Create credits table to track user credits
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 5,
  total_credits_used INTEGER NOT NULL DEFAULT 0,
  last_credit_update TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all credits" 
ON public.user_credits 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Function to automatically create credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert 5 free trial credits for new user
  INSERT INTO public.user_credits (user_id, credits_remaining)
  VALUES (NEW.id, 5);
  
  RETURN NEW;
END;
$$;

-- Trigger to create credits when new user signs up
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to deduct credits safely
CREATE OR REPLACE FUNCTION public.deduct_credit(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits with row lock
  SELECT credits_remaining INTO current_credits
  FROM public.user_credits
  WHERE user_id = user_uuid
  FOR UPDATE;
  
  -- Check if user has credits
  IF current_credits IS NULL OR current_credits <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credit
  UPDATE public.user_credits
  SET 
    credits_remaining = credits_remaining - 1,
    total_credits_used = total_credits_used + 1,
    last_credit_update = now(),
    updated_at = now()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$;

-- Function to add credits (for subscriptions)
CREATE OR REPLACE FUNCTION public.add_credits(user_uuid UUID, credit_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits_remaining)
  VALUES (user_uuid, credit_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    credits_remaining = user_credits.credits_remaining + credit_amount,
    last_credit_update = now(),
    updated_at = now();
END;
$$;
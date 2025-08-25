-- Fix search_path security issues for the functions we just created
CREATE OR REPLACE FUNCTION public.get_credit_limit_for_tier(tier_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE LOWER(tier_name)
    WHEN 'starter' THEN RETURN 500;
    WHEN 'professional' THEN RETURN 1500;
    WHEN 'enterprise' THEN RETURN 5000;
    ELSE RETURN 5; -- Free tier default
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscriber_record RECORD;
BEGIN
  -- Loop through all active subscribers who need credit refresh
  FOR subscriber_record IN 
    SELECT user_id, subscription_tier, monthly_credit_limit
    FROM public.subscribers 
    WHERE subscribed = true 
    AND (credits_reset_date IS NULL OR credits_reset_date < CURRENT_DATE)
  LOOP
    -- Reset credits to monthly limit
    INSERT INTO public.user_credits (user_id, credits_remaining, last_credit_update)
    VALUES (subscriber_record.user_id, subscriber_record.monthly_credit_limit, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      credits_remaining = subscriber_record.monthly_credit_limit,
      last_credit_update = NOW(),
      updated_at = NOW();
      
    -- Update reset date
    UPDATE public.subscribers 
    SET credits_reset_date = CURRENT_DATE + INTERVAL '1 month'
    WHERE user_id = subscriber_record.user_id;
  END LOOP;
  
  RAISE NOTICE 'Monthly credits refreshed for active subscribers';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_subscription_tier(
  p_user_id UUID,
  p_new_tier TEXT,
  p_stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_credit_limit INTEGER;
BEGIN
  -- Get credit limit for new tier
  new_credit_limit := get_credit_limit_for_tier(p_new_tier);
  
  -- Update subscriber record
  UPDATE public.subscribers 
  SET 
    subscription_tier = p_new_tier,
    monthly_credit_limit = new_credit_limit,
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Update user credits to new limit (immediate upgrade benefit)
  INSERT INTO public.user_credits (user_id, credits_remaining, last_credit_update)
  VALUES (p_user_id, new_credit_limit, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    credits_remaining = GREATEST(user_credits.credits_remaining, new_credit_limit),
    last_credit_update = NOW(),
    updated_at = NOW();
    
  RAISE NOTICE 'Subscription updated for user % to tier % with % credits', p_user_id, p_new_tier, new_credit_limit;
END;
$$;
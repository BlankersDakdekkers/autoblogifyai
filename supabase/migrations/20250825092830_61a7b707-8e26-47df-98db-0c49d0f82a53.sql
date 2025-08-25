-- Add test credits to admin account for testing purposes
UPDATE public.user_credits 
SET 
  credits_remaining = credits_remaining + 50,
  last_credit_update = now(),
  updated_at = now()
WHERE user_id = '23d16b01-f7f3-41dd-8b77-f44f21059931';

-- If no record exists, insert one with test credits
INSERT INTO public.user_credits (user_id, credits_remaining, total_credits_used)
VALUES ('23d16b01-f7f3-41dd-8b77-f44f21059931', 50, 0)
ON CONFLICT (user_id) 
DO UPDATE SET 
  credits_remaining = user_credits.credits_remaining + 50,
  last_credit_update = now(),
  updated_at = now();
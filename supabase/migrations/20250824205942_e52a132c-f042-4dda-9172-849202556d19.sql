-- Update profile to complete onboarding
UPDATE profiles 
SET onboarding_completed = true, updated_at = now()
WHERE user_id = '23d16b01-f7f3-41dd-8b77-f44f21059931';
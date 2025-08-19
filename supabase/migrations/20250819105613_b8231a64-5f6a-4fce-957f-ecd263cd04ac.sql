-- Update user_id in demo knowledge items to match the current user
UPDATE public.knowledge_items 
SET user_id = '23d16b01-f7f3-41dd-8b77-f44f21059931'
WHERE user_id = '00000000-0000-0000-0000-000000000000';
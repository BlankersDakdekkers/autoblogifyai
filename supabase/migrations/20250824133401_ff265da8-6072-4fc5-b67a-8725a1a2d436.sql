-- Disable auto-admin functionality by updating the trigger function
-- Remove the automatic admin assignment for new users
DROP FUNCTION IF EXISTS public.auto_make_first_admin() CASCADE;

-- Update the handle_new_user function to not automatically assign admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Insert 5 free trial credits for new user
  INSERT INTO public.user_credits (user_id, credits_remaining)
  VALUES (NEW.id, 5);
  
  -- Assign default user role ONLY (no automatic admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;
-- Create a function to automatically make the first user admin if no admin exists
CREATE OR REPLACE FUNCTION public.auto_make_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if any admin exists
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- No admin exists, make this user admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the automatic admin creation
    INSERT INTO public.role_audit (user_id, new_role, changed_by)
    VALUES (auth.uid(), 'admin', auth.uid());
  END IF;
END;
$$;
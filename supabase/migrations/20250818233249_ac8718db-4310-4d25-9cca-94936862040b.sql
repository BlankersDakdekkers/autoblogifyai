-- Function to make the current user an admin (for initial setup)
CREATE OR REPLACE FUNCTION public.make_self_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Insert or update user role to admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role)
  DO NOTHING;
  
  -- Remove any existing non-admin roles for this user to ensure clean admin status
  DELETE FROM public.user_roles 
  WHERE user_id = auth.uid() AND role != 'admin';
  
  -- Log the role change
  INSERT INTO public.role_audit (user_id, new_role, changed_by)
  VALUES (auth.uid(), 'admin', auth.uid());
END;
$$;

-- Function to check if any admin exists in the system
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  );
$$;

-- RLS policy to allow users to make themselves admin ONLY if no admin exists yet
CREATE POLICY "Allow self-admin setup if no admin exists"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'admin' AND 
  user_id = auth.uid() AND 
  NOT public.admin_exists()
);
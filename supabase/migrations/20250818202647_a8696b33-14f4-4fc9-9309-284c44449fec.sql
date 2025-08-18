-- Fix Function Search Path Mutable security issue by updating all functions to set search_path

-- 1. Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public';

-- 2. Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public', 'auth';

-- 3. Update log_role_change function
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit (user_id, new_role, changed_by)
    VALUES (NEW.user_id, NEW.role, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.role_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, OLD.role, NEW.role, auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public';

-- 4. Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$ LANGUAGE sql 
STABLE 
SECURITY DEFINER 
SET search_path TO 'public';

-- 5. Update log_google_integration_access function
CREATE OR REPLACE FUNCTION public.log_google_integration_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log service role operations for audit trail
  IF auth.role() = 'service_role' THEN
    INSERT INTO public.role_audit (user_id, old_role, new_role, changed_by)
    VALUES (
      COALESCE(NEW.user_id, OLD.user_id),
      'google_integration'::app_role,
      'service_access'::app_role,
      '00000000-0000-0000-0000-000000000000'::uuid
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public';
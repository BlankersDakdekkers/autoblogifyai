-- Fix de log_role_change functie om om te gaan met system-triggered changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Voor system operations (zoals nieuwe gebruiker aanmaken), gebruik een speciale system user ID
  DECLARE
    audit_changed_by UUID := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  BEGIN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.role_audit (user_id, new_role, changed_by)
      VALUES (NEW.user_id, NEW.role, audit_changed_by);
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      INSERT INTO public.role_audit (user_id, old_role, new_role, changed_by)
      VALUES (NEW.user_id, OLD.role, NEW.role, audit_changed_by);
      RETURN NEW;
    END IF;
    RETURN NULL;
  END;
END;
$$;
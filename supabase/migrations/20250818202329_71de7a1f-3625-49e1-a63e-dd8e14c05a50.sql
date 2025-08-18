-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role full access google integrations" ON public.google_integrations;

-- Create more restrictive service role policies for specific operations
-- Policy 1: Service role can read Google integrations (for token validation/refresh)
CREATE POLICY "Service role read google integrations"
ON public.google_integrations
FOR SELECT
TO service_role
USING (
  -- Only allow reading if the integration has a valid user_id and is not expired
  user_id IS NOT NULL 
  AND (token_expires_at IS NULL OR token_expires_at > now())
);

-- Policy 2: Service role can insert new Google integrations (during OAuth flow)
CREATE POLICY "Service role insert google integrations"
ON public.google_integrations
FOR INSERT
TO service_role
WITH CHECK (
  -- Ensure required fields are present and valid
  user_id IS NOT NULL 
  AND google_email IS NOT NULL 
  AND encrypted_tokens IS NOT NULL
  AND integration_status IN ('connected', 'disconnected')
);

-- Policy 3: Service role can update Google integrations (for token refresh, status changes)
CREATE POLICY "Service role update google integrations"
ON public.google_integrations
FOR UPDATE
TO service_role
USING (
  -- Only update existing valid integrations
  user_id IS NOT NULL 
  AND google_email IS NOT NULL
)
WITH CHECK (
  -- Ensure updated data maintains integrity
  user_id IS NOT NULL 
  AND google_email IS NOT NULL
  AND integration_status IN ('connected', 'disconnected', 'expired', 'error')
);

-- Policy 4: Service role can delete Google integrations (for cleanup/disconnection)
CREATE POLICY "Service role delete google integrations"
ON public.google_integrations
FOR DELETE
TO service_role
USING (
  -- Only allow deletion of integrations that are disconnected or expired
  user_id IS NOT NULL 
  AND integration_status IN ('disconnected', 'expired', 'error')
);

-- Add additional security: Create a function to log service role access
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
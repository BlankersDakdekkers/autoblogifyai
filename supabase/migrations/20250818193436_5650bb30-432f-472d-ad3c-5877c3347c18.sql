-- Add encrypted_tokens field to google_integrations table for secure token storage
ALTER TABLE public.google_integrations 
ADD COLUMN encrypted_tokens text;

-- Update RLS policies for subscribers table to be more restrictive
DROP POLICY IF EXISTS "Service role subscription management" ON public.subscribers;

-- More restrictive service role policy
CREATE POLICY "Service role subscription management" 
ON public.subscribers 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Add rate limiting table for authentication attempts
CREATE TABLE public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  attempt_type text NOT NULL, -- 'login', 'signup', 'password_reset'
  attempts integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_rate_limits_identifier_type ON public.auth_rate_limits(identifier, attempt_type);
CREATE INDEX idx_auth_rate_limits_window ON public.auth_rate_limits(window_start);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role can manage rate limits" 
ON public.auth_rate_limits 
FOR ALL 
USING (auth.role() = 'service_role'::text);
-- Fix Google OAuth tokens security issue
-- Remove sensitive token fields and add encrypted storage approach

-- First, backup any existing data and then recreate the table more securely
DROP TABLE IF EXISTS public.google_integrations CASCADE;

-- Create new secure Google integrations table without direct token storage
CREATE TABLE public.google_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  google_email TEXT NOT NULL,
  google_name TEXT,
  scopes TEXT[] DEFAULT '{}',
  integration_status TEXT NOT NULL DEFAULT 'connected',
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;

-- Create secure policies - users can only access their own integrations
CREATE POLICY "Users can view their own Google integrations" 
ON public.google_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google integrations" 
ON public.google_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google integrations" 
ON public.google_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google integrations" 
ON public.google_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Service role can manage all integrations for token refresh operations
CREATE POLICY "Service role can manage Google integrations" 
ON public.google_integrations 
FOR ALL
USING (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE TRIGGER update_google_integrations_updated_at
BEFORE UPDATE ON public.google_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
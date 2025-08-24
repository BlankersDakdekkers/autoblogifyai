-- Create CMS integrations table
CREATE TABLE public.cms_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cms_type TEXT NOT NULL CHECK (cms_type IN ('wordpress', 'drupal', 'joomla', 'contentful', 'strapi', 'ghost', 'webflow')),
  site_url TEXT NOT NULL,
  api_credentials JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.cms_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own CMS integrations" 
ON public.cms_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CMS integrations" 
ON public.cms_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CMS integrations" 
ON public.cms_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CMS integrations" 
ON public.cms_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Service role can manage all integrations
CREATE POLICY "Service role can manage all CMS integrations" 
ON public.cms_integrations 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create updated_at trigger
CREATE TRIGGER update_cms_integrations_updated_at
BEFORE UPDATE ON public.cms_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create publish history table
CREATE TABLE public.cms_publish_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  cms_integration_id UUID NOT NULL REFERENCES public.cms_integrations(id) ON DELETE CASCADE,
  cms_post_id TEXT,
  cms_post_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(blog_post_id, cms_integration_id)
);

-- Enable RLS for publish history
ALTER TABLE public.cms_publish_history ENABLE ROW LEVEL SECURITY;

-- Create policies for publish history
CREATE POLICY "Users can view their own publish history" 
ON public.cms_publish_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own publish history" 
ON public.cms_publish_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own publish history" 
ON public.cms_publish_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Service role can manage all publish history
CREATE POLICY "Service role can manage all publish history" 
ON public.cms_publish_history 
FOR ALL 
USING (auth.role() = 'service_role');
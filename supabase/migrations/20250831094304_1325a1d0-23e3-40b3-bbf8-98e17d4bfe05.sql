-- Create content_plans table for content planning
CREATE TABLE public.content_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'blog_post',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  planned_date DATE NOT NULL,
  due_date DATE,
  platform TEXT,
  category TEXT,
  tags TEXT[],
  assigned_to TEXT,
  estimated_hours NUMERIC(4,2),
  actual_hours NUMERIC(4,2),
  notes TEXT,
  related_csv_job_id UUID,
  related_blog_post_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own content plans" 
ON public.content_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content plans" 
ON public.content_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content plans" 
ON public.content_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content plans" 
ON public.content_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access content plans" 
ON public.content_plans 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_content_plans_user_id ON public.content_plans(user_id);
CREATE INDEX idx_content_plans_planned_date ON public.content_plans(planned_date);
CREATE INDEX idx_content_plans_status ON public.content_plans(status);
CREATE INDEX idx_content_plans_user_date ON public.content_plans(user_id, planned_date);

-- Create updated_at trigger
CREATE TRIGGER update_content_plans_updated_at
  BEFORE UPDATE ON public.content_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create content_plan_templates table for reusable templates
CREATE TABLE public.content_plan_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'blog_post',
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for templates
ALTER TABLE public.content_plan_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for templates
CREATE POLICY "Users can view their own templates and public ones" 
ON public.content_plan_templates 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own templates" 
ON public.content_plan_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.content_plan_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.content_plan_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for templates
CREATE INDEX idx_content_plan_templates_user_id ON public.content_plan_templates(user_id);
CREATE INDEX idx_content_plan_templates_public ON public.content_plan_templates(is_public) WHERE is_public = true;

-- Create updated_at trigger for templates
CREATE TRIGGER update_content_plan_templates_updated_at
  BEFORE UPDATE ON public.content_plan_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
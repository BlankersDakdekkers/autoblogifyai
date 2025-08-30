-- CSV Processor Pro: Enhanced backend infrastructure

-- 1. Add processing analytics and metrics
CREATE TABLE IF NOT EXISTS public.csv_processing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.csv_processing_jobs(id) ON DELETE CASCADE,
  processing_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  total_processing_time_seconds INTEGER,
  rows_processed INTEGER DEFAULT 0,
  rows_failed INTEGER DEFAULT 0,
  ai_calls_made INTEGER DEFAULT 0,
  credits_consumed INTEGER DEFAULT 0,
  cms_publications_attempted INTEGER DEFAULT 0,
  cms_publications_successful INTEGER DEFAULT 0,
  error_types JSONB DEFAULT '[]'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for analytics
ALTER TABLE public.csv_processing_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own processing analytics"
  ON public.csv_processing_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all processing analytics"
  ON public.csv_processing_analytics FOR ALL
  USING (auth.role() = 'service_role');

-- 2. Enhanced CSV jobs table with better status tracking
ALTER TABLE public.csv_processing_jobs 
ADD COLUMN IF NOT EXISTS success_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_time_seconds INTEGER,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '{}'::jsonb;

-- 3. Add processing queue for better job management
CREATE TABLE IF NOT EXISTS public.csv_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.csv_processing_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  priority INTEGER NOT NULL DEFAULT 5,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  worker_id TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  processing_options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for processing queue
ALTER TABLE public.csv_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue items"
  ON public.csv_processing_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all queue items"
  ON public.csv_processing_queue FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Add processing rate limits per user
CREATE TABLE IF NOT EXISTS public.csv_processing_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  max_jobs_per_hour INTEGER NOT NULL DEFAULT 10,
  max_rows_per_job INTEGER NOT NULL DEFAULT 1000,
  max_concurrent_jobs INTEGER NOT NULL DEFAULT 2,
  current_hour_jobs INTEGER DEFAULT 0,
  current_hour_start TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('hour', now()),
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for processing limits
ALTER TABLE public.csv_processing_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own processing limits"
  ON public.csv_processing_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all processing limits"
  ON public.csv_processing_limits FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Function to initialize processing limits for new users
CREATE OR REPLACE FUNCTION public.initialize_processing_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is premium based on subscription
  DECLARE
    is_premium_user BOOLEAN := FALSE;
  BEGIN
    SELECT CASE 
      WHEN s.subscription_tier IN ('professional', 'enterprise') THEN TRUE 
      ELSE FALSE 
    END INTO is_premium_user
    FROM public.subscribers s 
    WHERE s.user_id = NEW.user_id AND s.subscribed = true;
    
    INSERT INTO public.csv_processing_limits (
      user_id, 
      max_jobs_per_hour,
      max_rows_per_job,
      max_concurrent_jobs,
      is_premium
    ) VALUES (
      NEW.user_id,
      CASE WHEN is_premium_user THEN 50 ELSE 10 END,
      CASE WHEN is_premium_user THEN 5000 ELSE 1000 END,
      CASE WHEN is_premium_user THEN 5 ELSE 2 END,
      is_premium_user
    )
    ON CONFLICT (user_id) DO UPDATE SET
      is_premium = EXCLUDED.is_premium,
      max_jobs_per_hour = EXCLUDED.max_jobs_per_hour,
      max_rows_per_job = EXCLUDED.max_rows_per_job,
      max_concurrent_jobs = EXCLUDED.max_concurrent_jobs,
      updated_at = now();
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-initialize limits when profiles are created
CREATE TRIGGER initialize_processing_limits_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_processing_limits();

-- 6. Function to check processing rate limits
CREATE OR REPLACE FUNCTION public.check_processing_rate_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  limits_record RECORD;
  current_jobs INTEGER;
BEGIN
  -- Get user limits
  SELECT * INTO limits_record
  FROM public.csv_processing_limits
  WHERE user_id = user_uuid;
  
  -- If no limits found, create default ones
  IF NOT FOUND THEN
    INSERT INTO public.csv_processing_limits (user_id) VALUES (user_uuid);
    RETURN TRUE;
  END IF;
  
  -- Reset counter if we're in a new hour
  IF limits_record.current_hour_start <= now() - INTERVAL '1 hour' THEN
    UPDATE public.csv_processing_limits
    SET current_hour_jobs = 0,
        current_hour_start = date_trunc('hour', now())
    WHERE user_id = user_uuid;
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  RETURN limits_record.current_hour_jobs < limits_record.max_jobs_per_hour;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to increment rate limit counter
CREATE OR REPLACE FUNCTION public.increment_processing_counter(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.csv_processing_limits (user_id, current_hour_jobs)
  VALUES (user_uuid, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    current_hour_jobs = csv_processing_limits.current_hour_jobs + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enhanced blog_posts table for better CSV integration
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS csv_job_id UUID REFERENCES public.csv_processing_jobs(id),
ADD COLUMN IF NOT EXISTS csv_row_index INTEGER,
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS ai_enhanced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cms_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 9. Function to get processing statistics
CREATE OR REPLACE FUNCTION public.get_processing_stats(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  total_jobs BIGINT,
  successful_jobs BIGINT,
  failed_jobs BIGINT,
  total_rows_processed BIGINT,
  avg_processing_time NUMERIC,
  success_rate NUMERIC,
  credits_used BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE j.status = 'completed') as successful_jobs,
    COUNT(*) FILTER (WHERE j.status = 'failed') as failed_jobs,
    COALESCE(SUM(j.processed_rows), 0) as total_rows_processed,
    ROUND(AVG(j.processing_time_seconds), 2) as avg_processing_time,
    ROUND(
      (COUNT(*) FILTER (WHERE j.status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
      2
    ) as success_rate,
    COALESCE(SUM(a.credits_consumed), 0) as credits_used
  FROM public.csv_processing_jobs j
  LEFT JOIN public.csv_processing_analytics a ON j.id = a.job_id
  WHERE j.user_id = user_uuid 
    AND j.created_at >= now() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_csv_jobs_user_status ON public.csv_processing_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_csv_jobs_created_at ON public.csv_processing_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_queue_status_priority ON public.csv_processing_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_csv_job ON public.blog_posts(csv_job_id) WHERE csv_job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_processing_analytics_user_job ON public.csv_processing_analytics(user_id, job_id);

-- 11. Add trigger to update timestamps
CREATE TRIGGER update_csv_processing_queue_updated_at
  BEFORE UPDATE ON public.csv_processing_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_csv_processing_limits_updated_at
  BEFORE UPDATE ON public.csv_processing_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Add missing database functions for CSV Processor Pro

-- Function to check processing rate limits
CREATE OR REPLACE FUNCTION public.check_processing_rate_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  limits_record RECORD;
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
        current_hour_start = date_trunc('hour', now()),
        updated_at = now()
    WHERE user_id = user_uuid;
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  RETURN limits_record.current_hour_jobs < limits_record.max_jobs_per_hour;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to increment processing counter
CREATE OR REPLACE FUNCTION public.increment_processing_counter(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.csv_processing_limits (user_id, current_hour_jobs)
  VALUES (user_uuid, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    current_hour_jobs = csv_processing_limits.current_hour_jobs + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get processing statistics
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
    COALESCE(SUM(CASE WHEN a.job_id IS NOT NULL THEN a.credits_consumed ELSE 1 END), 0) as credits_used
  FROM public.csv_processing_jobs j
  LEFT JOIN public.csv_processing_analytics a ON j.id = a.job_id
  WHERE j.user_id = user_uuid 
    AND j.created_at >= now() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get queue statistics
CREATE OR REPLACE FUNCTION public.get_queue_stats(time_range_hours INTEGER DEFAULT 24)
RETURNS TABLE(status TEXT, count BIGINT, avg_processing_time_minutes NUMERIC)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qj.status,
    COUNT(*) as count,
    ROUND(
      CASE 
        WHEN qj.status IN ('completed', 'failed') THEN
          AVG(EXTRACT(EPOCH FROM (qj.completed_at - qj.started_at)) / 60)
        ELSE NULL
      END,
      2
    ) as avg_processing_time_minutes
  FROM public.csv_processing_queue qj
  WHERE qj.created_at >= (now() - (time_range_hours || ' hours')::INTERVAL)
  GROUP BY qj.status
  ORDER BY qj.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to initialize processing limits for new users
CREATE OR REPLACE FUNCTION public.initialize_processing_limits()
RETURNS TRIGGER AS $$
DECLARE
  is_premium_user BOOLEAN := FALSE;
BEGIN
  -- Check if user is premium based on subscription
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'initialize_processing_limits_trigger'
  ) THEN
    CREATE TRIGGER initialize_processing_limits_trigger
      AFTER INSERT ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION initialize_processing_limits();
  END IF;
END $$;

-- Function to cleanup old analytics data
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete analytics older than specified days
  DELETE FROM public.csv_processing_analytics 
  WHERE processing_started_at < now() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also cleanup old health logs
  DELETE FROM public.system_health_logs 
  WHERE created_at < now() - (days_to_keep || ' days')::INTERVAL;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get user processing limits
CREATE OR REPLACE FUNCTION public.get_user_processing_limits(user_uuid UUID)
RETURNS TABLE(
  max_jobs_per_hour INTEGER,
  max_rows_per_job INTEGER,
  max_concurrent_jobs INTEGER,
  current_hour_jobs INTEGER,
  is_premium BOOLEAN,
  jobs_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.max_jobs_per_hour,
    l.max_rows_per_job,
    l.max_concurrent_jobs,
    l.current_hour_jobs,
    l.is_premium,
    GREATEST(l.max_jobs_per_hour - l.current_hour_jobs, 0) as jobs_remaining
  FROM public.csv_processing_limits l
  WHERE l.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
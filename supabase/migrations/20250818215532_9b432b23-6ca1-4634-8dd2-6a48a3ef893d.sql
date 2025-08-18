-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_queue_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_queue_stats(
  time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  status TEXT,
  count BIGINT,
  avg_processing_time_minutes NUMERIC
) AS $$
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
  FROM public.queue_jobs qj
  WHERE qj.created_at >= (now() - (time_range_hours || ' hours')::INTERVAL)
  GROUP BY qj.status
  ORDER BY qj.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
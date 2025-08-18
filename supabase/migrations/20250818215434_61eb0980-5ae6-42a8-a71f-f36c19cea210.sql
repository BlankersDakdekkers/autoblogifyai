-- Create system health logs table
CREATE TABLE public.system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'down')),
  checks JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create queue jobs table
CREATE TABLE public.queue_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('csv_processing', 'content_generation', 'image_generation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  data JSONB NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for system_health_logs (admin only for reads, service role for writes)
CREATE POLICY "Admin can view health logs" ON public.system_health_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Service role can insert health logs" ON public.system_health_logs
FOR INSERT
WITH CHECK (true);

-- Create policies for queue_jobs
CREATE POLICY "Users can view their own queue jobs" ON public.queue_jobs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own queue jobs" ON public.queue_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all queue jobs" ON public.queue_jobs
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_system_health_logs_timestamp ON public.system_health_logs(timestamp DESC);
CREATE INDEX idx_system_health_logs_status ON public.system_health_logs(overall_status);

CREATE INDEX idx_queue_jobs_status ON public.queue_jobs(status);
CREATE INDEX idx_queue_jobs_user_id ON public.queue_jobs(user_id);
CREATE INDEX idx_queue_jobs_type ON public.queue_jobs(type);
CREATE INDEX idx_queue_jobs_priority_created ON public.queue_jobs(priority DESC, created_at ASC);
CREATE INDEX idx_queue_jobs_created_at ON public.queue_jobs(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_queue_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_queue_jobs_updated_at
  BEFORE UPDATE ON public.queue_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_queue_jobs_updated_at();

-- Create function for queue job statistics
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
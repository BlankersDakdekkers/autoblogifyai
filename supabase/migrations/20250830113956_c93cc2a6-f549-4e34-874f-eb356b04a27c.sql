-- CSV Processor Pro: Fix existing infrastructure and add missing components

-- 2. Enhanced CSV jobs table with better status tracking (only add missing columns)
DO $$ 
BEGIN
    -- Add columns only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_processing_jobs' AND column_name = 'success_count') THEN
        ALTER TABLE public.csv_processing_jobs ADD COLUMN success_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_processing_jobs' AND column_name = 'error_count') THEN
        ALTER TABLE public.csv_processing_jobs ADD COLUMN error_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_processing_jobs' AND column_name = 'processing_time_seconds') THEN
        ALTER TABLE public.csv_processing_jobs ADD COLUMN processing_time_seconds INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_processing_jobs' AND column_name = 'retry_count') THEN
        ALTER TABLE public.csv_processing_jobs ADD COLUMN retry_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_processing_jobs' AND column_name = 'max_retries') THEN
        ALTER TABLE public.csv_processing_jobs ADD COLUMN max_retries INTEGER DEFAULT 3;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_processing_jobs' AND column_name = 'priority') THEN
        ALTER TABLE public.csv_processing_jobs ADD COLUMN priority INTEGER DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_processing_jobs' AND column_name = 'scheduled_at') THEN
        ALTER TABLE public.csv_processing_jobs ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_processing_jobs' AND column_name = 'options') THEN
        ALTER TABLE public.csv_processing_jobs ADD COLUMN options JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. Add processing queue for better job management (only create if not exists)
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

-- Add RLS for processing queue (only if table was created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'csv_processing_queue' 
    AND policyname = 'Users can view their own queue items'
  ) THEN
    ALTER TABLE public.csv_processing_queue ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own queue items"
      ON public.csv_processing_queue FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Service role can manage all queue items"
      ON public.csv_processing_queue FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- 4. Add processing rate limits per user (only create if not exists)
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

-- Add RLS for processing limits (only if table was created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'csv_processing_limits' 
    AND policyname = 'Users can view their own processing limits'
  ) THEN
    ALTER TABLE public.csv_processing_limits ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own processing limits"
      ON public.csv_processing_limits FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Service role can manage all processing limits"
      ON public.csv_processing_limits FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- 8. Enhanced blog_posts table for better CSV integration (only add missing columns)
DO $$ 
BEGIN
    -- Add columns only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'csv_job_id') THEN
        ALTER TABLE public.blog_posts ADD COLUMN csv_job_id UUID REFERENCES public.csv_processing_jobs(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'csv_row_index') THEN
        ALTER TABLE public.blog_posts ADD COLUMN csv_row_index INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'processing_status') THEN
        ALTER TABLE public.blog_posts ADD COLUMN processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'ai_enhanced') THEN
        ALTER TABLE public.blog_posts ADD COLUMN ai_enhanced BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'cms_published') THEN
        ALTER TABLE public.blog_posts ADD COLUMN cms_published BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'error_message') THEN
        ALTER TABLE public.blog_posts ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- 10. Add indexes for better performance (only if not exists)
CREATE INDEX IF NOT EXISTS idx_csv_jobs_user_status ON public.csv_processing_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_csv_jobs_created_at ON public.csv_processing_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_queue_status_priority ON public.csv_processing_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_csv_job ON public.blog_posts(csv_job_id) WHERE csv_job_id IS NOT NULL;

-- 11. Add triggers for timestamp updates (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_csv_processing_queue_updated_at'
  ) THEN
    CREATE TRIGGER update_csv_processing_queue_updated_at
      BEFORE UPDATE ON public.csv_processing_queue
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_csv_processing_limits_updated_at'
  ) THEN
    CREATE TRIGGER update_csv_processing_limits_updated_at
      BEFORE UPDATE ON public.csv_processing_limits
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
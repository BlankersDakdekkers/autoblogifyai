-- Create analytics table for user-specific analytics data
CREATE TABLE public.user_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL,
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  bounce_rate numeric(5,2) DEFAULT 0,
  avg_time_on_page integer DEFAULT 0, -- in seconds
  conversion_rate numeric(5,2) DEFAULT 0,
  revenue numeric(10,2) DEFAULT 0,
  organic_traffic integer DEFAULT 0,
  direct_traffic integer DEFAULT 0,
  social_traffic integer DEFAULT 0,
  referral_traffic integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for user analytics
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" 
ON public.user_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.user_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Service role can manage all analytics
CREATE POLICY "Service role can manage all analytics" 
ON public.user_analytics 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Create function to generate sample analytics data for existing users
CREATE OR REPLACE FUNCTION public.generate_sample_analytics(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  day_offset integer;
  sample_date date;
  base_views integer;
  base_visitors integer;
BEGIN
  -- Generate 30 days of sample data
  FOR day_offset IN 0..29 LOOP
    sample_date := CURRENT_DATE - day_offset;
    base_views := 50 + FLOOR(RANDOM() * 200);
    base_visitors := FLOOR(base_views * 0.6 + RANDOM() * 50);
    
    INSERT INTO public.user_analytics (
      user_id, 
      date, 
      page_views, 
      unique_visitors,
      bounce_rate,
      avg_time_on_page,
      conversion_rate,
      revenue,
      organic_traffic,
      direct_traffic,
      social_traffic,
      referral_traffic
    ) VALUES (
      target_user_id,
      sample_date,
      base_views,
      base_visitors,
      30 + RANDOM() * 40, -- bounce rate 30-70%
      120 + FLOOR(RANDOM() * 180), -- avg time 2-5 minutes
      1 + RANDOM() * 4, -- conversion 1-5%
      base_views * (0.5 + RANDOM() * 2), -- revenue based on views
      FLOOR(base_views * 0.6), -- 60% organic
      FLOOR(base_views * 0.2), -- 20% direct  
      FLOOR(base_views * 0.15), -- 15% social
      FLOOR(base_views * 0.05) -- 5% referral
    )
    ON CONFLICT (user_id, date) DO NOTHING;
  END LOOP;
END;
$$;
-- Fix security issue: Add SET search_path to the function
CREATE OR REPLACE FUNCTION public.generate_sample_analytics(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
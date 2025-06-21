
-- Create cache table for API responses
CREATE TABLE IF NOT EXISTS public.api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create social media posts table for mock data
CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_content TEXT NOT NULL,
  username TEXT NOT NULL,
  platform TEXT DEFAULT 'mock' CHECK (platform IN ('mock', 'twitter', 'bluesky')),
  disaster_keywords TEXT[],
  location_extracted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT false
);

-- Insert some sample social media data
INSERT INTO public.social_media_posts (post_content, username, disaster_keywords, location_extracted) VALUES
('#floodrelief Need food and water in NYC downtown area', 'citizen1', ARRAY['flood', 'relief'], 'NYC downtown'),
('Earthquake damage reported in San Francisco Mission District #earthquake #help', 'witness2', ARRAY['earthquake', 'help'], 'San Francisco Mission District'),
('Hurricane winds picking up in Miami Beach area, seeking shelter #hurricane', 'local_resident', ARRAY['hurricane'], 'Miami Beach'),
('Wildfire spreading near Los Angeles suburbs, evacuation needed #wildfire #evacuation', 'emergency_alert', ARRAY['wildfire', 'evacuation'], 'Los Angeles suburbs'),
('Flash flood warning for Austin Texas downtown #flood #warning', 'weather_service', ARRAY['flood', 'warning'], 'Austin Texas downtown');

-- Add RLS policies
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- Allow read access to api_cache
CREATE POLICY "Allow read access to api_cache" ON public.api_cache FOR SELECT USING (true);
CREATE POLICY "Allow insert access to api_cache" ON public.api_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to api_cache" ON public.api_cache FOR UPDATE USING (true);

-- Allow read access to social_media_posts
CREATE POLICY "Allow read access to social_media_posts" ON public.social_media_posts FOR SELECT USING (true);
CREATE POLICY "Allow insert access to social_media_posts" ON public.social_media_posts FOR INSERT WITH CHECK (true);

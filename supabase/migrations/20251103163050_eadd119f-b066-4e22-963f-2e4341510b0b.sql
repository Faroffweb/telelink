-- Add link shortener service column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN link_shortener_service text NOT NULL DEFAULT 'gplinks';

-- Add a check constraint to ensure valid service names
ALTER TABLE public.user_settings
ADD CONSTRAINT valid_link_shortener_service 
CHECK (link_shortener_service IN ('gplinks', 'bitly', 'tinyurl', 'isgd', 'cuttly'));
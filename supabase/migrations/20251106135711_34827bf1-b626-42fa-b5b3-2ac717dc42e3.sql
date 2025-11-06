-- Add how_to_download_link column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN how_to_download_link text;
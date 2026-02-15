-- Storage bucket for event image uploads
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies to allow public uploads (authenticated users only for upload)
CREATE POLICY "Anyone can view event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-images' AND auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Users can update own event images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-images');

CREATE POLICY "Users can delete own event images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-images');

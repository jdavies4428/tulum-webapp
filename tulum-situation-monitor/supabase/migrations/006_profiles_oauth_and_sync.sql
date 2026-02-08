-- Ensure profiles capture email from Google/Apple OAuth robustly
-- and support sync on sign-in (upsert)

-- Update trigger to capture email from multiple OAuth sources
-- Google: email in auth.users.email, full_name in raw_user_meta_data
-- Apple: email may be in raw_user_meta_data if hidden
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.email), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'email'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'email_address'), ''),
      NEW.id::text || '@auth.local'
    )::VARCHAR(255),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      split_part(COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', 'user'), '@', 1)
    )::VARCHAR(255),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    display_name = COALESCE(NULLIF(TRIM(EXCLUDED.display_name), ''), profiles.display_name),
    avatar_url = COALESCE(NULLIF(TRIM(EXCLUDED.avatar_url), ''), profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow users to insert own profile (for upsert on first sync)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Social Following System
-- Follows table and profile extensions

-- Add optional profile fields for social features
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS user_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Users can view who they follow
CREATE POLICY "Users can view own follows"
  ON public.follows FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Users can follow others
CREATE POLICY "Users can follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Allow reading other users' public profiles (for profile page)
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles viewable by owner or public"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR COALESCE(is_public, true) = true);

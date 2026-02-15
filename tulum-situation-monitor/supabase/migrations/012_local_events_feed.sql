-- Local Events Feed Table
-- Twitter-like feed for community events, admin-only posting
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.local_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_handle VARCHAR(255) NOT NULL,
  author_avatar TEXT DEFAULT '📅',
  content TEXT NOT NULL,
  image_url TEXT,
  metadata JSONB DEFAULT '{"likes_count": 0, "replies_count": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_local_events_created ON public.local_events(created_at DESC);
CREATE INDEX idx_local_events_author ON public.local_events(author_id);

-- Enable Row Level Security
ALTER TABLE public.local_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read events (public feed)
CREATE POLICY "Anyone can view local events"
  ON public.local_events FOR SELECT
  USING (true);

-- Authenticated users can insert events (API will add admin check)
CREATE POLICY "Authenticated users can insert events"
  ON public.local_events FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Only author can update their own events
CREATE POLICY "Authors can update own events"
  ON public.local_events FOR UPDATE
  USING (auth.uid() = author_id);

-- Only author can delete their own events
CREATE POLICY "Authors can delete own events"
  ON public.local_events FOR DELETE
  USING (auth.uid() = author_id);

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.local_events;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_local_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_local_events_updated_at
  BEFORE UPDATE ON public.local_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_local_events_updated_at();

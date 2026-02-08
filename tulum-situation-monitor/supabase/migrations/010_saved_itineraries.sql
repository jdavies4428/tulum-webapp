-- Saved itineraries – user-generated AI itineraries
-- Run in Supabase SQL Editor

CREATE TABLE public.saved_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  days JSONB NOT NULL DEFAULT '[]',
  tips JSONB DEFAULT '[]',
  estimated_total_cost TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_itineraries_user_id ON public.saved_itineraries(user_id);
CREATE INDEX idx_saved_itineraries_created_at ON public.saved_itineraries(created_at DESC);

ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved itineraries"
  ON public.saved_itineraries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved itineraries"
  ON public.saved_itineraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved itineraries"
  ON public.saved_itineraries FOR DELETE
  USING (auth.uid() = user_id);

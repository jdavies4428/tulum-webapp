-- Tulum Discovery – Initial Schema (mobile-first webapp)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;   -- Geographic queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- Text search (ILIKE, similarity)

-- =============================================================================
-- VENUES – Beach clubs, restaurants, cultural spots (Google Places cache)
-- =============================================================================
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,  -- 'club' | 'restaurant' | 'cultural'
  location GEOGRAPHY(POINT, 4326),
  rating DECIMAL(2,1),
  price_level VARCHAR(10),
  formatted_address TEXT,
  phone VARCHAR(50),
  website TEXT,
  description TEXT,
  description_es TEXT,
  description_fr TEXT,
  has_webcam BOOLEAN DEFAULT false,
  google_data JSONB,  -- Full Google Places response for caching
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venues_location ON public.venues USING GIST(location);
CREATE INDEX idx_venues_category ON public.venues(category);
CREATE INDEX idx_venues_place_id ON public.venues(place_id);
CREATE INDEX idx_venues_name ON public.venues USING gin(name gin_trgm_ops);

-- Row Level Security – public read for venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Public read; service role (API routes) can insert/update via service key
CREATE POLICY "Venues are viewable by everyone"
  ON public.venues FOR SELECT
  USING (true);

-- =============================================================================
-- PROFILES – Extends Supabase Auth (for saved venues, itineraries later)
-- =============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- SAVED_VENUES – User favorites (when auth is added)
-- =============================================================================
CREATE TABLE public.saved_venues (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, venue_id)
);

ALTER TABLE public.saved_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved venues"
  ON public.saved_venues FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save venues"
  ON public.saved_venues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved venues"
  ON public.saved_venues FOR DELETE
  USING (auth.uid() = user_id);

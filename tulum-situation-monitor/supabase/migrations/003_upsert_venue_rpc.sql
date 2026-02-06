-- RPC to upsert venues from Google Places (PostGIS geography from lat/lng)
CREATE OR REPLACE FUNCTION public.upsert_venue_from_google(
  p_place_id VARCHAR(255),
  p_name VARCHAR(255),
  p_category VARCHAR(50),
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_rating DECIMAL DEFAULT NULL,
  p_price_level VARCHAR(10) DEFAULT NULL,
  p_formatted_address TEXT DEFAULT NULL,
  p_phone VARCHAR(50) DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_google_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.venues (
    place_id,
    name,
    category,
    location,
    rating,
    price_level,
    formatted_address,
    phone,
    website,
    description,
    google_data,
    last_synced_at,
    updated_at
  )
  VALUES (
    p_place_id,
    p_name,
    p_category,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_rating,
    p_price_level,
    p_formatted_address,
    p_phone,
    p_website,
    p_description,
    p_google_data,
    NOW(),
    NOW()
  )
  ON CONFLICT (place_id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    rating = EXCLUDED.rating,
    price_level = EXCLUDED.price_level,
    formatted_address = EXCLUDED.formatted_address,
    phone = EXCLUDED.phone,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    google_data = EXCLUDED.google_data,
    last_synced_at = NOW(),
    updated_at = NOW();

  SELECT id INTO v_id FROM public.venues WHERE place_id = p_place_id;
  RETURN v_id;
END;
$$;

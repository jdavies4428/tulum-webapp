-- Cache venue thumbnails in Storage; store public URL here to avoid Google Photo API cost per view
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS photo_url TEXT;

DROP FUNCTION IF EXISTS public.get_venues();

CREATE OR REPLACE FUNCTION public.get_venues()
RETURNS TABLE (
  id UUID,
  place_id VARCHAR(255),
  name VARCHAR(255),
  category VARCHAR(50),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  description TEXT,
  description_es TEXT,
  description_fr TEXT,
  phone VARCHAR(50),
  website TEXT,
  has_webcam BOOLEAN,
  rating DOUBLE PRECISION,
  photo_reference TEXT,
  photo_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.id,
    v.place_id,
    v.name,
    v.category,
    ST_Y(v.location::geometry) AS lat,
    ST_X(v.location::geometry) AS lng,
    v.description,
    v.description_es,
    v.description_fr,
    v.phone,
    v.website,
    v.has_webcam,
    v.rating,
    (v.google_data->'photos'->0->>'photo_reference')::TEXT AS photo_reference,
    v.photo_url
  FROM public.venues v
  ORDER BY v.name;
$$;

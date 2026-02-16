-- Add cuisines column to venues table for filtering restaurants by cuisine type
-- Cuisines stored as JSONB array: ["mexican", "tacos", "seafood"]

ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS cuisines JSONB DEFAULT '[]'::jsonb;

-- Create index for faster cuisine filtering
CREATE INDEX IF NOT EXISTS idx_venues_cuisines ON public.venues USING GIN(cuisines);

-- Create function to tag cuisines based on venue data
CREATE OR REPLACE FUNCTION public.infer_cuisines(
  venue_name TEXT,
  google_types TEXT[],
  venue_category TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  cuisines TEXT[] := '{}';
  name_lower TEXT;
BEGIN
  name_lower := LOWER(venue_name);

  -- Only process restaurants and cafes
  IF venue_category NOT IN ('restaurant', 'cafe') THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Mexican/Tacos (most common in Tulum)
  IF name_lower ~ '(taco|taqueria|mexican|mexico|antojitos|torta|quesadilla|enchilada)' THEN
    cuisines := array_append(cuisines, 'mexican');
  END IF;
  IF name_lower ~ '(taco|taqueria)' THEN
    cuisines := array_append(cuisines, 'tacos');
  END IF;

  -- Seafood
  IF name_lower ~ '(seafood|mariscos|ceviche|pescado|fish|shrimp|camar[oó]n|pulpo|ostiones)' THEN
    cuisines := array_append(cuisines, 'seafood');
  END IF;

  -- Italian
  IF name_lower ~ '(pizza|italian|italiano|pasta|trattoria|ristorante)' THEN
    cuisines := array_append(cuisines, 'italian');
  END IF;
  IF name_lower ~ 'pizza' THEN
    cuisines := array_append(cuisines, 'pizza');
  END IF;

  -- Asian
  IF name_lower ~ '(sushi|japanese|japon[eé]s|asian|thai|china|chinese|vietnam|korean|ramen|poke)' THEN
    cuisines := array_append(cuisines, 'asian');
  END IF;
  IF name_lower ~ 'sushi' THEN
    cuisines := array_append(cuisines, 'sushi');
  END IF;
  IF name_lower ~ 'thai' THEN
    cuisines := array_append(cuisines, 'thai');
  END IF;

  -- American
  IF name_lower ~ '(burger|american|bbq|grill|steak)' THEN
    cuisines := array_append(cuisines, 'american');
  END IF;

  -- Vegan/Vegetarian
  IF name_lower ~ '(vegan|vegetarian|veggie|plant.based)' THEN
    cuisines := array_append(cuisines, 'vegan');
  END IF;

  -- Healthy/Organic
  IF name_lower ~ '(organic|health|juice|smoothie|wellness|raw)' THEN
    cuisines := array_append(cuisines, 'healthy');
  END IF;

  -- Breakfast/Brunch
  IF name_lower ~ '(breakfast|brunch|desayuno|caf[eé]|coffee|bakery|panader[ií]a)' THEN
    cuisines := array_append(cuisines, 'breakfast');
  END IF;

  -- French
  IF name_lower ~ '(french|franc[eé]s|bistro|boulangerie|cr[eê]pe)' THEN
    cuisines := array_append(cuisines, 'french');
  END IF;

  -- Mediterranean
  IF name_lower ~ '(mediterranean|greek|lebanese|falafel|hummus)' THEN
    cuisines := array_append(cuisines, 'mediterranean');
  END IF;

  -- If no specific cuisine detected but it's a restaurant, tag as "international"
  IF array_length(cuisines, 1) IS NULL AND venue_category = 'restaurant' THEN
    cuisines := array_append(cuisines, 'international');
  END IF;

  -- Cafes default to "cafe" tag
  IF venue_category = 'cafe' THEN
    cuisines := array_append(cuisines, 'cafe');
  END IF;

  -- Remove duplicates and return
  RETURN array_to_json(ARRAY(SELECT DISTINCT unnest(cuisines)))::jsonb;
END;
$$;

-- Populate cuisines for existing venues
UPDATE public.venues
SET cuisines = public.infer_cuisines(
  name,
  COALESCE((google_data->'types')::TEXT[], ARRAY[]::TEXT[]),
  category
)
WHERE category IN ('restaurant', 'cafe');

-- Create helper function to get venues by cuisine
CREATE OR REPLACE FUNCTION public.get_venues_by_cuisine(cuisine_filter TEXT)
RETURNS TABLE (
  id UUID,
  place_id VARCHAR(255),
  name VARCHAR(255),
  category VARCHAR(50),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  description TEXT,
  phone VARCHAR(50),
  website TEXT,
  rating DOUBLE PRECISION,
  cuisines JSONB
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
    v.phone,
    v.website,
    v.rating,
    v.cuisines
  FROM public.venues v
  WHERE v.cuisines ? cuisine_filter
  ORDER BY v.rating DESC NULLS LAST;
$$;

COMMENT ON COLUMN public.venues.cuisines IS 'Array of cuisine tags: ["mexican", "tacos", "seafood", "italian", etc.]';
COMMENT ON FUNCTION public.infer_cuisines IS 'Auto-tags cuisines based on venue name and Google types';
COMMENT ON FUNCTION public.get_venues_by_cuisine IS 'Returns venues filtered by cuisine type';

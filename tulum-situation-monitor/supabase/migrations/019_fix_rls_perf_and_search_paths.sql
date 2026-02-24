-- ============================================================
-- Migration 019: Fix Performance Advisor Warnings
--
-- 1. Auth RLS Initialization Plan (11 warnings)
--    Replace auth.uid() with (select auth.uid()) in all RLS
--    policies so PostgreSQL evaluates it once per query instead
--    of per-row.
--
-- 2. Function Search Path Mutable (5 warnings)
--    Add SET search_path = '' to all user-defined functions
--    to prevent search-path injection attacks.
-- ============================================================

-- ============================================================
-- PART 1: FIX RLS POLICIES — (select auth.uid()) pattern
-- ============================================================

-- ----- profiles -----

DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by owner or public" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Profiles viewable by owner or public"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id OR COALESCE(is_public, true) = true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- ----- saved_venues -----

DROP POLICY IF EXISTS "Users can view own saved venues" ON public.saved_venues;
DROP POLICY IF EXISTS "Users can save venues" ON public.saved_venues;
DROP POLICY IF EXISTS "Users can remove saved venues" ON public.saved_venues;

CREATE POLICY "Users can view own saved venues"
  ON public.saved_venues FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can save venues"
  ON public.saved_venues FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove saved venues"
  ON public.saved_venues FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ----- follows -----

DROP POLICY IF EXISTS "Users can view own follows" ON public.follows;
DROP POLICY IF EXISTS "Users can follow" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;

CREATE POLICY "Users can view own follows"
  ON public.follows FOR SELECT
  USING ((select auth.uid()) = follower_id OR (select auth.uid()) = following_id);

CREATE POLICY "Users can follow"
  ON public.follows FOR INSERT
  WITH CHECK ((select auth.uid()) = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING ((select auth.uid()) = follower_id);

-- ----- conversations -----

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING ((select auth.uid()) = participant_1 OR (select auth.uid()) = participant_2);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK ((select auth.uid()) = participant_1 OR (select auth.uid()) = participant_2);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING ((select auth.uid()) = participant_1 OR (select auth.uid()) = participant_2);

-- ----- chat_messages -----

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages to own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages (read_at) in own conversations" ON public.chat_messages;

CREATE POLICY "Users can view messages in own conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = (select auth.uid()) OR c.participant_2 = (select auth.uid()))
    )
  );

CREATE POLICY "Users can send messages to own conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    (select auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = (select auth.uid()) OR c.participant_2 = (select auth.uid()))
    )
  );

CREATE POLICY "Users can update messages (read_at) in own conversations"
  ON public.chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = (select auth.uid()) OR c.participant_2 = (select auth.uid()))
    )
  );

-- ----- saved_itineraries -----

DROP POLICY IF EXISTS "Users can view own saved itineraries" ON public.saved_itineraries;
DROP POLICY IF EXISTS "Users can insert own saved itineraries" ON public.saved_itineraries;
DROP POLICY IF EXISTS "Users can delete own saved itineraries" ON public.saved_itineraries;

CREATE POLICY "Users can view own saved itineraries"
  ON public.saved_itineraries FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own saved itineraries"
  ON public.saved_itineraries FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own saved itineraries"
  ON public.saved_itineraries FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ----- local_events -----

DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.local_events;
DROP POLICY IF EXISTS "Authors can update own events" ON public.local_events;
DROP POLICY IF EXISTS "Authors can delete own events" ON public.local_events;

CREATE POLICY "Authenticated users can insert events"
  ON public.local_events FOR INSERT
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Authors can update own events"
  ON public.local_events FOR UPDATE
  USING ((select auth.uid()) = author_id);

CREATE POLICY "Authors can delete own events"
  ON public.local_events FOR DELETE
  USING ((select auth.uid()) = author_id);

-- ----- insider_picks (created outside migrations) -----
-- Only recreate if the table exists

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insider_picks') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Anyone can view insider picks" ON public.insider_picks;
    DROP POLICY IF EXISTS "Authenticated users can view insider picks" ON public.insider_picks;
    DROP POLICY IF EXISTS "Admins can manage insider picks" ON public.insider_picks;
    DROP POLICY IF EXISTS "Service role full access" ON public.insider_picks;
    DROP POLICY IF EXISTS "insider_picks_select" ON public.insider_picks;
    DROP POLICY IF EXISTS "insider_picks_insert" ON public.insider_picks;
    DROP POLICY IF EXISTS "insider_picks_delete" ON public.insider_picks;

    -- Recreate with optimized auth checks
    CREATE POLICY "Anyone can view insider picks"
      ON public.insider_picks FOR SELECT
      USING (true);

    CREATE POLICY "Authenticated users can manage insider picks"
      ON public.insider_picks FOR ALL
      TO authenticated
      USING ((select auth.uid()) IS NOT NULL)
      WITH CHECK ((select auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ----- storage.objects (profile-photos) -----

DROP POLICY IF EXISTS "Authenticated users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload their own profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-photos'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- PART 2: FIX FUNCTION SEARCH PATHS
-- ============================================================

-- ----- handle_new_user -----

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ----- update_updated_at_column -----

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ----- handle_local_events_updated_at -----

CREATE OR REPLACE FUNCTION public.handle_local_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ----- infer_cuisines -----

CREATE OR REPLACE FUNCTION public.infer_cuisines(
  venue_name TEXT,
  google_types TEXT[],
  venue_category TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  cuisines TEXT[] := '{}';
  name_lower TEXT;
BEGIN
  name_lower := LOWER(venue_name);

  IF venue_category NOT IN ('restaurant', 'cafe') THEN
    RETURN '[]'::jsonb;
  END IF;

  IF name_lower ~ '(taco|taqueria|mexican|mexico|antojitos|torta|quesadilla|enchilada)' THEN
    cuisines := array_append(cuisines, 'mexican');
  END IF;
  IF name_lower ~ '(taco|taqueria)' THEN
    cuisines := array_append(cuisines, 'tacos');
  END IF;

  IF name_lower ~ '(seafood|mariscos|ceviche|pescado|fish|shrimp|camar[oó]n|pulpo|ostiones)' THEN
    cuisines := array_append(cuisines, 'seafood');
  END IF;

  IF name_lower ~ '(pizza|italian|italiano|pasta|trattoria|ristorante)' THEN
    cuisines := array_append(cuisines, 'italian');
  END IF;
  IF name_lower ~ 'pizza' THEN
    cuisines := array_append(cuisines, 'pizza');
  END IF;

  IF name_lower ~ '(sushi|japanese|japon[eé]s|asian|thai|china|chinese|vietnam|korean|ramen|poke)' THEN
    cuisines := array_append(cuisines, 'asian');
  END IF;
  IF name_lower ~ 'sushi' THEN
    cuisines := array_append(cuisines, 'sushi');
  END IF;
  IF name_lower ~ 'thai' THEN
    cuisines := array_append(cuisines, 'thai');
  END IF;

  IF name_lower ~ '(burger|american|bbq|grill|steak)' THEN
    cuisines := array_append(cuisines, 'american');
  END IF;

  IF name_lower ~ '(vegan|vegetarian|veggie|plant.based)' THEN
    cuisines := array_append(cuisines, 'vegan');
  END IF;

  IF name_lower ~ '(organic|health|juice|smoothie|wellness|raw)' THEN
    cuisines := array_append(cuisines, 'healthy');
  END IF;

  IF name_lower ~ '(breakfast|brunch|desayuno|caf[eé]|coffee|bakery|panader[ií]a)' THEN
    cuisines := array_append(cuisines, 'breakfast');
  END IF;

  IF name_lower ~ '(french|franc[eé]s|bistro|boulangerie|cr[eê]pe)' THEN
    cuisines := array_append(cuisines, 'french');
  END IF;

  IF name_lower ~ '(mediterranean|greek|lebanese|falafel|hummus)' THEN
    cuisines := array_append(cuisines, 'mediterranean');
  END IF;

  IF array_length(cuisines, 1) IS NULL AND venue_category = 'restaurant' THEN
    cuisines := array_append(cuisines, 'international');
  END IF;

  IF venue_category = 'cafe' THEN
    cuisines := array_append(cuisines, 'cafe');
  END IF;

  RETURN array_to_json(ARRAY(SELECT DISTINCT unnest(cuisines)))::jsonb;
END;
$$;

-- ----- update_insider_picks (if it exists as a trigger function) -----

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname LIKE 'update_insider_picks%'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    EXECUTE format(
      'ALTER FUNCTION public.%I() SET search_path = %L',
      (SELECT proname FROM pg_proc WHERE proname LIKE 'update_insider_picks%' AND pronamespace = 'public'::regnamespace LIMIT 1),
      ''
    );
  END IF;
END $$;

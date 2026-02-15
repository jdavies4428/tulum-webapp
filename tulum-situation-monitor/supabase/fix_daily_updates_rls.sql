-- Fix Daily Updates Subscriptions RLS Policies
-- Run this in Supabase SQL Editor to fix the policy blocking inserts

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.daily_updates_subscriptions;
DROP POLICY IF EXISTS "Service role full access" ON public.daily_updates_subscriptions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.daily_updates_subscriptions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.daily_updates_subscriptions;

-- Recreate policies with correct permissions
-- Allow anyone (including anonymous users) to insert subscriptions
CREATE POLICY "Enable insert for all users"
  ON public.daily_updates_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Service role can do anything (for admin operations)
CREATE POLICY "Service role full access"
  ON public.daily_updates_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE public.daily_updates_subscriptions ENABLE ROW LEVEL SECURITY;

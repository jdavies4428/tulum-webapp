-- Daily beach updates subscriptions
-- SMS/MMS notifications for Tulum beach conditions
-- Run in Supabase SQL Editor

CREATE TABLE public.daily_updates_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  send_time TIME NOT NULL,
  timezone TEXT DEFAULT 'America/Cancun',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_updates_phone ON public.daily_updates_subscriptions(phone_number);
CREATE INDEX idx_daily_updates_status ON public.daily_updates_subscriptions(status);
CREATE INDEX idx_daily_updates_dates ON public.daily_updates_subscriptions(start_date, end_date);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_updates_subscriptions_updated_at
  BEFORE UPDATE ON public.daily_updates_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies: Allow public insert for subscriptions, admin access for management
ALTER TABLE public.daily_updates_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous users) to insert subscriptions
CREATE POLICY "Enable insert for all users"
  ON public.daily_updates_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Service role can do anything
CREATE POLICY "Service role full access"
  ON public.daily_updates_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

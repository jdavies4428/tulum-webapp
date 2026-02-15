-- Create insider_picks table to store admin-favorited places
CREATE TABLE IF NOT EXISTS insider_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_insider_picks_place_id ON insider_picks(place_id);
CREATE INDEX IF NOT EXISTS idx_insider_picks_added_by ON insider_picks(added_by);

-- Enable Row Level Security
ALTER TABLE insider_picks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view insider picks
CREATE POLICY "Anyone can view insider picks"
  ON insider_picks
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert (API will check admin status)
CREATE POLICY "Authenticated users can insert insider picks"
  ON insider_picks
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only the user who added it can delete
CREATE POLICY "Users can delete their own insider picks"
  ON insider_picks
  FOR DELETE
  USING (auth.uid() = added_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_insider_picks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insider_picks_updated_at
  BEFORE UPDATE ON insider_picks
  FOR EACH ROW
  EXECUTE FUNCTION update_insider_picks_updated_at();

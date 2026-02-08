-- Storage bucket for chat image uploads (Phase 2)
-- Run in Supabase Dashboard SQL if migration fails (storage schema can vary)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Seed venues from existing places data
-- Run in Supabase SQL Editor after 001_initial_schema.sql

INSERT INTO public.venues (
  place_id,
  name,
  category,
  location,
  description,
  description_es,
  description_fr,
  phone,
  website,
  has_webcam
) VALUES
  ('tulum-papaya-playa-project', 'Papaya Playa Project', 'club', ST_SetSRID(ST_MakePoint(-87.4451, 20.1813), 4326)::geography, 'Beach club, hotel & party venue', 'Club de playa, hotel y fiestas', NULL, '+5219841680095', 'https://www.papayaplayaproject.com', false),
  ('tulum-mia-beach-club', 'Mia Beach Club', 'club', ST_SetSRID(ST_MakePoint(-87.4566, 20.155), 4326)::geography, 'Day club with restaurant & events', 'Club de día con restaurante', NULL, '+529841339662', 'https://www.miatulum.com', false),
  ('tulum-kanan', 'Kanan Tulum', 'club', ST_SetSRID(ST_MakePoint(-87.4582, 20.1507), 4326)::geography, 'Treehouse hotel & rooftop bar', 'Hotel casa del árbol y bar', NULL, '+529988301512', 'https://www.kanantulum.com', false),
  ('tulum-azulik', 'Azulik', 'club', ST_SetSRID(ST_MakePoint(-87.4458, 20.1786), 4326)::geography, 'Eco-resort & sunset destination', 'Eco-resort y atardeceres', NULL, '+529851466297', 'https://www.azulik.com', false),
  ('tulum-casa-malca', 'Casa Malca', 'club', ST_SetSRID(ST_MakePoint(-87.4638, 20.1337), 4326)::geography, 'Art hotel & beach club', 'Hotel de arte y club de playa', NULL, '+5219841314158', 'https://www.casamalca.com', true),
  ('tulum-la-zebra', 'La Zebra', 'club', ST_SetSRID(ST_MakePoint(-87.4600, 20.1458), 4326)::geography, 'Beachfront restaurant & bar', 'Restaurante frente al mar', NULL, '+5219841167890', 'https://www.lazebratulum.com', false),
  ('tulum-arca', 'Arca', 'restaurant', ST_SetSRID(ST_MakePoint(-87.4595, 20.1494), 4326)::geography, 'Michelin ⭐ - Jungle fine dining, local ingredients', 'Michelin ⭐ - Alta cocina en la selva', 'Michelin ⭐ - Gastronomie dans la jungle', '+529841191596', 'https://arcatulum.com', false),
  ('tulum-hartwood', 'Hartwood', 'restaurant', ST_SetSRID(ST_MakePoint(-87.4593, 20.1498), 4326)::geography, 'Michelin - Wood-fired, sustainable cuisine', 'Michelin - Cocina sustentable al fuego', 'Michelin - Cuisine durable au feu de bois', '+529841455240', 'https://hartwoodtulum.com', false),
  ('tulum-wild', 'Wild Tulum', 'restaurant', ST_SetSRID(ST_MakePoint(-87.4642, 20.1351), 4326)::geography, 'Michelin ⭐ - Jungle setting, auteur cuisine', 'Michelin ⭐ - Cocina de autor en selva', 'Michelin ⭐ - Cuisine d''auteur dans la jungle', '+529841308295', 'https://www.wildtulum.com', false),
  ('tulum-nu', 'Nü Tulum', 'restaurant', ST_SetSRID(ST_MakePoint(-87.4618, 20.1405), 4326)::geography, 'Michelin - Contemporary Mexican', 'Michelin - Mexicana contemporánea', 'Michelin - Mexicain contemporain', '+529841234567', 'https://nutulum.com', false),
  ('tulum-casa-banana', 'Casa Banana', 'restaurant', ST_SetSRID(ST_MakePoint(-87.4589, 20.1505), 4326)::geography, 'Michelin - Argentine grill, premium cuts', 'Michelin - Parrilla argentina', 'Michelin - Grill argentin', '+529841151671', 'https://casabananatulum.com', false),
  ('tulum-posada-margherita', 'Posada Margherita', 'restaurant', ST_SetSRID(ST_MakePoint(-87.4523, 20.1652), 4326)::geography, 'Michelin - Italian beachfront, fresh pasta', 'Michelin - Italiano frente al mar', 'Michelin - Italien en bord de mer', '+529841801493', 'https://posadamargherita.com', false),
  ('tulum-vesica', 'Vesica', 'cultural', ST_SetSRID(ST_MakePoint(-87.5024, 20.1968), 4326)::geography, 'Cenote club - Wellness, ceremonies, sound healing', 'Club cenote - Bienestar, ceremonias, sanación sonora', 'Club cenote - Bien-être, cérémonies, guérison sonore', '+529841234572', 'https://vesica.com', false)
ON CONFLICT (place_id) DO NOTHING;

/**
 * Seed venues from src/data/places.ts into Supabase
 * Run: npm run seed:venues
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { beachClubs, restaurants, culturalPlaces } from "../src/data/places";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

type Place = {
  name: string;
  lat: number;
  lng: number;
  desc: string;
  descEs?: string;
  descFr?: string;
  whatsapp: string;
  url: string;
  hasWebcam?: boolean;
};

function toPlaceId(name: string, category: string): string {
  return `tulum-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

async function seed() {
  const venues: Array<{
    place_id: string;
    name: string;
    category: string;
    description: string;
    description_es: string | null;
    description_fr: string | null;
    phone: string;
    website: string;
    has_webcam: boolean;
    lat: number;
    lng: number;
  }> = [];

  const add = (places: Place[], category: string) => {
    for (const p of places) {
      venues.push({
        place_id: toPlaceId(p.name, category),
        name: p.name,
        category,
        description: p.desc,
        description_es: p.descEs ?? null,
        description_fr: p.descFr ?? null,
        phone: p.whatsapp,
        website: p.url,
        has_webcam: p.hasWebcam ?? false,
        lat: p.lat,
        lng: p.lng,
      });
    }
  };

  add(beachClubs, "club");
  add(restaurants, "restaurant");
  add(culturalPlaces, "cultural");

  console.log(`Seeding ${venues.length} venues...`);

  for (const v of venues) {
    const { error } = await supabase.from("venues").upsert(
      {
        place_id: v.place_id,
        name: v.name,
        category: v.category,
        description: v.description,
        description_es: v.description_es,
        description_fr: v.description_fr,
        phone: v.phone,
        website: v.website,
        has_webcam: v.has_webcam,
        location: `POINT(${v.lng} ${v.lat})`,
      },
      { onConflict: "place_id" }
    );
    if (error) {
      console.error(`Failed to upsert ${v.name}:`, error.message);
    } else {
      console.log(`  ✓ ${v.name}`);
    }
  }

  console.log("Done.");
}

seed().catch(console.error);

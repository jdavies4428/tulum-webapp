import { beachClubs, restaurants, culturalPlaces } from "@/data/places";

export type PlaceCategory = "beach-club" | "restaurant" | "cultural";

export interface PlaceWithSlug {
  slug: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  lat: number;
  lng: number;
  desc: string;
  descEs?: string;
  descFr?: string;
  whatsapp?: string;
  url?: string;
  hasWebcam?: boolean;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const allPlaces: PlaceWithSlug[] = [
  ...beachClubs.map((p) => ({
    slug: toSlug(p.name),
    name: p.name,
    category: "beach-club" as PlaceCategory,
    categoryLabel: "Beach Club",
    lat: p.lat,
    lng: p.lng,
    desc: p.desc,
    descEs: p.descEs,
    whatsapp: p.whatsapp,
    url: p.url,
    hasWebcam: "hasWebcam" in p ? (p as { hasWebcam?: boolean }).hasWebcam : undefined,
  })),
  ...restaurants.map((p) => ({
    slug: toSlug(p.name),
    name: p.name,
    category: "restaurant" as PlaceCategory,
    categoryLabel: "Restaurant",
    lat: p.lat,
    lng: p.lng,
    desc: p.desc,
    descEs: p.descEs,
    descFr: p.descFr,
    whatsapp: p.whatsapp,
    url: p.url,
  })),
  ...culturalPlaces.map((p) => ({
    slug: toSlug(p.name),
    name: p.name,
    category: "cultural" as PlaceCategory,
    categoryLabel: "Cultural & Wellness",
    lat: p.lat,
    lng: p.lng,
    desc: p.desc,
    descEs: p.descEs,
    descFr: p.descFr,
    whatsapp: p.whatsapp,
    url: p.url,
  })),
];

export function getAllPlaces(): PlaceWithSlug[] {
  return allPlaces;
}

export function getPlaceBySlug(slug: string): PlaceWithSlug | undefined {
  return allPlaces.find((p) => p.slug === slug);
}

export function getPlacesByCategory(category: PlaceCategory): PlaceWithSlug[] {
  return allPlaces.filter((p) => p.category === category);
}

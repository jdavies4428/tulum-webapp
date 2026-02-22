import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Photo Map - Discover Instagrammable Spots",
  description: "Explore Tulum through photos pinned to a map. Find the most photogenic beaches, restaurants, cenotes, and hidden spots shared by travelers and locals.",
  alternates: {
    canonical: `${BASE_URL}/discover/photo-map`,
    languages: {
      "en": `${BASE_URL}/discover/photo-map`,
      "es": `${BASE_URL}/discover/photo-map?lang=es`,
      "fr": `${BASE_URL}/discover/photo-map?lang=fr`,
    },
  },
};

export default function PhotoMapLayout({ children }: { children: React.ReactNode }) {
  return children;
}

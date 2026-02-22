import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Map - Restaurants, Beach Clubs & Points of Interest",
  description: "Interactive map of Tulum with restaurants, beach clubs, cenotes, yoga studios, and local attractions. Filter by category, see ratings, and get directions to any spot.",
  keywords: ["Tulum map", "Tulum restaurants map", "Tulum beach clubs map", "things to do Tulum map"],
  alternates: {
    canonical: `${BASE_URL}/map`,
    languages: {
      "en": `${BASE_URL}/map`,
      "es": `${BASE_URL}/map?lang=es`,
      "fr": `${BASE_URL}/map?lang=fr`,
    },
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Discover Tulum - Things to Do, Eat & Explore",
  description: "Explore the best of Tulum: local events, beach clubs, restaurants, excursions, yoga retreats, food delivery, and insider tips. Your guide to everything Tulum has to offer.",
  alternates: {
    canonical: `${BASE_URL}/discover`,
    languages: {
      "en": `${BASE_URL}/discover`,
      "es": `${BASE_URL}/discover?lang=es`,
      "fr": `${BASE_URL}/discover?lang=fr`,
    },
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}

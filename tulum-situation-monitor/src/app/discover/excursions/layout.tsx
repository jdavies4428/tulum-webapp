import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Excursions - Cenotes, Ruins & Adventure Tours",
  description: "Book the best Tulum excursions: cenote swimming, Mayan ruins tours, snorkeling, jungle adventures, and day trips to Sian Ka'an. Curated experiences from local operators.",
  alternates: {
    canonical: `${BASE_URL}/discover/excursions`,
    languages: {
      "en": `${BASE_URL}/discover/excursions`,
      "es": `${BASE_URL}/discover/excursions?lang=es`,
      "fr": `${BASE_URL}/discover/excursions?lang=fr`,
    },
  },
};

export default function ExcursionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

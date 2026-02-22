import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Yoga & Wellness - Healing Retreats & Classes",
  description: "Find yoga classes, wellness retreats, sound healing, temazcal ceremonies, and holistic therapies in Tulum. Connect with the best practitioners and healing centers.",
  alternates: {
    canonical: `${BASE_URL}/discover/healing`,
    languages: {
      "en": `${BASE_URL}/discover/healing`,
      "es": `${BASE_URL}/discover/healing?lang=es`,
      "fr": `${BASE_URL}/discover/healing?lang=fr`,
    },
  },
};

export default function HealingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

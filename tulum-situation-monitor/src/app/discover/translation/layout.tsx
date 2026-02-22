import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Translation - Spanish Phrases & Real-Time Translate",
  description: "Essential Spanish phrases for Tulum travelers plus real-time translation. Learn key words for restaurants, taxis, shopping, and everyday conversations in Mexico.",
  alternates: {
    canonical: `${BASE_URL}/discover/translation`,
    languages: {
      "en": `${BASE_URL}/discover/translation`,
      "es": `${BASE_URL}/discover/translation?lang=es`,
      "fr": `${BASE_URL}/discover/translation?lang=fr`,
    },
  },
};

export default function TranslationLayout({ children }: { children: React.ReactNode }) {
  return children;
}

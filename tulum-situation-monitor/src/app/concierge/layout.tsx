import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum AI Concierge - Personalized Travel Recommendations",
  description: "Get instant, personalized Tulum recommendations from our AI concierge. Ask about restaurants, activities, beach conditions, transportation, or anything about your Tulum trip.",
  alternates: {
    canonical: `${BASE_URL}/concierge`,
    languages: {
      "en": `${BASE_URL}/concierge`,
      "es": `${BASE_URL}/concierge?lang=es`,
      "fr": `${BASE_URL}/concierge?lang=fr`,
    },
  },
};

export default function ConciergeLayout({ children }: { children: React.ReactNode }) {
  return children;
}

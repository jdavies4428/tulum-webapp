import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Itinerary Planner - AI-Powered Trip Planning",
  description: "Create your perfect Tulum itinerary with AI. Get a customized day-by-day plan with restaurants, beaches, activities, and insider tips based on your travel style and budget.",
  keywords: ["Tulum itinerary", "Tulum trip planner", "Tulum travel plan", "what to do in Tulum"],
  alternates: {
    canonical: `${BASE_URL}/itinerary`,
    languages: {
      "en": `${BASE_URL}/itinerary`,
      "es": `${BASE_URL}/itinerary?lang=es`,
      "fr": `${BASE_URL}/itinerary?lang=fr`,
    },
  },
};

export default function ItineraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

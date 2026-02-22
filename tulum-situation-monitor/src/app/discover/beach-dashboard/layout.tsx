import type { Metadata } from "next";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Beach Conditions - Sargassum, Waves & Water Temperature",
  description: "Real-time Tulum beach conditions: sargassum levels, water temperature, wave height, UV index, and crowd estimates. Check before you go with live data updated every 5 minutes.",
  keywords: ["Tulum beach conditions", "sargassum Tulum today", "Tulum water temperature", "Tulum wave height", "beach forecast Tulum"],
  alternates: {
    canonical: `${BASE_URL}/discover/beach-dashboard`,
    languages: {
      "en": `${BASE_URL}/discover/beach-dashboard`,
      "es": `${BASE_URL}/discover/beach-dashboard?lang=es`,
      "fr": `${BASE_URL}/discover/beach-dashboard?lang=fr`,
    },
  },
};

export default function BeachDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FaqJsonLd items={[
        {
          question: "What is sargassum and how does it affect Tulum beaches?",
          answer: "Sargassum is a type of brown seaweed that washes ashore on Caribbean beaches including Tulum. It arrives in seasonal waves, typically peaking between May and October. When present in large quantities, it can affect beach aesthetics and water quality. Our dashboard tracks real-time sargassum levels so you can plan your beach day.",
        },
        {
          question: "When is sargassum season in Tulum?",
          answer: "Sargassum season in Tulum typically runs from May through October, with peak arrivals usually in June, July, and August. However, conditions vary year to year. Our real-time beach dashboard monitors current sargassum levels with satellite data updated regularly.",
        },
        {
          question: "What is the water temperature in Tulum?",
          answer: "Tulum's Caribbean sea water temperature ranges from about 26°C (79°F) in winter months to 29°C (84°F) in summer. The water is warm year-round, making it suitable for swimming any time. Check our dashboard for today's exact water temperature.",
        },
        {
          question: "What are the best months to visit Tulum beaches?",
          answer: "The best months for Tulum beaches are November through April, when sargassum levels are typically low, weather is warm and dry, and water is crystal clear. December through March offers the most consistent beach conditions.",
        },
      ]} />
      {children}
    </>
  );
}

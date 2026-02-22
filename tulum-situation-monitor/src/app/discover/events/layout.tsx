import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Events - Live Music, Parties & Local Happenings",
  description: "Stay up to date with Tulum events: live music, DJ sets, beach parties, full moon ceremonies, art exhibitions, and community gatherings. See what's happening tonight and this week.",
  alternates: {
    canonical: `${BASE_URL}/discover/events`,
    languages: {
      "en": `${BASE_URL}/discover/events`,
      "es": `${BASE_URL}/discover/events?lang=es`,
      "fr": `${BASE_URL}/discover/events?lang=fr`,
    },
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

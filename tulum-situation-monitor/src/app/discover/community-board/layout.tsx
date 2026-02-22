import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Community Board - Local Updates & Tips",
  description: "Stay connected with the Tulum community: announcements, housing, services, recommendations, ride shares, and more from locals and travelers.",
  alternates: {
    canonical: `${BASE_URL}/discover/community-board`,
    languages: {
      "en": `${BASE_URL}/discover/community-board`,
      "es": `${BASE_URL}/discover/community-board?lang=es`,
      "fr": `${BASE_URL}/discover/community-board?lang=fr`,
    },
  },
};

export default function CommunityBoardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

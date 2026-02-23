import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Pulse - What To Do Right Now",
  description: "Real-time conditions, beach scores, events, and AI-powered recommendations for Tulum right now.",
  alternates: {
    canonical: `${BASE_URL}/pulse`,
    languages: {
      "en": `${BASE_URL}/pulse`,
      "es": `${BASE_URL}/pulse?lang=es`,
      "fr": `${BASE_URL}/pulse?lang=fr`,
    },
  },
};

export default function PulseLayout({ children }: { children: React.ReactNode }) {
  return children;
}

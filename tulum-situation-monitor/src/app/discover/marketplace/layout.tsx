import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Marketplace - Buy & Sell Locally",
  description: "Browse the Tulum marketplace: buy and sell furniture, electronics, vehicles, and more from the local expat and traveler community.",
  alternates: {
    canonical: `${BASE_URL}/discover/marketplace`,
    languages: {
      "en": `${BASE_URL}/discover/marketplace`,
      "es": `${BASE_URL}/discover/marketplace?lang=es`,
      "fr": `${BASE_URL}/discover/marketplace?lang=fr`,
    },
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}

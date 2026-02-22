import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Shop Local Tulum - Boutiques & Artisan Goods",
  description: "Support Tulum's local shops: handmade artisan goods, boutique clothing, Mayan crafts, organic products, and unique souvenirs from independent stores.",
  alternates: {
    canonical: `${BASE_URL}/discover/shop-local`,
    languages: {
      "en": `${BASE_URL}/discover/shop-local`,
      "es": `${BASE_URL}/discover/shop-local?lang=es`,
      "fr": `${BASE_URL}/discover/shop-local?lang=fr`,
    },
  },
};

export default function ShopLocalLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Food Delivery - Order From Local Restaurants",
  description: "Order food delivery in Tulum from the best local restaurants. Browse menus, compare prices, and get meals delivered to your hotel, Airbnb, or villa.",
  alternates: {
    canonical: `${BASE_URL}/discover/food-delivery`,
    languages: {
      "en": `${BASE_URL}/discover/food-delivery`,
      "es": `${BASE_URL}/discover/food-delivery?lang=es`,
      "fr": `${BASE_URL}/discover/food-delivery?lang=fr`,
    },
  },
};

export default function FoodDeliveryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Tulum Transportation - Taxis, Rentals & Getting Around",
  description: "Everything you need for getting around Tulum: taxi services, car and scooter rentals, colectivos, airport transfers from Cancun, and bike rental options.",
  keywords: ["Tulum taxi", "Cancun to Tulum transport", "Tulum car rental", "Tulum scooter rental", "getting around Tulum"],
  alternates: {
    canonical: `${BASE_URL}/discover/transportation`,
    languages: {
      "en": `${BASE_URL}/discover/transportation`,
      "es": `${BASE_URL}/discover/transportation?lang=es`,
      "fr": `${BASE_URL}/discover/transportation?lang=fr`,
    },
  },
};

export default function TransportationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FaqJsonLd items={[
        {
          question: "How do I get from Cancun Airport to Tulum?",
          answer: "The most common options are: private transfer (1.5-2 hours, ~$80-120 USD), ADO bus from the airport terminal (~$15-20 USD, 2.5 hours), or shared shuttle services. Private transfers can be booked in advance and offer door-to-door service to your hotel.",
        },
        {
          question: "How much does a taxi cost in Tulum?",
          answer: "Taxi prices in Tulum vary by distance. A ride within Tulum town typically costs 50-100 MXN ($3-6 USD). From Tulum town to the beach hotel zone costs 150-250 MXN ($8-15 USD). Always agree on the price before getting in, as taxis in Tulum don't use meters.",
        },
        {
          question: "Can I rent a scooter or bike in Tulum?",
          answer: "Yes, scooter and bike rentals are very popular in Tulum. Scooter rentals cost around 400-600 MXN ($25-35 USD) per day. Bike rentals are cheaper at 100-200 MXN ($6-12 USD) per day. Many hotels also offer free or discounted bike rentals for guests.",
        },
      ]} />
      {children}
    </>
  );
}

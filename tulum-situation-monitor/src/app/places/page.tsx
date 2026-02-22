import type { Metadata } from "next";
import Link from "next/link";
import { getAllPlaces, type PlaceCategory } from "@/lib/place-slugs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  title: "Best Places in Tulum - Restaurants, Beach Clubs & Attractions",
  description: "Discover Tulum's best restaurants, beach clubs, and attractions. From Michelin-starred dining at Arca and Hartwood to iconic beach clubs like Papaya Playa Project and Azulik.",
  keywords: [
    "best restaurants Tulum",
    "Tulum beach clubs",
    "things to do Tulum",
    "Arca Tulum",
    "Hartwood Tulum",
    "Papaya Playa Project",
    "Azulik Tulum",
  ],
  alternates: {
    canonical: `${BASE_URL}/places`,
    languages: {
      "en": `${BASE_URL}/places`,
      "es": `${BASE_URL}/places?lang=es`,
      "fr": `${BASE_URL}/places?lang=fr`,
    },
  },
};

const CATEGORY_ORDER: { key: PlaceCategory; label: string; emoji: string }[] = [
  { key: "restaurant", label: "Restaurants", emoji: "🍽️" },
  { key: "beach-club", label: "Beach Clubs", emoji: "🏖️" },
  { key: "cultural", label: "Cultural & Wellness", emoji: "🌿" },
];

export default function PlacesPage() {
  const places = getAllPlaces();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Places", href: "/places" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Best Places in Tulum",
            "description": "Curated list of the best restaurants, beach clubs, and attractions in Tulum, Mexico.",
            "numberOfItems": places.length,
            "itemListElement": places.map((place, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "url": `${BASE_URL}/places/${place.slug}`,
              "name": place.name,
            })),
          })
        }}
      />

      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0F1419 0%, #1a2332 100%)",
        color: "#E8ECEF",
        padding: "24px 16px 100px",
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 16, opacity: 0.7 }}>
          <Link href="/" style={{ color: "#00CED1", textDecoration: "none" }}>Home</Link>
          {" / "}
          <span>Places</span>
        </nav>

        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>
          Best Places in Tulum
        </h1>
        <p style={{ fontSize: 16, opacity: 0.7, margin: "0 0 32px", lineHeight: 1.5 }}>
          Curated guide to Tulum&apos;s best restaurants, beach clubs, and cultural attractions. From Michelin-starred fine dining to iconic beachfront venues.
        </p>

        {CATEGORY_ORDER.map(({ key, label, emoji }) => {
          const categoryPlaces = places.filter((p) => p.category === key);
          if (categoryPlaces.length === 0) return null;
          return (
            <section key={key} style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 16px" }}>
                {emoji} {label}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {categoryPlaces.map((place) => (
                  <Link
                    key={place.slug}
                    href={`/places/${place.slug}`}
                    style={{
                      display: "block",
                      padding: 16,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 12,
                      textDecoration: "none",
                      color: "#E8ECEF",
                      transition: "background 0.2s",
                    }}
                  >
                    <strong style={{ fontSize: 17, color: "#00CED1" }}>{place.name}</strong>
                    <p style={{ margin: "6px 0 0", fontSize: 14, opacity: 0.75, lineHeight: 1.4 }}>
                      {place.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <Link
          href="/map"
          style={{
            display: "block",
            textAlign: "center",
            padding: "14px 24px",
            background: "rgba(0, 206, 209, 0.15)",
            border: "1px solid rgba(0, 206, 209, 0.3)",
            borderRadius: 12,
            color: "#00CED1",
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
            marginTop: 16,
          }}
        >
          Explore All Places on Map
        </Link>
      </main>
    </>
  );
}

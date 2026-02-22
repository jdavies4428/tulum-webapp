import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPlaces, getPlaceBySlug, getPlacesByCategory } from "@/lib/place-slugs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export function generateStaticParams() {
  return getAllPlaces().map((place) => ({ slug: place.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const place = getPlaceBySlug(params.slug);
  if (!place) return {};

  const categoryTag = place.category === "restaurant" ? "Restaurant" : place.category === "beach-club" ? "Beach Club" : "Attraction";
  const title = `${place.name} - ${place.desc.split(",")[0]} | Tulum ${categoryTag}`;
  const description = `${place.name} in Tulum, Mexico: ${place.desc}. Get directions, contact info, and discover more ${categoryTag.toLowerCase()}s in Tulum.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/places/${place.slug}`,
      languages: {
        "en": `${BASE_URL}/places/${place.slug}`,
        "es": `${BASE_URL}/places/${place.slug}?lang=es`,
        "fr": `${BASE_URL}/places/${place.slug}?lang=fr`,
      },
    },
    openGraph: {
      title: `${place.name} - Tulum ${categoryTag}`,
      description,
      type: "website",
      url: `${BASE_URL}/places/${place.slug}`,
    },
  };
}

function getJsonLd(place: NonNullable<ReturnType<typeof getPlaceBySlug>>) {
  const base = {
    "@context": "https://schema.org",
    "name": place.name,
    "description": place.desc,
    "url": place.url || `${BASE_URL}/places/${place.slug}`,
    "telephone": place.whatsapp,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tulum",
      "addressRegion": "Quintana Roo",
      "addressCountry": "MX",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": place.lat,
      "longitude": place.lng,
    },
  };

  if (place.category === "restaurant") {
    return { ...base, "@type": "Restaurant", "servesCuisine": "Mexican" };
  }
  if (place.category === "beach-club") {
    return { ...base, "@type": "LocalBusiness", "additionalType": "BeachResort" };
  }
  return { ...base, "@type": "TouristAttraction" };
}

export default function PlacePage({ params }: { params: { slug: string } }) {
  const place = getPlaceBySlug(params.slug);
  if (!place) notFound();

  const related = getPlacesByCategory(place.category).filter((p) => p.slug !== place.slug);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${place.lat},${place.lng}&zoom=15&size=600x300&markers=color:red%7C${place.lat},${place.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Places", href: "/places" },
          { name: place.categoryLabel, href: `/places?category=${place.category}` },
          { name: place.name, href: `/places/${place.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLd(place)) }}
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
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 16, opacity: 0.7 }}>
          <Link href="/" style={{ color: "#00CED1", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/places" style={{ color: "#00CED1", textDecoration: "none" }}>Places</Link>
          {" / "}
          <span>{place.name}</span>
        </nav>

        {/* Category badge */}
        <span style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: 12,
          background: place.category === "restaurant" ? "rgba(255, 107, 107, 0.2)" : place.category === "beach-club" ? "rgba(0, 206, 209, 0.2)" : "rgba(147, 112, 219, 0.2)",
          color: place.category === "restaurant" ? "#FF6B6B" : place.category === "beach-club" ? "#00CED1" : "#9370DB",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 12,
        }}>
          {place.categoryLabel}
        </span>

        {/* Title */}
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 12px", lineHeight: 1.2 }}>
          {place.name}
        </h1>

        {/* Description */}
        <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9, margin: "0 0 24px" }}>
          {place.desc}
        </p>
        {place.descEs && (
          <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.6, margin: "0 0 8px" }}>
            <span style={{ fontWeight: 600 }}>ES:</span> {place.descEs}
          </p>
        )}
        {place.descFr && (
          <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.6, margin: "0 0 24px" }}>
            <span style={{ fontWeight: 600 }}>FR:</span> {place.descFr}
          </p>
        )}

        {/* Location info */}
        <section style={{
          background: "rgba(0, 206, 209, 0.08)",
          border: "1px solid rgba(0, 206, 209, 0.15)",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px" }}>Location & Contact</h2>
          <p style={{ margin: "0 0 8px", fontSize: 15 }}>
            Tulum, Quintana Roo, Mexico
          </p>
          <p style={{ margin: "0 0 8px", fontSize: 14, opacity: 0.7 }}>
            {place.lat.toFixed(4)}°N, {Math.abs(place.lng).toFixed(4)}°W
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                background: "#00CED1",
                color: "#0F1419",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Get Directions
            </a>
            {place.whatsapp && (
              <a
                href={`https://wa.me/${place.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  background: "#25D366",
                  color: "#FFF",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                WhatsApp
              </a>
            )}
            {place.url && (
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#E8ECEF",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                Website
              </a>
            )}
          </div>
        </section>

        {/* Map preview */}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
          <section style={{ marginBottom: 24 }}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={staticMapUrl}
                alt={`Map showing location of ${place.name} in Tulum`}
                width={600}
                height={300}
                style={{ width: "100%", height: "auto", borderRadius: 12 }}
              />
            </a>
          </section>
        )}

        {/* View on interactive map */}
        <Link
          href={`/map?lat=${place.lat}&lng=${place.lng}&zoom=17`}
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
            marginBottom: 32,
          }}
        >
          View on Interactive Map
        </Link>

        {/* Related places */}
        {related.length > 0 && (
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>
              Other {place.categoryLabel}s in Tulum
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/places/${r.slug}`}
                  style={{
                    display: "block",
                    padding: 16,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 12,
                    textDecoration: "none",
                    color: "#E8ECEF",
                  }}
                >
                  <strong style={{ fontSize: 16 }}>{r.name}</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.7 }}>{r.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

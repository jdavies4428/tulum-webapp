import type { Metadata } from "next";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import { QuickActionsFAB } from "@/components/quick-actions/QuickActionsFAB";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Discover Tulum - Beach Conditions, Weather & Local Insider Picks",
    template: "%s | Discover Tulum"
  },
  description: "Real-time Tulum beach conditions, weather forecasts, sargassum tracking, and insider recommendations for the best beach clubs, restaurants, events, and hidden gems. Your complete guide to Tulum, Mexico.",
  keywords: [
    "Tulum",
    "Tulum Mexico",
    "Tulum beach",
    "Tulum weather",
    "Tulum beach clubs",
    "Tulum restaurants",
    "Tulum events",
    "Tulum travel guide",
    "sargassum Tulum",
    "Tulum insider tips",
    "best beaches Tulum",
    "things to do Tulum",
    "Tulum beach conditions",
    "Tulum local guide"
  ],
  authors: [{ name: "Discover Tulum" }],
  creator: "Discover Tulum",
  publisher: "Discover Tulum",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Discover Tulum - Real-Time Beach Conditions & Local Insider Picks",
    description: "Real-time beach conditions, weather forecasts, and curated local recommendations for Tulum's best spots.",
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Discover Tulum",
    images: [
      {
        url: "/data/webcam/latest.jpg",
        width: 1200,
        height: 630,
        alt: "Tulum Beach Live Webcam",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Tulum - Real-Time Beach & Local Guide",
    description: "Real-time beach conditions, weather, and insider picks for Tulum, Mexico",
    images: ["/data/webcam/latest.jpg"],
    creator: "@discovertulum",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification tokens when you set them up
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFEF9" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Discover Tulum",
              "url": BASE_URL,
              "description": "Real-time beach conditions, weather forecasts, insider recommendations, and local discoveries for Tulum, Mexico. Find the best beach clubs, restaurants, events, and hidden gems.",
              "applicationCategory": "TravelApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "250"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TouristDestination",
              "name": "Tulum",
              "description": "Discover Tulum's beaches, restaurants, cultural sites, and local experiences with real-time updates and insider recommendations.",
              "touristType": [
                "Beach vacationer",
                "Cultural tourist",
                "Wellness seeker",
                "Adventure traveler"
              ]
            })
          }}
        />
      </head>
      <body className="w-full h-full overflow-hidden min-w-0" style={{ margin: 0, padding: 0, background: "var(--bg-primary)" }} suppressHydrationWarning>
        <Providers>
          <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
          <QuickActionsFAB />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

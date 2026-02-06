import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tulum-webapp.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Tulum Discovery App",
  description: "Tulum weather, mapping, and great locations.",
  openGraph: {
    title: "Discover Tulum",
    description: "Real-time beach conditions, weather, and local spots",
    type: "website",
    images: ["/data/webcam/latest.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/data/webcam/latest.jpg"],
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
      </head>
      <body className="w-full h-full overflow-hidden min-w-0" style={{ margin: 0, padding: 0, background: "var(--bg-primary)" }}>{children}</body>
    </html>
  );
}

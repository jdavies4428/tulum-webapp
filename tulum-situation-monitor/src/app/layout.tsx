import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tulum Discovery App",
  description: "Tulum weather, mapping, and great locations.",
  openGraph: {
    title: "Discover Tulum",
    description: "Real-time beach conditions, weather, and local spots",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="w-full h-full overflow-x-hidden min-w-0">{children}</body>
    </html>
  );
}

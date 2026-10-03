import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBarberShopSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  ...pageMetadata({ path: "/" }),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  applicationName: SITE.name,
  keywords: [
    "barber shop Calgary",
    "SE Calgary barber",
    "Midnapore barber",
    "men's haircut Calgary",
    "fade haircut Calgary",
    "beard trim Calgary",
    "hot towel shave Calgary",
  ],
  category: "Barber Shop",
  robots: { index: true, follow: true },
  other: {
    "geo.region": "CA-AB",
    "geo.placename": "Calgary",
    "geo.position": `${SITE.geo.latitude};${SITE.geo.longitude}`,
    ICBM: `${SITE.geo.latitude}, ${SITE.geo.longitude}`,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a08",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-CA" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <JsonLd data={buildBarberShopSchema()} />
      </head>
      <body>{children}</body>
    </html>
  );
}

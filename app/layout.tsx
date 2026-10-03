import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBarberShopSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html
      lang="en-CA"
      className={`dark ${display.variable} ${sans.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <head>
        <JsonLd data={buildBarberShopSchema()} />
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-gold-300 px-4 py-2 font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to Content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}

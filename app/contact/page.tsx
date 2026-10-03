import type { Metadata } from "next";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { HoursTable } from "@/components/contact/hours-table";
import { JsonLd } from "@/components/seo/json-ld";
import { LinktreeBanner } from "@/components/ui/linktree-banner";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { OpenStatusBadge } from "@/components/ui/open-status-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { DIRECTIONS_URL, MAP_EMBED_URL, SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact & Directions — Bannister Rd SE, Calgary",
  description:
    "Find Master M Barbershop at 15425 Bannister Rd SE #10, Calgary, AB T2X 3E9 (Midnapore). Call (403) 475-5662, see opening hours and get directions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <div className="container space-y-16 py-12 sm:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            as="h1"
            eyebrow="Visit the Shop"
            title="Find Us in SE Calgary"
            description="On Bannister Rd SE in the Midnapore area of SE Calgary."
          />
          <OpenStatusBadge />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-6">
            <section
              aria-labelledby="address-heading"
              className="rounded-3xl border hairline bg-ink-850 p-6 shadow-card sm:p-8"
            >
              <h2
                id="address-heading"
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gold-300"
              >
                <MapPin aria-hidden className="size-4" /> Address
              </h2>
              <address className="mt-4 text-lg not-italic leading-relaxed text-cream">
                <span translate="no">{SITE.name}</span>
                <br />
                {SITE.address.street}
                <br />
                {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
              </address>
              <div className="mt-6 flex flex-wrap gap-3">
                <MagneticButton href={DIRECTIONS_URL} external size="md">
                  <Navigation aria-hidden className="size-4" />
                  Get Directions
                  <span className="sr-only">(opens Google Maps in a new tab)</span>
                </MagneticButton>
                <MagneticButton href={SITE.phone.href} variant="secondary" size="md">
                  <Phone aria-hidden className="size-4" />
                  <span className="tabular">{SITE.phone.display}</span>
                </MagneticButton>
              </div>
            </section>

            <section
              aria-labelledby="hours-heading"
              className="rounded-3xl border hairline bg-ink-850 p-6 shadow-card sm:p-8"
            >
              <h2
                id="hours-heading"
                className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gold-300"
              >
                <Clock aria-hidden className="size-4" /> Hours
              </h2>
              <HoursTable />
              <p className="mt-4 text-xs text-cream-subtle">
                Hours shown in Calgary time (MT). Holiday hours may vary — call ahead.
              </p>
            </section>
          </div>

          <section
            aria-labelledby="map-heading"
            className="overflow-hidden rounded-3xl border hairline bg-ink-850 shadow-card"
          >
            <h2 id="map-heading" className="sr-only">
              Map
            </h2>
            <iframe
              title={`Map showing ${SITE.name} at ${SITE.address.singleLine}`}
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block aspect-[4/3] h-full min-h-80 w-full border-0 grayscale-[0.3] invert-[0.9] hue-rotate-180"
            />
          </section>
        </div>

        <LinktreeBanner />
      </div>
    </>
  );
}

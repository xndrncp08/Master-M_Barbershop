import type { Metadata } from "next";
import Link from "next/link";
import { CategoryTabs } from "@/components/services/category-tabs";
import { ServiceCard } from "@/components/services/service-card";
import { JsonLd } from "@/components/seo/json-ld";
import { LinktreeBanner } from "@/components/ui/linktree-banner";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  SERVICE_CATEGORIES,
  SERVICES,
  formatDuration,
  formatPrice,
  getServicesByCategory,
  resolveCategory,
} from "@/lib/services";

export const metadata: Metadata = pageMetadata({
  title: "Services & Prices — Fades, Beard Trims, Hot Towel Shaves",
  description:
    "Haircuts, skin fades, beard grooming and traditional hot towel shaves at Master M Barbershop, SE Calgary. Transparent CAD pricing — book online.",
  path: "/services",
});

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const category = resolveCategory((await searchParams).category);
  const services = getServicesByCategory(category);
  const categoryLabel = SERVICE_CATEGORIES.find((c) => c.id === category)!.label;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <div className="container space-y-20 py-12 sm:py-16">
        <section aria-labelledby="services-heading" className="space-y-8">
          <SectionHeading
            as="h1"
            id="services-heading"
            eyebrow="Services & Pricing"
            title="The Master M Menu"
            description="Every service includes a consultation & finishing style. Prices in CAD."
          />
          <CategoryTabs active={category} />
          <h2 className="sr-only">{categoryLabel} Services</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="service-grid">
            {services.map((service) => (
              <li key={service.id}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="price-list-heading" className="space-y-6">
          <SectionHeading id="price-list-heading" eyebrow="At a Glance" title="Full Price List" />
          <div className="overflow-hidden rounded-3xl border hairline bg-ink-850 shadow-card">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">All services with duration and price in Canadian dollars</caption>
              <thead className="border-b hairline text-xs uppercase tracking-[0.16em] text-gold-300">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">
                    Service
                  </th>
                  <th scope="col" className="hidden px-5 py-4 font-semibold sm:table-cell">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">
                    Time
                  </th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/5 tabular">
                {SERVICES.map((service) => (
                  <tr key={service.id} className="transition-colors duration-150 hover:bg-ink-800/60">
                    <th scope="row" className="px-5 py-4 font-medium text-cream">
                      <Link href={`/book?service=${service.id}`} className="hover:text-gold-200">
                        {service.name}
                      </Link>
                    </th>
                    <td className="hidden px-5 py-4 text-cream-muted sm:table-cell">
                      {SERVICE_CATEGORIES.find((c) => c.id === service.category)?.label}
                    </td>
                    <td className="px-5 py-4 text-right text-cream-muted">
                      {formatDuration(service.durationMin)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gold-200">
                      {formatPrice(service.priceCad)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            <MagneticButton href="/book">Reserve Your Spot</MagneticButton>
          </div>
        </section>

        <LinktreeBanner />
      </div>
    </>
  );
}

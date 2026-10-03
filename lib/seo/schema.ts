import { DAY_NAMES, WEEKLY_HOURS, toTime24, type DayIndex } from "@/lib/hours";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services";
import { DIRECTIONS_URL, SITE, absoluteUrl } from "@/lib/site";

type JsonLd = Record<string, unknown>;

/** Group days with identical hours into schema.org OpeningHoursSpecification entries. */
export function buildOpeningHours(): JsonLd[] {
  const groups = new Map<string, DayIndex[]>();
  for (const day of [1, 2, 3, 4, 5, 6, 0] as DayIndex[]) {
    const hours = WEEKLY_HOURS[day];
    if (!hours) continue;
    const key = `${hours.open}-${hours.close}`;
    groups.set(key, [...(groups.get(key) ?? []), day]);
  }
  return [...groups.entries()].map(([key, days]) => {
    const [open, close] = key.split("-").map(Number) as [number, number];
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.map((d) => `https://schema.org/${DAY_NAMES[d]}`),
      opens: toTime24(open),
      closes: toTime24(close),
    };
  });
}

export function buildOfferCatalog(): JsonLd {
  return {
    "@type": "OfferCatalog",
    name: "Barber Services",
    itemListElement: SERVICE_CATEGORIES.filter((c) => c.id !== "all").map((category) => ({
      "@type": "OfferCatalog",
      name: category.label,
      itemListElement: SERVICES.filter((s) => s.category === category.id).map((service) => ({
        "@type": "Offer",
        price: service.priceCad.toFixed(2),
        priceCurrency: "CAD",
        availability: "https://schema.org/InStock",
        url: absoluteUrl(`/book?service=${service.id}`),
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          serviceType: "Barber service",
        },
      })),
    })),
  };
}

export function buildBarberShopSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    "@id": absoluteUrl("/#barbershop"),
    name: SITE.name,
    description: SITE.description,
    url: absoluteUrl("/"),
    logo: absoluteUrl(SITE.logo.src512),
    image: [absoluteUrl(SITE.logo.src512), absoluteUrl("/og")],
    telephone: SITE.phone.schema,
    priceRange: SITE.priceRange,
    currenciesAccepted: "CAD",
    sameAs: [SITE.linktree],
    hasMap: DIRECTIONS_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    areaServed: [
      { "@type": "City", name: "Calgary" },
      { "@type": "Place", name: "Midnapore, Calgary" },
    ],
    openingHoursSpecification: buildOpeningHours(),
    hasOfferCatalog: buildOfferCatalog(),
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/book"),
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "Reservation", name: "Barber appointment" },
    },
  };
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Serialize for a <script type="application/ld+json"> without allowing tag break-out. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

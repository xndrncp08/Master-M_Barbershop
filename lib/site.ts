function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

function resolveRating(): { value: number; count: number } | undefined {
  const value = Number(process.env.NEXT_PUBLIC_GOOGLE_RATING);
  const count = Number(process.env.NEXT_PUBLIC_GOOGLE_REVIEW_COUNT);
  if (!Number.isFinite(value) || value <= 0 || value > 5) return undefined;
  if (!Number.isInteger(count) || count <= 0) return undefined;
  return { value, count };
}

const street = "15425 Bannister Rd SE #10";
const locality = "Calgary";
const region = "AB";
const postalCode = "T2X 3E9";

export const SITE = {
  name: "Master M Barbershop",
  shortName: "Master M",
  url: resolveSiteUrl(),
  tagline: "Precision Cuts. Master Barbering. Pure Style.",
  title: "Master M Barbershop | Premier Men's Barber Shop in SE Calgary, AB",
  description:
    "Top-rated barber shop in Midnapore / SE Calgary offering precision fades, beard sculpting, and traditional hot towel shaves. Book your appointment online.",
  phone: {
    display: "(403) 475-5662",
    href: "tel:+14034755662",
    schema: "+1-403-475-5662",
  },
  address: {
    street,
    locality,
    region,
    postalCode,
    country: "CA",
    neighbourhood: "Midnapore",
    singleLine: `${street}, ${locality}, ${region} ${postalCode}`,
  },
  geo: { latitude: 50.9085, longitude: -114.0682 },
  timeZone: "America/Edmonton",
  priceRange: "$$",
  linktree: "https://linktr.ee/MaterMabarbeeshop",
  /** Only shown when real numbers are configured via env — never invented. */
  rating: resolveRating(),
  logo: {
    src512: "/brand/master-m-logo-512.png",
    src192: "/brand/master-m-logo-192.png",
    alt: "Master M Barbershop emblem: gold crowned M with scissors, comb and barber pole",
  },
} as const;

export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${SITE.name}, ${SITE.address.singleLine}`,
)}`;

export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  `${SITE.name}, ${SITE.address.singleLine}`,
)}&output=embed`;

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE.url}/`).toString();
}

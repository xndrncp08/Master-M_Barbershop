import type { Metadata } from "next";
import { SITE } from "@/lib/site";

const OG_IMAGE = {
  url: "/og",
  width: 1200,
  height: 630,
  alt: `${SITE.name} — ${SITE.address.singleLine}`,
};

/**
 * Per-page metadata. Next.js replaces (not merges) nested `openGraph`/`twitter`
 * objects, so every page carries the full shared set here.
 */
export function pageMetadata({
  title,
  description = SITE.description,
  path,
}: {
  title?: string;
  description?: string;
  path: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE.name}` : SITE.title;
  return {
    title: title ?? { absolute: SITE.title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_CA",
      siteName: SITE.name,
      title: fullTitle,
      description,
      url: path,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

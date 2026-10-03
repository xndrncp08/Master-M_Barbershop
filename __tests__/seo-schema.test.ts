/* eslint-disable @typescript-eslint/no-explicit-any -- asserting on loosely-typed JSON-LD output */
import { describe, expect, it } from "vitest";
import { buildBarberShopSchema, buildBreadcrumbSchema, serializeJsonLd } from "@/lib/seo/schema";

describe("buildBarberShopSchema", () => {
  const schema = buildBarberShopSchema() as Record<string, any>;

  it("describes the Calgary barbershop", () => {
    expect(schema).toMatchObject({
      "@context": "https://schema.org",
      "@type": "BarberShop",
      name: "Master M Barbershop",
      telephone: "+1-403-475-5662",
      priceRange: "$$",
      sameAs: ["https://linktr.ee/MaterMabarbeeshop"],
      address: {
        streetAddress: "15425 Bannister Rd SE #10",
        addressLocality: "Calgary",
        addressRegion: "AB",
        postalCode: "T2X 3E9",
        addressCountry: "CA",
      },
      geo: { latitude: 50.9085, longitude: -114.0682 },
    });
  });

  it("groups opening hours", () => {
    expect(schema.openingHoursSpecification).toEqual([
      expect.objectContaining({ opens: "09:00", closes: "19:00", dayOfWeek: expect.arrayContaining(["https://schema.org/Monday", "https://schema.org/Friday"]) }),
      expect.objectContaining({ opens: "09:00", closes: "18:00", dayOfWeek: ["https://schema.org/Saturday"] }),
      expect.objectContaining({ opens: "10:00", closes: "17:00", dayOfWeek: ["https://schema.org/Sunday"] }),
    ]);
    expect(schema.openingHoursSpecification[0].dayOfWeek).toHaveLength(5);
  });

  it("lists priced CAD offers", () => {
    const offers = schema.hasOfferCatalog.itemListElement.flatMap((c: any) => c.itemListElement);
    const names = offers.map((o: any) => o.itemOffered.name);
    expect(names).toEqual(expect.arrayContaining(["Haircut", "Beard Trim", "Hot Towel Shave", "Fade & Line Up"]));
    for (const offer of offers) {
      expect(offer.priceCurrency).toBe("CAD");
      expect(offer.price).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it("does not invent ratings", () => {
    expect(schema).not.toHaveProperty("aggregateRating");
  });
});

describe("serializeJsonLd", () => {
  it("escapes characters that could break out of the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>&" });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>&" });
  });
});

describe("buildBreadcrumbSchema", () => {
  it("numbers items and uses absolute URLs", () => {
    const crumbs = buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Book", path: "/book" },
    ]) as Record<string, any>;
    expect(crumbs.itemListElement[1]).toMatchObject({ position: 2, name: "Book" });
    expect(crumbs.itemListElement[1].item).toMatch(/^https?:\/\/.+\/book$/);
  });
});

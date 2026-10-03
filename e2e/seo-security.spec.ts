import { expect, test } from "@playwright/test";

test("home page ships BarberShop JSON-LD and local metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Master M Barbershop | Premier Men's Barber Shop in SE Calgary, AB");
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(jsonLd ?? "{}");
  expect(data["@type"]).toBe("BarberShop");
  expect(data.address.postalCode).toBe("T2X 3E9");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og$/);
});

test("robots, sitemap and OG image are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /api/");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/book", "/services", "/contact"]) expect(sitemap).toContain(path);

  const og = await request.get("/og");
  expect(og.headers()["content-type"]).toContain("image/png");
});

test("security headers are set", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("booking API validates input", async ({ request }) => {
  const response = await request.post("/api/bookings", {
    data: { serviceId: "haircut" },
    headers: { "x-forwarded-for": "198.51.100.42" },
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).code).toBe("validation");
});

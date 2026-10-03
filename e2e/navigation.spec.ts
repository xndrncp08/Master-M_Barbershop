import { expect, test } from "@playwright/test";

test("services category tabs are deep-linkable", async ({ page }) => {
  await page.goto("/services?category=beard");
  const grid = page.getByTestId("service-grid");
  await expect(page.getByRole("link", { name: "Beard", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(grid.getByRole("heading", { name: "Beard Trim" })).toBeVisible();
  await expect(grid.getByRole("heading", { name: "Haircut" })).toHaveCount(0);

  await page.getByRole("link", { name: "Shaves", exact: true }).click();
  await expect(page).toHaveURL(/category=shave/);
  await expect(grid.getByRole("heading", { name: "Hot Towel Shave" })).toBeVisible();
});

test("service card Book link pre-selects the service", async ({ page }) => {
  await page.goto("/services?category=combos");
  await page.getByRole("link", { name: "Book Executive Combo" }).click();
  await expect(page).toHaveURL(/\/book\?service=executive-combo/);
  await expect(page.getByRole("heading", { name: "Choose Your Barber" })).toBeVisible();
});

test("contact page offers directions, phone and the social hub", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find Us in SE Calgary");
  await expect(page.getByRole("link", { name: /Get Directions/ })).toHaveAttribute(
    "href",
    /google\.com\/maps\/dir\/\?api=1&destination=/,
  );
  await expect(page.getByRole("link", { name: /\(403\) 475-5662/ }).first()).toHaveAttribute("href", "tel:+14034755662");
  await expect(page.getByRole("link", { name: /Open Social Hub/ })).toHaveAttribute(
    "href",
    "https://linktr.ee/MaterMabarbeeshop",
  );
  await expect(page.getByTestId("open-status")).toBeVisible();
});

test("primary navigation works on every viewport", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Services" }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Services" }).click();
  }
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Master M Menu");
});

test("each page has exactly one h1", async ({ page }) => {
  for (const path of ["/", "/services", "/book", "/contact"]) {
    await page.goto(path);
    await expect(page.locator("h1"), path).toHaveCount(1);
  }
});

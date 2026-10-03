import { expect, test } from "@playwright/test";

/** "YYYY-MM-DD" in Calgary, `offset` days from today. */
function calgaryDateKey(offset = 0): string {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton" }).format(new Date());
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

test("hero CTA → booking flow → confirmation with confetti", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Precision Cuts.");

  await page.getByTestId("hero-book-cta").click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole("heading", { name: "Choose Your Service" })).toBeVisible();

  // Step 1 — service
  await page.getByRole("radio", { name: /^Haircut/ }).check({ force: true });
  await expect(page).toHaveURL(/service=haircut/);
  await page.getByRole("button", { name: /continue/i }).click();

  // Step 2 — barber
  await expect(page).toHaveURL(/step=2/);
  await page.getByRole("radio", { name: /Any Available/ }).check({ force: true });
  await page.getByRole("button", { name: /continue/i }).click();

  // Step 3 — date & live time slot
  await expect(page).toHaveURL(/step=3/);
  await page.getByTestId(`date-${calgaryDateKey(1)}`).check({ force: true });
  const openSlot = page.locator('input[name="time"][data-state="available"]').first();
  await expect(openSlot).toBeAttached();
  await openSlot.check({ force: true });
  await expect(page).toHaveURL(/time=\d{2}%3A\d{2}/);
  await page.getByRole("button", { name: /continue/i }).click();

  // Step 4 — details
  await expect(page).toHaveURL(/step=4/);
  await page.getByLabel("Full Name").fill("Jordan Smith");
  await page.getByLabel("Phone").fill("403-555-0199");
  await page.getByLabel("Email").fill("jordan@example.com");
  await page.getByRole("button", { name: /confirm booking/i }).click();

  // Confirmation + confetti
  const dialog = page.getByTestId("booking-confirmation");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: /Booked/ })).toBeVisible();
  await expect(dialog).toContainText(/MM-[A-Z2-9]{6}/);
  await expect(page.getByTestId("confetti-canvas")).toHaveAttribute("data-fired", "true");

  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "Choose Your Service" })).toBeVisible();
});

test("validation errors appear next to fields and block submission", async ({ page }) => {
  const date = calgaryDateKey(2);
  await page.goto(`/book?service=beard-trim&barber=senior&date=${date}&step=3`);
  await page.locator('input[name="time"][data-state="available"]').first().check({ force: true });
  await page.getByRole("button", { name: /continue/i }).click();

  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: /confirm booking/i }).click();
  await expect(page.getByText("Enter your name (at least 2 characters).")).toBeVisible();
  await expect(page.getByText(/valid email/)).toBeVisible();
  await expect(page.getByLabel("Full Name")).toBeFocused();
  await expect(page.getByTestId("booking-confirmation")).toHaveCount(0);
});

test("browser Back returns to the previous booking step", async ({ page }) => {
  await page.goto("/book?service=hot-towel-shave");
  await expect(page.getByRole("heading", { name: "Choose Your Barber" })).toBeVisible();
  await page.getByRole("radio", { name: /Master Barber/ }).check({ force: true });
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.getByRole("heading", { name: "Pick a Time" })).toBeVisible();

  await page.goBack();
  await expect(page.getByRole("heading", { name: "Choose Your Barber" })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Master Barber/ })).toBeChecked();
});

import { beforeEach, describe, expect, it } from "vitest";
import { processBooking } from "@/lib/booking/service";
import { clearBookings } from "@/lib/booking/store";

const NOW = new Date("2026-10-03T20:50:00Z"); // Sat 14:50 Calgary
const request = {
  serviceId: "haircut",
  barberId: "master",
  date: "2026-10-04",
  time: "10:00",
  name: "Jordan Smith",
  phone: "(403) 555-0199",
  email: "jordan@example.com",
};

beforeEach(() => clearBookings());

describe("processBooking", () => {
  it("confirms a valid booking", async () => {
    const result = await processBooking(request, NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.booking).toMatchObject({
      serviceName: "Haircut",
      barberName: "Master Barber",
      date: "2026-10-04",
      time: "10:00",
      priceCad: 35,
    });
    expect(result.booking.reference).toMatch(/^MM-[A-Z2-9]{6}$/);
    expect(result.booking.whenLabel).toBe("Sunday, October 4 at 10:00 AM");
  });

  it("prevents double-booking the same chair", async () => {
    await processBooking(request, NOW);
    const second = await processBooking(request, NOW);
    expect(second).toMatchObject({ ok: false, code: "conflict" });
  });

  it("assigns 'any' to the next free chair until both are taken", async () => {
    await processBooking(request, NOW);
    const any = await processBooking({ ...request, barberId: "any" }, NOW);
    expect(any.ok && any.booking.barberName).toBe("Senior Stylist");
    expect(await processBooking({ ...request, barberId: "any" }, NOW)).toMatchObject({ code: "conflict" });
  });

  it("returns field errors for invalid input", async () => {
    const result = await processBooking({ ...request, email: "bad" }, NOW);
    expect(result).toMatchObject({ ok: false, code: "validation" });
    expect(!result.ok && result.fieldErrors?.email?.[0]).toMatch(/valid email/);
  });

  it("rejects slots that have passed", async () => {
    const result = await processBooking({ ...request, date: "2026-10-03", time: "14:00" }, NOW);
    expect(result).toMatchObject({ ok: false, code: "unavailable" });
  });

  it("silently rejects honeypot submissions", async () => {
    const result = await processBooking({ ...request, company: "bot" }, NOW);
    expect(result).toMatchObject({ ok: false, code: "spam" });
    expect(!result.ok && result.fieldErrors).toBeFalsy();
  });
});

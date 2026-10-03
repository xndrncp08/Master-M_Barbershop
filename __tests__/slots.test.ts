import { describe, expect, it } from "vitest";
import { checkSlot, getBookableDates, getSlots, resolveChair, type Appointment } from "@/lib/booking/slots";

// Saturday 2026-10-03, 14:50 in Calgary (MDT, UTC−6).
const NOW = new Date("2026-10-03T20:50:00Z");

describe("getSlots", () => {
  it("marks slots inside the 30-minute lead time as past", () => {
    const slots = getSlots({ dateKey: "2026-10-03", barberId: "any", durationMin: 30, appointments: [], now: NOW });
    expect(slots).toHaveLength(18); // 9:00 → 17:30
    expect(slots.filter((s) => s.state === "past").map((s) => s.time).at(-1)).toBe("15:00");
    expect(slots.find((s) => s.state === "available")?.time).toBe("15:30");
  });

  it("stops slots so the service ends by closing time", () => {
    const slots = getSlots({ dateKey: "2026-10-04", barberId: "any", durationMin: 75, appointments: [], now: NOW });
    expect(slots.at(-1)?.time).toBe("15:30"); // Sunday closes 17:00
  });

  it("shows a slot as booked only when every eligible chair is taken", () => {
    const master: Appointment = { barberId: "master", dateKey: "2026-10-04", start: 600, durationMin: 30 };
    const senior: Appointment = { ...master, barberId: "senior" };
    const state = (barberId: "any" | "master" | "senior", appointments: Appointment[]) =>
      getSlots({ dateKey: "2026-10-04", barberId, durationMin: 30, appointments, now: NOW }).find(
        (s) => s.time === "10:00",
      )?.state;

    expect(state("master", [master])).toBe("booked");
    expect(state("any", [master])).toBe("available");
    expect(state("any", [master, senior])).toBe("booked");
  });

  it("blocks overlapping starts for longer services", () => {
    const appointments: Appointment[] = [{ barberId: "master", dateKey: "2026-10-04", start: 630, durationMin: 30 }];
    const slots = getSlots({ dateKey: "2026-10-04", barberId: "master", durationMin: 45, appointments, now: NOW });
    expect(slots.find((s) => s.time === "10:00")?.state).toBe("booked"); // 10:00–10:45 overlaps 10:30
    expect(slots.find((s) => s.time === "11:00")?.state).toBe("available");
  });

  it("returns no slots outside the booking window", () => {
    expect(getSlots({ dateKey: "2026-10-30", barberId: "any", durationMin: 30, appointments: [], now: NOW })).toEqual([]);
  });
});

describe("resolveChair", () => {
  it("seats 'any' in the first free chair", () => {
    const taken: Appointment[] = [{ barberId: "master", dateKey: "2026-10-04", start: 600, durationMin: 30 }];
    expect(resolveChair("any", "2026-10-04", 600, 30, taken)).toBe("senior");
    expect(resolveChair("master", "2026-10-04", 600, 30, taken)).toBeNull();
  });
});

describe("checkSlot", () => {
  it("accepts a valid future slot", () => {
    expect(checkSlot("2026-10-04", "10:00", 30, NOW)).toEqual({ ok: true, start: 600 });
  });

  it.each([
    ["2026-10-20", "10:00", 30, "invalid-date"],
    ["2026-10-04", "10:15", 30, "off-grid"],
    ["2026-10-04", "09:00", 30, "out-of-hours"],
    ["2026-10-03", "17:30", 75, "out-of-hours"],
    ["2026-10-03", "14:00", 30, "past"],
  ] as const)("rejects %s %s (%i min) as %s", (date, time, duration, reason) => {
    expect(checkSlot(date, time, duration, NOW)).toEqual({ ok: false, reason });
  });
});

describe("getBookableDates", () => {
  it("lists 14 consecutive Calgary dates starting today", () => {
    const dates = getBookableDates(NOW);
    expect(dates).toHaveLength(14);
    expect(dates[0]).toBe("2026-10-03");
    expect(dates.at(-1)).toBe("2026-10-16");
  });
});

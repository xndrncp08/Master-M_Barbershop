import { describe, expect, it } from "vitest";
import { addDays, dayOfWeek, daysBetween, getOpenStatus, getZonedNow, parseDateKey } from "@/lib/time";

const NBSP = " ";

describe("getZonedNow", () => {
  it("converts UTC to Calgary daylight time (UTC−6) in summer", () => {
    // 2026-10-03 is a Saturday; 16:00 UTC = 10:00 MDT.
    expect(getZonedNow(new Date("2026-10-03T16:00:00Z"))).toEqual({
      dateKey: "2026-10-03",
      day: 6,
      minutes: 10 * 60,
    });
  });

  it("converts UTC to Calgary standard time (UTC−7) in winter", () => {
    expect(getZonedNow(new Date("2026-01-10T16:00:00Z"))).toEqual({
      dateKey: "2026-01-10",
      day: 6,
      minutes: 9 * 60,
    });
  });

  it("rolls the Calgary date back across UTC midnight", () => {
    // 03:30 UTC Sunday is still 21:30 Saturday in Calgary.
    const now = getZonedNow(new Date("2026-10-04T03:30:00Z"));
    expect(now.dateKey).toBe("2026-10-03");
    expect(now.day).toBe(6);
    expect(now.minutes).toBe(21 * 60 + 30);
  });
});

describe("getOpenStatus", () => {
  it("reports open with closing time during Saturday hours", () => {
    const status = getOpenStatus(new Date("2026-10-03T16:00:00Z")); // Sat 10:00
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe("OPEN NOW in SE Calgary");
    expect(status.detail).toBe(`Closes 6:00${NBSP}PM`);
  });

  it("reports closed before opening, opening later today", () => {
    const status = getOpenStatus(new Date("2026-10-05T13:00:00Z")); // Mon 07:00
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe(`CLOSED – Opens 9:00${NBSP}AM`);
  });

  it("reports the next day's opening after close", () => {
    const status = getOpenStatus(new Date("2026-10-04T00:30:00Z")); // Sat 18:30
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe(`CLOSED – Opens Tomorrow 10:00${NBSP}AM`);
  });

  it("treats closing time as closed (end-exclusive)", () => {
    const status = getOpenStatus(new Date("2026-10-06T01:00:00Z")); // Mon 19:00
    expect(status.isOpen).toBe(false);
  });

  it("is open on Sunday from 10 AM", () => {
    expect(getOpenStatus(new Date("2026-10-04T15:59:00Z")).isOpen).toBe(false); // Sun 09:59
    expect(getOpenStatus(new Date("2026-10-04T16:00:00Z")).isOpen).toBe(true); // Sun 10:00
  });
});

describe("date key helpers", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("computes weekday and day differences", () => {
    expect(dayOfWeek("2026-10-04")).toBe(0);
    expect(daysBetween("2026-10-03", "2026-10-17")).toBe(14);
  });

  it("rejects impossible dates", () => {
    expect(parseDateKey("2026-02-30")).toBeNull();
    expect(parseDateKey("2026-13-01")).toBeNull();
    expect(parseDateKey("not-a-date")).toBeNull();
    expect(parseDateKey("2026-02-28")).toEqual({ year: 2026, month: 2, day: 28 });
  });
});

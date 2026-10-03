import { describe, expect, it } from "vitest";
import {
  parseBookingParams,
  serializeBookingParams,
  updateBookingParams,
} from "@/lib/booking/params";

describe("parseBookingParams", () => {
  it("starts at step 1 with no selection", () => {
    expect(parseBookingParams(new URLSearchParams())).toEqual({ step: 1 });
  });

  it("infers the next step from a service deep link", () => {
    expect(parseBookingParams(new URLSearchParams("service=haircut"))).toEqual({ step: 2, service: "haircut" });
  });

  it("clamps a requested step that skips required selections", () => {
    const params = parseBookingParams(new URLSearchParams("step=4&service=haircut"));
    expect(params.step).toBe(2);
  });

  it("honours an earlier requested step for back navigation", () => {
    const params = parseBookingParams(
      new URLSearchParams("step=1&service=haircut&barber=master&date=2026-10-04&time=10:00"),
    );
    expect(params.step).toBe(1);
    expect(params.time).toBe("10:00");
  });

  it("drops invalid values", () => {
    const params = parseBookingParams(
      new URLSearchParams("service=perm&barber=nobody&date=2026-02-30&time=10:00&step=abc"),
    );
    expect(params).toEqual({ step: 1 });
  });

  it("ignores a time without a date", () => {
    expect(parseBookingParams(new URLSearchParams("service=haircut&barber=any&time=10:00"))).toEqual({
      step: 3,
      service: "haircut",
      barber: "any",
    });
  });

  it("accepts a plain record (server searchParams)", () => {
    expect(parseBookingParams({ service: ["beard-trim", "haircut"], barber: "senior" })).toEqual({
      step: 3,
      service: "beard-trim",
      barber: "senior",
    });
  });
});

describe("serializeBookingParams", () => {
  it("writes a stable, shareable order and round-trips", () => {
    const state = { step: 4 as const, time: "10:00", date: "2026-10-04", barber: "any" as const, service: "haircut" as const };
    const query = serializeBookingParams(state);
    expect(query).toBe("step=4&service=haircut&barber=any&date=2026-10-04&time=10%3A00");
    expect(parseBookingParams(new URLSearchParams(query))).toEqual(state);
  });
});

describe("updateBookingParams", () => {
  const full = {
    step: 4 as const,
    service: "haircut" as const,
    barber: "master" as const,
    date: "2026-10-04",
    time: "10:00",
  };

  it("clears the chosen time when the service changes", () => {
    const next = updateBookingParams(full, { service: "executive-combo" });
    expect(next.time).toBeUndefined();
    expect(next.step).toBe(3);
  });

  it("clears the chosen time when the barber or date changes", () => {
    expect(updateBookingParams(full, { barber: "senior" }).time).toBeUndefined();
    expect(updateBookingParams(full, { date: "2026-10-05" }).time).toBeUndefined();
  });

  it("keeps the time when re-selecting the same service", () => {
    expect(updateBookingParams(full, { service: "haircut" }).time).toBe("10:00");
  });
});

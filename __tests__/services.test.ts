import { describe, expect, it } from "vitest";
import {
  SERVICES,
  formatDuration,
  formatPrice,
  getServicesByCategory,
  resolveCategory,
} from "@/lib/services";

describe("resolveCategory", () => {
  it.each([
    ["beard", "beard"],
    ["  CUTS ", "cuts"],
    [["combos", "beard"], "combos"],
    ["unknown", "all"],
    [undefined, "all"],
    [null, "all"],
  ] as const)("resolves %j to %s", (input, expected) => {
    expect(resolveCategory(input as string | string[] | null | undefined)).toBe(expected);
  });
});

describe("getServicesByCategory", () => {
  it("returns every service for 'all'", () => {
    expect(getServicesByCategory("all")).toHaveLength(SERVICES.length);
  });

  it("filters to a single category", () => {
    const shaves = getServicesByCategory("shave");
    expect(shaves.length).toBeGreaterThan(0);
    expect(shaves.every((s) => s.category === "shave")).toBe(true);
  });

  it("includes the four schema-listed services", () => {
    const names = SERVICES.map((s) => s.name);
    expect(names).toEqual(expect.arrayContaining(["Haircut", "Beard Trim", "Hot Towel Shave", "Fade & Line Up"]));
  });
});

describe("formatting", () => {
  it("formats CAD prices without decimals", () => {
    expect(formatPrice(35)).toBe("$35");
  });

  it("formats durations with non-breaking spaces", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(75)).toBe("1 hr 15 min");
    expect(formatDuration(60)).toBe("1 hr");
  });
});

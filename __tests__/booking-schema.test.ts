import { describe, expect, it } from "vitest";
import {
  bookingRequestSchema,
  customerSchema,
  normalizePhone,
  sanitizeText,
} from "@/lib/booking/schema";

const valid = { name: "Jordan Smith", phone: "403-555-0199", email: "Jordan@Example.com" };

describe("customerSchema", () => {
  it("normalizes phone, email and optional notes", () => {
    const result = customerSchema.parse({ ...valid, notes: "  Low fade  " });
    expect(result).toMatchObject({
      name: "Jordan Smith",
      phone: "(403) 555-0199",
      email: "jordan@example.com",
      notes: "Low fade",
    });
  });

  it("returns a helpful message for each invalid field", () => {
    const result = customerSchema.safeParse({ name: " ", phone: "12345", email: "nope" });
    expect(result.success).toBe(false);
    const messages = Object.fromEntries(result.error!.issues.map((i) => [i.path[0], i.message]));
    expect(messages.name).toMatch(/Enter your name/);
    expect(messages.phone).toMatch(/10-digit phone number/);
    expect(messages.email).toMatch(/valid email/);
  });

  it("strips markup characters from free text", () => {
    expect(customerSchema.parse({ ...valid, name: "<script>Jo</script>" }).name).toBe("scriptJo/script");
  });

  it("rejects overly long notes", () => {
    expect(customerSchema.safeParse({ ...valid, notes: "x".repeat(501) }).success).toBe(false);
  });

  it("accepts the honeypot field without a field-level error (rejected later by the service)", () => {
    expect(customerSchema.safeParse({ ...valid, company: "Spam Inc" }).success).toBe(true);
  });
});

describe("normalizePhone", () => {
  it.each([
    ["(403) 475-5662", "4034755662"],
    ["+1 403 475 5662", "4034755662"],
    ["403.475.5662", "4034755662"],
  ])("accepts %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["475-5662", "003-475-5662", "403-175-5662", "+44 20 7946 0958"])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("sanitizeText", () => {
  it("removes control characters and collapses spaces", () => {
    expect(sanitizeText("  Hi\u0000   there\u0007 ")).toBe("Hi there");
  });
});

describe("bookingRequestSchema", () => {
  it("requires a known service and barber", () => {
    const result = bookingRequestSchema.safeParse({
      ...valid,
      serviceId: "perm",
      barberId: "robot",
      date: "2026-10-04",
      time: "10:00",
    });
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map((i) => i.path[0]);
    expect(paths).toEqual(expect.arrayContaining(["serviceId", "barberId"]));
  });

  it("rejects malformed date and time", () => {
    const result = bookingRequestSchema.safeParse({
      ...valid,
      serviceId: "haircut",
      barberId: "any",
      date: "04/10/2026",
      time: "25:00",
    });
    expect(result.success).toBe(false);
  });
});

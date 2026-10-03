import { z } from "zod";
import { SERVICE_IDS } from "@/lib/services";
import { BARBER_IDS } from "./barbers";

/** Strip control characters and angle brackets from free text. */
export function sanitizeText(value: string): string {
  return (
    value
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/[<>]/g, "")
      .replace(/[ \t]+/g, " ")
      .trim()
  );
}

/** Normalize a North American phone number to 10 digits, or return null. */
export function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return null;
  // NANP: area code and exchange can't start with 0 or 1.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null;
  return national;
}

export function formatPhone(national: string): string {
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

export const selectionSchema = z.object({
  serviceId: z.enum(SERVICE_IDS, { error: "Choose a service." }),
  barberId: z.enum(BARBER_IDS, { error: "Choose a barber." }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a time."),
});

export const customerSchema = z.object({
  name: z
    .string({ error: "Enter your name." })
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(2, "Enter your name (at least 2 characters).")
        .max(80, "Use 80 characters or fewer for your name."),
    ),
  phone: z
    .string({ error: "Enter your phone number." })
    .trim()
    .min(1, "Enter your phone number.")
    .transform((value, ctx) => {
      const national = normalizePhone(value);
      if (!national) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a 10-digit phone number, like (403) 555-0123.",
        });
        return z.NEVER;
      }
      return formatPhone(national);
    }),
  email: z
    .string({ error: "Enter your email." })
    .trim()
    .toLowerCase()
    .min(1, "Enter your email.")
    .max(254, "Use a shorter email address.")
    .pipe(z.email("Enter a valid email, like name@example.com.")),
  notes: z
    .string()
    .max(500, "Keep notes under 500 characters.")
    .optional()
    .transform((value) => (value ? sanitizeText(value) : "")),
  /**
   * Honeypot: real visitors never see or fill this field. Accepted here so bots
   * get no field-level hint; the booking service rejects non-empty values.
   */
  company: z.string().max(200).optional(),
});

export const bookingRequestSchema = selectionSchema.extend(customerSchema.shape);

export type BookingSelection = z.infer<typeof selectionSchema>;
export type CustomerInput = z.input<typeof customerSchema>;
export type CustomerDetails = z.output<typeof customerSchema>;
export type BookingRequestInput = z.input<typeof bookingRequestSchema>;
export type BookingRequest = z.output<typeof bookingRequestSchema>;

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  barber: z.enum(BARBER_IDS),
  service: z.enum(SERVICE_IDS),
});

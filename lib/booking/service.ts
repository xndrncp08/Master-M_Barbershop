import "server-only";
import { z } from "zod";
import { getService } from "@/lib/services";
import { formatDateKey } from "@/lib/time";
import { toTimeLabel } from "@/lib/hours";
import { getBarber } from "./barbers";
import { bookingRequestSchema } from "./schema";
import { checkSlot, getSlots, resolveChair, type Slot } from "./slots";
import { generateReference, insertBooking, listAppointments, type BookingRecord } from "./store";

export interface BookingConfirmation {
  reference: string;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  /** e.g. "Saturday, October 4 at 2:30 PM" */
  whenLabel: string;
  durationMin: number;
  priceCad: number;
  name: string;
}

export type BookingResult =
  | { ok: true; booking: BookingConfirmation }
  | {
      ok: false;
      code: "validation" | "unavailable" | "conflict" | "spam";
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

const SLOT_ERRORS = {
  "invalid-date": "That date isn't open for booking. Pick a date within the next 2 weeks.",
  closed: "We're closed that day. Pick another date.",
  "out-of-hours": "That time is outside opening hours. Pick another time.",
  past: "That time has already passed. Pick a later time.",
  "off-grid": "That time isn't a valid appointment slot. Pick a time from the list.",
} as const;

/** Validate, check availability and record a booking. Shared by the server action and API route. */
export async function processBooking(raw: unknown, now: Date = new Date()): Promise<BookingResult> {
  const parsed = bookingRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      error: "Check the highlighted fields and try again.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const request = parsed.data;
  if (request.company) {
    // Honeypot tripped: respond like a validation failure without revealing why.
    return { ok: false, code: "spam", error: "We couldn't process that booking. Call us to book." };
  }

  const service = getService(request.serviceId)!;
  const slot = checkSlot(request.date, request.time, service.durationMin, now);
  if (!slot.ok) return { ok: false, code: "unavailable", error: SLOT_ERRORS[slot.reason] };

  const appointments = listAppointments(request.date);
  const chair = resolveChair(request.barberId, request.date, slot.start, service.durationMin, appointments);
  if (!chair) {
    return {
      ok: false,
      code: "conflict",
      error: "Someone just booked that time. Pick another slot.",
    };
  }

  const record: BookingRecord = {
    reference: generateReference(),
    serviceId: service.id,
    requestedBarberId: request.barberId,
    barberId: chair,
    dateKey: request.date,
    start: slot.start,
    durationMin: service.durationMin,
    name: request.name,
    phone: request.phone,
    email: request.email,
    notes: request.notes,
    createdAt: now.toISOString(),
  };
  insertBooking(record);
  await notifyShop(record);

  return {
    ok: true,
    booking: {
      reference: record.reference,
      serviceName: service.name,
      barberName: getBarber(chair)!.name,
      date: record.dateKey,
      time: request.time,
      whenLabel: `${formatDateKey(record.dateKey)} at ${toTimeLabel(record.start)}`,
      durationMin: service.durationMin,
      priceCad: service.priceCad,
      name: record.name,
    },
  };
}

export function getAvailability(query: {
  date: string;
  barber: Parameters<typeof resolveChair>[0];
  service: string;
  now?: Date;
}): Slot[] {
  const service = getService(query.service);
  if (!service) return [];
  return getSlots({
    dateKey: query.date,
    barberId: query.barber,
    durationMin: service.durationMin,
    appointments: listAppointments(query.date),
    now: query.now,
  });
}

/**
 * Forward new bookings to the shop (e.g. a Zapier/Make/Slack webhook) when
 * BOOKING_WEBHOOK_URL is configured. Failures are logged, never surfaced.
 */
async function notifyShop(record: BookingRecord): Promise<void> {
  const url = process.env.BOOKING_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "booking.created", booking: record }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    console.error("[booking] webhook delivery failed", error);
  }
}

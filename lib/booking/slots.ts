import { WEEKLY_HOURS, toTime24, toTimeLabel } from "@/lib/hours";
import { addDays, dayOfWeek, daysBetween, getZonedNow, parseDateKey } from "@/lib/time";
import { CHAIR_BARBER_IDS, type BarberId, type ChairBarberId } from "./barbers";

export const SLOT_INTERVAL_MIN = 30;
/** Earliest bookable slot is at least this far from now. */
export const BOOKING_LEAD_MIN = 30;
/** How many days ahead (including today) can be booked. */
export const BOOKING_WINDOW_DAYS = 14;

export type SlotState = "available" | "booked" | "past";

export interface Slot {
  time: string;
  label: string;
  state: SlotState;
}

export interface Appointment {
  barberId: ChairBarberId;
  dateKey: string;
  /** Minutes after midnight. */
  start: number;
  durationMin: number;
}

export function timeToMinutes(time: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function overlaps(aStart: number, aDuration: number, bStart: number, bDuration: number) {
  return aStart < bStart + bDuration && bStart < aStart + aDuration;
}

export function isChairFree(
  barberId: ChairBarberId,
  dateKey: string,
  start: number,
  durationMin: number,
  appointments: readonly Appointment[],
): boolean {
  return !appointments.some(
    (a) =>
      a.barberId === barberId &&
      a.dateKey === dateKey &&
      overlaps(start, durationMin, a.start, a.durationMin),
  );
}

/** Chair to seat a client in, or null if nobody is free. */
export function resolveChair(
  barberId: BarberId,
  dateKey: string,
  start: number,
  durationMin: number,
  appointments: readonly Appointment[],
): ChairBarberId | null {
  const candidates = barberId === "any" ? CHAIR_BARBER_IDS : [barberId];
  return candidates.find((id) => isChairFree(id, dateKey, start, durationMin, appointments)) ?? null;
}

/** Bookable dates (Calgary calendar) from today through the booking window. */
export function getBookableDates(now: Date = new Date()): string[] {
  const today = getZonedNow(now).dateKey;
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => addDays(today, i)).filter(
    (key) => WEEKLY_HOURS[dayOfWeek(key)] !== null,
  );
}

export function isDateInWindow(dateKey: string, now: Date = new Date()): boolean {
  if (!parseDateKey(dateKey)) return false;
  const offset = daysBetween(getZonedNow(now).dateKey, dateKey);
  return offset >= 0 && offset < BOOKING_WINDOW_DAYS;
}

/** Every slot for a date with its live state. */
export function getSlots({
  dateKey,
  barberId,
  durationMin,
  appointments,
  now = new Date(),
}: {
  dateKey: string;
  barberId: BarberId;
  durationMin: number;
  appointments: readonly Appointment[];
  now?: Date;
}): Slot[] {
  if (!isDateInWindow(dateKey, now)) return [];
  const hours = WEEKLY_HOURS[dayOfWeek(dateKey)];
  if (!hours) return [];

  const zonedNow = getZonedNow(now);
  const cutoff = dateKey === zonedNow.dateKey ? zonedNow.minutes + BOOKING_LEAD_MIN : -Infinity;

  const slots: Slot[] = [];
  for (let start = hours.open; start + durationMin <= hours.close; start += SLOT_INTERVAL_MIN) {
    let state: SlotState = "available";
    if (start < cutoff) state = "past";
    else if (!resolveChair(barberId, dateKey, start, durationMin, appointments)) state = "booked";
    slots.push({ time: toTime24(start), label: toTimeLabel(start), state });
  }
  return slots;
}

/** First date that still has an open slot, for a sensible default selection. */
export function getFirstOpenDate(
  durationMin: number,
  barberId: BarberId,
  appointments: readonly Appointment[],
  now: Date = new Date(),
): string | undefined {
  return getBookableDates(now).find((dateKey) =>
    getSlots({ dateKey, barberId, durationMin, appointments, now }).some((s) => s.state === "available"),
  );
}

export type SlotCheck =
  | { ok: true; start: number }
  | { ok: false; reason: "invalid-date" | "closed" | "out-of-hours" | "past" | "off-grid" };

/** Validate a requested date/time against hours, lead time and the slot grid. */
export function checkSlot(dateKey: string, time: string, durationMin: number, now: Date = new Date()): SlotCheck {
  if (!isDateInWindow(dateKey, now)) return { ok: false, reason: "invalid-date" };
  const hours = WEEKLY_HOURS[dayOfWeek(dateKey)];
  if (!hours) return { ok: false, reason: "closed" };
  const start = timeToMinutes(time);
  if (start === null) return { ok: false, reason: "off-grid" };
  if ((start - hours.open) % SLOT_INTERVAL_MIN !== 0) return { ok: false, reason: "off-grid" };
  if (start < hours.open || start + durationMin > hours.close) return { ok: false, reason: "out-of-hours" };
  const zonedNow = getZonedNow(now);
  if (dateKey === zonedNow.dateKey && start < zonedNow.minutes + BOOKING_LEAD_MIN) {
    return { ok: false, reason: "past" };
  }
  return { ok: true, start };
}

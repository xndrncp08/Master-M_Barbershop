import { SERVICE_IDS, type ServiceId } from "@/lib/services";
import { parseDateKey } from "@/lib/time";
import { BARBER_IDS, type BarberId } from "./barbers";

export const BOOKING_STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Barber" },
  { id: 3, label: "Time" },
  { id: 4, label: "Details" },
] as const;

export type BookingStep = (typeof BOOKING_STEPS)[number]["id"];

export interface BookingParams {
  step: BookingStep;
  service?: ServiceId;
  barber?: BarberId;
  date?: string;
  time?: string;
}

type ParamSource =
  | URLSearchParams
  | { get(name: string): string | null }
  | Record<string, string | string[] | undefined>;

function read(source: ParamSource, key: string): string | undefined {
  if (typeof (source as URLSearchParams).get === "function") {
    return (source as URLSearchParams).get(key) ?? undefined;
  }
  const value = (source as Record<string, string | string[] | undefined>)[key];
  return Array.isArray(value) ? value[0] : value;
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Furthest step the selection so far allows the visitor to reach. */
export function maxReachableStep(params: Omit<BookingParams, "step">): BookingStep {
  if (!params.service) return 1;
  if (!params.barber) return 2;
  if (!params.date || !params.time) return 3;
  return 4;
}

/**
 * Parse booking state from the URL. Invalid values are dropped, and the step is
 * clamped so a deep link can never skip past a missing selection.
 */
export function parseBookingParams(source: ParamSource): BookingParams {
  const serviceRaw = read(source, "service");
  const barberRaw = read(source, "barber");
  const dateRaw = read(source, "date");
  const timeRaw = read(source, "time");

  const service = SERVICE_IDS.includes(serviceRaw as ServiceId) ? (serviceRaw as ServiceId) : undefined;
  const barber = BARBER_IDS.includes(barberRaw as BarberId) ? (barberRaw as BarberId) : undefined;
  const date = dateRaw && parseDateKey(dateRaw) ? dateRaw : undefined;
  const time = date && timeRaw && TIME.test(timeRaw) ? timeRaw : undefined;

  const selection = { service, barber, date, time };
  const max = maxReachableStep(selection);
  const requested = Number(read(source, "step"));
  const step = (
    Number.isInteger(requested) && requested >= 1 ? Math.min(requested, max) : max
  ) as BookingStep;

  return { step, ...stripUndefined(selection) };
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Serialize booking state in a stable order for shareable URLs. */
export function serializeBookingParams(params: Partial<BookingParams>): string {
  const search = new URLSearchParams();
  if (params.step) search.set("step", String(params.step));
  if (params.service) search.set("service", params.service);
  if (params.barber) search.set("barber", params.barber);
  if (params.date) search.set("date", params.date);
  if (params.date && params.time) search.set("time", params.time);
  return search.toString();
}

/**
 * Apply a change to the booking state. Changing the service or barber clears
 * the chosen time because slot availability depends on both.
 */
export function updateBookingParams(
  current: BookingParams,
  patch: Partial<BookingParams>,
): BookingParams {
  const next: BookingParams = { ...current, ...patch };
  const serviceChanged = patch.service !== undefined && patch.service !== current.service;
  const barberChanged = patch.barber !== undefined && patch.barber !== current.barber;
  const dateChanged = patch.date !== undefined && patch.date !== current.date;
  if ((serviceChanged || barberChanged || dateChanged) && patch.time === undefined) {
    delete next.time;
  }
  const max = maxReachableStep(next);
  next.step = Math.min(next.step, max) as BookingStep;
  return next;
}

import "server-only";
import type { Appointment } from "./slots";

export interface BookingRecord extends Appointment {
  reference: string;
  serviceId: string;
  requestedBarberId: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: string;
}

/**
 * Appointment storage.
 *
 * Kept in process memory (surviving dev hot reloads via globalThis) so the
 * booking flow works end to end without infrastructure. Replace with a
 * database or the shop's booking system before relying on it in production.
 */
interface Store {
  bookings: BookingRecord[];
}

const globalStore = globalThis as typeof globalThis & { __masterMBookings?: Store };
const store: Store = (globalStore.__masterMBookings ??= { bookings: [] });

export function listAppointments(dateKey?: string): Appointment[] {
  return store.bookings
    .filter((b) => dateKey === undefined || b.dateKey === dateKey)
    .map(({ barberId, dateKey: day, start, durationMin }) => ({
      barberId,
      dateKey: day,
      start,
      durationMin,
    }));
}

export function insertBooking(record: BookingRecord): void {
  store.bookings.push(record);
}

export function clearBookings(): void {
  store.bookings = [];
}

export function generateReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `MM-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

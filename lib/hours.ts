/** Day index follows `Date#getDay()`: 0 = Sunday … 6 = Saturday. */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DayHours {
  /** Opening time in minutes after midnight (local Calgary time). */
  open: number;
  /** Closing time in minutes after midnight (local Calgary time). */
  close: number;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const h = (hours: number, minutes = 0) => hours * 60 + minutes;

export const WEEKLY_HOURS: Record<DayIndex, DayHours | null> = {
  0: { open: h(10), close: h(17) },
  1: { open: h(9), close: h(19) },
  2: { open: h(9), close: h(19) },
  3: { open: h(9), close: h(19) },
  4: { open: h(9), close: h(19) },
  5: { open: h(9), close: h(19) },
  6: { open: h(9), close: h(18) },
};

/** "HH:mm" (24h) — the format used by schema.org and the booking API. */
export function toTime24(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** "9:00 AM" style label for display. */
export function toTimeLabel(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${String(mm).padStart(2, "0")} ${period}`;
}

/** Rows for display, Monday first, merging consecutive days with equal hours. */
export function getHoursRows(): { label: string; days: DayIndex[]; hours: DayHours | null }[] {
  const order: DayIndex[] = [1, 2, 3, 4, 5, 6, 0];
  const rows: { days: DayIndex[]; hours: DayHours | null }[] = [];
  for (const day of order) {
    const hours = WEEKLY_HOURS[day];
    const prev = rows[rows.length - 1];
    if (prev && prev.hours?.open === hours?.open && prev.hours?.close === hours?.close) {
      prev.days.push(day);
    } else {
      rows.push({ days: [day], hours });
    }
  }
  return rows.map((row) => {
    const first = DAY_NAMES[row.days[0]!];
    const last = DAY_NAMES[row.days[row.days.length - 1]!];
    return { ...row, label: row.days.length > 1 ? `${first}–${last}` : first };
  });
}

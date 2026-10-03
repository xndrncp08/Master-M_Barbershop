import { DAY_NAMES, WEEKLY_HOURS, toTimeLabel, type DayIndex } from "@/lib/hours";
import { SITE } from "@/lib/site";

export interface ZonedNow {
  /** Calendar date in the shop's time zone, "YYYY-MM-DD". */
  dateKey: string;
  day: DayIndex;
  /** Minutes after local midnight. */
  minutes: number;
}

const WEEKDAY_INDEX: Record<string, DayIndex> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Wall-clock date/time in Calgary (handles MST/MDT automatically). */
export function getZonedNow(date: Date = new Date(), timeZone: string = SITE.timeZone): ZonedNow {
  const parts: Record<string, string> = {};
  for (const part of partsFormatter(timeZone).formatToParts(date)) parts[part.type] = part.value;
  const hour = Number(parts.hour) % 24;
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    day: WEEKDAY_INDEX[parts.weekday ?? "Sun"] ?? 0,
    minutes: hour * 60 + Number(parts.minute),
  };
}

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateKey(key: string): { year: number; month: number; day: number } | null {
  const match = DATE_KEY.exec(key);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

function dateKeyToUtc(key: string): Date {
  const parsed = parseDateKey(key);
  if (!parsed) throw new Error(`Invalid date key: ${key}`);
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
}

export function addDays(key: string, days: number): string {
  const date = dateKeyToUtc(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function dayOfWeek(key: string): DayIndex {
  return dateKeyToUtc(key).getUTCDay() as DayIndex;
}

/** Whole days from `from` to `to` (both "YYYY-MM-DD"). */
export function daysBetween(from: string, to: string): number {
  return Math.round((dateKeyToUtc(to).getTime() - dateKeyToUtc(from).getTime()) / 86_400_000);
}

export function formatDateKey(
  key: string,
  options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" },
): string {
  return new Intl.DateTimeFormat("en-CA", { ...options, timeZone: "UTC" }).format(dateKeyToUtc(key));
}

export type OpenStatus =
  | { isOpen: true; closesAt: number; label: string; detail: string }
  | { isOpen: false; opensAt: number; opensInDays: number; label: string; detail: string };

/** Live open/closed status for the shop, evaluated in Calgary local time. */
export function getOpenStatus(date: Date = new Date()): OpenStatus {
  const now = getZonedNow(date);
  const today = WEEKLY_HOURS[now.day];

  if (today && now.minutes >= today.open && now.minutes < today.close) {
    return {
      isOpen: true,
      closesAt: today.close,
      label: "OPEN NOW in SE Calgary",
      detail: `Closes ${toTimeLabel(today.close)}`,
    };
  }

  for (let offset = 0; offset < 8; offset++) {
    const day = ((now.day + offset) % 7) as DayIndex;
    const hours = WEEKLY_HOURS[day];
    if (!hours) continue;
    if (offset === 0 && now.minutes >= hours.open) continue;
    const when = offset === 0 ? "" : offset === 1 ? "Tomorrow " : `${DAY_NAMES[day]} `;
    return {
      isOpen: false,
      opensAt: hours.open,
      opensInDays: offset,
      label: `CLOSED – Opens ${when}${toTimeLabel(hours.open)}`,
      detail: offset === 0 ? "Opening later today" : `Next open ${DAY_NAMES[day]}`,
    };
  }

  return { isOpen: false, opensAt: 0, opensInDays: -1, label: "CLOSED", detail: "Call for hours" };
}

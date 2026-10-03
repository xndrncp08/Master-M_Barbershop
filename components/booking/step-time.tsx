"use client";

import { AlertCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";
import type { BarberId } from "@/lib/booking/barbers";
import { getBookableDates, getSlots, type Slot } from "@/lib/booking/slots";
import { useAvailability } from "@/lib/hooks/use-availability";
import type { Service } from "@/lib/services";
import { addDays, formatDateKey, getZonedNow } from "@/lib/time";
import { cn } from "@/lib/utils";

interface StepTimeProps {
  service: Service;
  barberId: BarberId;
  date: string;
  time?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const STATE_TEXT: Record<Slot["state"], string> = {
  available: "Open",
  booked: "Booked",
  past: "Passed",
};

export function StepTime({ service, barberId, date, time, onDateChange, onTimeChange }: StepTimeProps) {
  const today = getZonedNow().dateKey;
  const dates = useMemo(() => getBookableDates(), []);
  const { slots, error, refresh } = useAvailability({ date, barber: barberId, service: service.id });

  // Skeleton cell count mirrors the real grid for this date and service.
  const expectedCount = useMemo(
    () => getSlots({ dateKey: date, barberId, durationMin: service.durationMin, appointments: [] }).length,
    [date, barberId, service.durationMin],
  );

  const availableCount = slots?.filter((s) => s.state === "available").length ?? 0;
  const selectedSlot = slots?.find((s) => s.time === time);
  const selectionLost = Boolean(time && slots && selectedSlot?.state !== "available");

  return (
    <div className="space-y-8">
      <fieldset className="min-w-0">
        <legend className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">Date</legend>
        <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:thin]">
          <div className="flex gap-2">
            {dates.map((key) => {
              const checked = key === date;
              const relative = key === today ? "Today" : key === addDays(today, 1) ? "Tomorrow" : null;
              return (
                <label key={key} className="relative shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name="date"
                    value={key}
                    checked={checked}
                    onChange={() => onDateChange(key)}
                    className="peer sr-only"
                    data-testid={`date-${key}`}
                  />
                  <span
                    className={cn(
                      "flex h-[4.5rem] w-[4.75rem] flex-col items-center justify-center rounded-2xl border border-cream/10 bg-ink-800/70 transition-[border-color,background-color] duration-150",
                      "hover:border-gold-400/50 peer-checked:border-gold-300 peer-checked:bg-gold-300 peer-checked:text-ink-950",
                      "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-300",
                    )}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                      {relative ?? formatDateKey(key, { weekday: "short" })}
                    </span>
                    <span className="text-xl font-semibold tabular">{formatDateKey(key, { day: "numeric" })}</span>
                    <span className="text-[11px] opacity-70">{formatDateKey(key, { month: "short" })}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>

      <fieldset aria-describedby="slot-status" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <legend className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
            Time · {formatDateKey(date, { weekday: "long", month: "long", day: "numeric" })}
          </legend>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream-muted" aria-label="Legend">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded border border-gold-400/60" /> Open
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded bg-gold-300" /> Selected
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded border border-cream/10 bg-ink-700" /> Booked / Passed
            </li>
          </ul>
        </div>

        <p id="slot-status" aria-live="polite" className="sr-only">
          {slots
            ? `${availableCount} ${availableCount === 1 ? "time" : "times"} open on ${formatDateKey(date)}.`
            : "Loading times…"}
        </p>

        {error ? (
          <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm">
            <span className="flex items-center gap-2">
              <AlertCircle aria-hidden className="size-4 shrink-0 text-danger" />
              {error}
            </span>
            <button type="button" onClick={refresh} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 font-semibold text-cream hover:bg-ink-700">
              <RotateCw aria-hidden className="size-4" /> Retry
            </button>
          </div>
        ) : null}

        {selectionLost ? (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm">
            <AlertCircle aria-hidden className="size-4 shrink-0 text-danger" />
            That time was just taken. Pick another time.
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5" data-testid="slot-grid">
          {slots === null
            ? Array.from({ length: Math.max(expectedCount, 1) }, (_, i) => (
                <span key={i} aria-hidden className="h-14 rounded-xl border border-cream/5 bg-ink-800/60 motion-safe:animate-pulse-dot" />
              ))
            : slots.map((slot) => {
                const disabled = slot.state !== "available";
                return (
                  <label key={slot.time} className={cn("relative", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                    <input
                      type="radio"
                      name="time"
                      value={slot.time}
                      checked={slot.time === time && !disabled}
                      disabled={disabled}
                      onChange={() => onTimeChange(slot.time)}
                      className="peer sr-only"
                      data-state={slot.state}
                    />
                    <span
                      className={cn(
                        "flex h-14 flex-col items-center justify-center rounded-xl border text-sm transition-[border-color,background-color] duration-150",
                        disabled
                          ? "border-cream/5 bg-ink-800/40 text-cream-subtle"
                          : "border-gold-400/40 bg-ink-800/70 text-cream hover:border-gold-300 hover:bg-ink-700",
                        "peer-checked:border-gold-300 peer-checked:bg-gold-300 peer-checked:text-ink-950",
                        "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-300",
                      )}
                    >
                      <span className={cn("font-semibold tabular", disabled && "line-through decoration-cream/30")}>
                        {slot.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider opacity-70">{STATE_TEXT[slot.state]}</span>
                    </span>
                  </label>
                );
              })}
        </div>

        {slots && slots.length > 0 && availableCount === 0 ? (
          <p className="mt-4 rounded-2xl border hairline bg-ink-850 p-4 text-sm text-cream-muted">
            No open times left on this day. Pick another date above.
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}

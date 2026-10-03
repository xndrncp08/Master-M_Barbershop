"use client";

import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { useEffect, useRef, type MouseEvent } from "react";
import { ConfettiBurst } from "@/components/booking/confetti-burst";
import type { BookingConfirmation } from "@/lib/booking/service";
import { formatDuration, formatPrice } from "@/lib/services";
import { DIRECTIONS_URL, SITE } from "@/lib/site";

interface ConfirmationDialogProps {
  booking: BookingConfirmation;
  onClose: () => void;
}

/** Modal confirmation using the native <dialog> (built-in focus trap, Esc to close). */
export function ConfirmationDialog({ booking, onClose }: ConfirmationDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) ref.current?.close();
  }

  const details: [string, string][] = [
    ["Reference", booking.reference],
    ["Service", booking.serviceName],
    ["Barber", booking.barberName],
    ["When", booking.whenLabel],
    ["Duration", formatDuration(booking.durationMin)],
    ["Price", formatPrice(booking.priceCad)],
  ];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="booking-confirmed-title"
      aria-describedby="booking-confirmed-summary"
      data-testid="booking-confirmation"
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-cream"
    >
      <ConfettiBurst />
      <div
        className="relative flex min-h-full items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-md animate-dialog-in rounded-3xl border hairline bg-ink-850 p-6 shadow-card sm:p-8">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 aria-hidden className="size-12 text-gold-300" strokeWidth={1.5} />
            <h2 id="booking-confirmed-title" className="mt-4 font-display text-3xl font-semibold">
              You’re Booked
            </h2>
            <p id="booking-confirmed-summary" className="mt-2 text-cream-muted">
              Thanks, {booking.name.split(" ")[0]}. See you {booking.whenLabel}.
            </p>
          </div>

          <dl className="mt-6 divide-y divide-cream/10 rounded-2xl border hairline bg-ink-900/60 px-4 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-cream-muted">{label}</dt>
                <dd className="text-right font-medium tabular">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-center text-xs leading-relaxed text-cream-subtle">
            Need to change or cancel? Call{" "}
            <a href={SITE.phone.href} className="text-gold-200 underline-offset-4 hover:underline">
              {SITE.phone.display}
            </a>
            .
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border hairline text-sm font-semibold hover:bg-ink-700"
            >
              <MapPin aria-hidden className="size-4 text-gold-300" />
              Get Directions
            </a>
            <form method="dialog">
              <button
                type="submit"
                autoFocus
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gold-300 text-sm font-semibold text-ink-950 hover:bg-gold-200"
              >
                Done
              </button>
            </form>
          </div>
          <p className="mt-4 text-center text-sm">
            <Link href="/" className="text-cream-muted underline-offset-4 hover:text-cream hover:underline">
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </dialog>
  );
}

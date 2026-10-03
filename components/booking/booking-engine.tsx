"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChoiceCard } from "@/components/booking/choice-card";
import { ConfirmationDialog } from "@/components/booking/confirmation-dialog";
import { StepDetails } from "@/components/booking/step-details";
import { StepTime } from "@/components/booking/step-time";
import { Stepper } from "@/components/booking/stepper";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { BARBERS, getBarber, type BarberId } from "@/lib/booking/barbers";
import {
  maxReachableStep,
  parseBookingParams,
  serializeBookingParams,
  updateBookingParams,
  type BookingParams,
  type BookingStep,
} from "@/lib/booking/params";
import type { BookingConfirmation } from "@/lib/booking/service";
import { getFirstOpenDate } from "@/lib/booking/slots";
import { toTimeLabel } from "@/lib/hours";
import { SERVICES, formatDuration, formatPrice, getService, type ServiceId } from "@/lib/services";
import { formatDateKey } from "@/lib/time";
import { timeToMinutes } from "@/lib/booking/slots";

const STEP_COPY: Record<BookingStep, { title: string; description: string }> = {
  1: { title: "Choose Your Service", description: "Pick what you’re coming in for. Prices in CAD." },
  2: { title: "Choose Your Barber", description: "Request a specific chair or take the first one free." },
  3: { title: "Pick a Time", description: "Times update live as other clients book." },
  4: { title: "Your Details", description: "We’ll hold your chair under this name." },
};

const featured = SERVICES.filter((s) => "featured" in s && s.featured);
const others = SERVICES.filter((s) => !("featured" in s && s.featured));

export function BookingEngine() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => parseBookingParams(searchParams), [searchParams]);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [formKey, setFormKey] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(params.step);

  const commit = useCallback(
    (next: BookingParams, mode: "push" | "replace" = "push") => {
      const query = serializeBookingParams(next);
      const url = query ? `${pathname}?${query}` : pathname;
      if (mode === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [pathname],
  );

  const update = useCallback(
    (patch: Partial<BookingParams>, mode: "push" | "replace" = "replace") =>
      commit(updateBookingParams(params, patch), mode),
    [commit, params],
  );

  const goToStep = useCallback(
    (step: BookingStep) => commit(updateBookingParams(params, { step }), "push"),
    [commit, params],
  );

  // Move focus to the step heading on step changes (not on first load).
  useEffect(() => {
    if (previousStep.current !== params.step) {
      previousStep.current = params.step;
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [params.step]);

  const service = getService(params.service);
  const barberId: BarberId = params.barber ?? "any";
  const date = useMemo(
    () =>
      params.date ??
      (service ? getFirstOpenDate(service.durationMin, barberId, []) : undefined),
    [params.date, service, barberId],
  );
  const max = maxReachableStep(params);
  const copy = STEP_COPY[params.step];
  const canContinue = params.step < max;

  function handleBooked(booking: BookingConfirmation) {
    setConfirmation(booking);
  }

  function handleConfirmationClose() {
    setConfirmation(null);
    setFormKey((k) => k + 1);
    commit({ step: 1 }, "replace");
  }

  function handleSlotUnavailable() {
    const next: BookingParams = { ...params, step: 3 };
    delete next.time;
    commit(next, "push");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-8">
        <Stepper current={params.step} maxReachable={max} onSelect={goToStep} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={params.step}
            aria-labelledby="booking-step-heading"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <header className="space-y-1.5">
              <h2
                id="booking-step-heading"
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-2xl font-semibold outline-none sm:text-3xl"
              >
                {copy.title}
              </h2>
              <p className="text-cream-muted">{copy.description}</p>
            </header>

            {params.step === 1 ? (
              <fieldset className="min-w-0 space-y-6">
                <legend className="sr-only">Service</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {featured.map((s) => (
                    <ServiceChoice key={s.id} id={s.id} checked={params.service === s.id} badge="Popular" onChange={(id) => update({ service: id })} />
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">More Services</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {others.map((s) => (
                      <ServiceChoice key={s.id} id={s.id} checked={params.service === s.id} onChange={(id) => update({ service: id })} />
                    ))}
                  </div>
                </div>
              </fieldset>
            ) : null}

            {params.step === 2 ? (
              <fieldset className="min-w-0">
                <legend className="sr-only">Barber</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {BARBERS.map((b) => (
                    <ChoiceCard
                      key={b.id}
                      name="barber"
                      value={b.id}
                      checked={params.barber === b.id}
                      onChange={(id) => update({ barber: id as BarberId })}
                      title={b.name}
                      description={b.description}
                      badge={b.id === "any" ? "Fastest" : undefined}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {params.step === 3 && service ? (
              date ? (
                <StepTime
                  service={service}
                  barberId={barberId}
                  date={date}
                  time={params.time}
                  onDateChange={(next) => update({ date: next })}
                  onTimeChange={(time) => update({ date, time })}
                />
              ) : (
                <p className="rounded-2xl border hairline bg-ink-850 p-5 text-cream-muted">
                  No openings in the next 2 weeks for this choice. Try a different barber or call us.
                </p>
              )
            ) : null}

            {params.step === 4 && service && params.barber && params.date && params.time ? (
              <StepDetails
                key={formKey}
                selection={{ serviceId: service.id, barberId: params.barber, date: params.date, time: params.time }}
                onBooked={handleBooked}
                onSlotUnavailable={handleSlotUnavailable}
              />
            ) : null}

            {params.step < 4 ? (
              <div className="flex items-center justify-between gap-3 border-t hairline pt-6">
                {params.step > 1 ? (
                  <button
                    type="button"
                    onClick={() => goToStep((params.step - 1) as BookingStep)}
                    className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-cream-muted hover:bg-ink-800 hover:text-cream"
                  >
                    <ArrowLeft aria-hidden className="size-4" /> Back
                  </button>
                ) : (
                  <span />
                )}
                <MagneticButton
                  size="md"
                  disabled={!canContinue}
                  onClick={() => goToStep((params.step + 1) as BookingStep)}
                >
                  Continue <ArrowRight aria-hidden className="size-4" />
                </MagneticButton>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-cream-muted hover:bg-ink-800 hover:text-cream"
              >
                <ArrowLeft aria-hidden className="size-4" /> Back to Times
              </button>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      <BookingSummary params={params} onEdit={goToStep} />

      {confirmation ? <ConfirmationDialog booking={confirmation} onClose={handleConfirmationClose} /> : null}
    </div>
  );
}

function ServiceChoice({
  id,
  checked,
  badge,
  onChange,
}: {
  id: ServiceId;
  checked: boolean;
  badge?: string;
  onChange: (id: ServiceId) => void;
}) {
  const service = getService(id)!;
  return (
    <ChoiceCard
      name="service"
      value={service.id}
      checked={checked}
      onChange={(value) => onChange(value as ServiceId)}
      title={service.name}
      description={service.description}
      badge={badge}
      meta={
        <span className="flex items-center justify-between text-cream-muted">
          <span>{formatDuration(service.durationMin)}</span>
          <span className="text-base font-semibold text-gold-200 tabular">{formatPrice(service.priceCad)}</span>
        </span>
      }
    />
  );
}

function BookingSummary({ params, onEdit }: { params: BookingParams; onEdit: (step: BookingStep) => void }) {
  const service = getService(params.service);
  const barber = getBarber(params.barber);
  const minutes = params.time ? timeToMinutes(params.time) : null;
  const rows: { step: BookingStep; label: string; value?: string }[] = [
    { step: 1, label: "Service", value: service ? `${service.name} · ${formatPrice(service.priceCad)}` : undefined },
    { step: 2, label: "Barber", value: barber?.name },
    {
      step: 3,
      label: "When",
      value:
        params.date && minutes !== null
          ? `${formatDateKey(params.date, { weekday: "short", month: "short", day: "numeric" })} · ${toTimeLabel(minutes)}`
          : undefined,
    },
  ];

  return (
    <aside aria-label="Booking summary" className="h-fit rounded-3xl border hairline bg-ink-850 p-6 shadow-card lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">Your Appointment</h2>
      <dl className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-cream-subtle">{row.label}</dt>
              <dd className={row.value ? "mt-0.5 text-sm text-cream tabular" : "mt-0.5 text-sm text-cream-subtle"}>
                {row.value ?? "Not selected"}
              </dd>
            </div>
            {row.value && params.step !== row.step ? (
              <button
                type="button"
                onClick={() => onEdit(row.step)}
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-gold-200 hover:bg-ink-700"
              >
                Change<span className="sr-only"> {row.label.toLowerCase()}</span>
              </button>
            ) : null}
          </div>
        ))}
      </dl>
      {service ? (
        <p className="mt-5 border-t hairline pt-4 text-xs text-cream-subtle">
          About {formatDuration(service.durationMin)} in the chair
        </p>
      ) : null}
    </aside>
  );
}

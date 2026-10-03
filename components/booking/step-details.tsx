"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { submitBooking } from "@/app/book/actions";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  customerSchema,
  type BookingSelection,
  type CustomerDetails,
  type CustomerInput,
} from "@/lib/booking/schema";
import type { BookingConfirmation } from "@/lib/booking/service";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

interface StepDetailsProps {
  selection: BookingSelection;
  onBooked: (booking: BookingConfirmation) => void;
  onSlotUnavailable: () => void;
}

const FIELDS = ["name", "phone", "email", "notes"] as const;

export function StepDetails({ selection, onBooked, onSlotUnavailable }: StepDetailsProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [serverError, setServerError] = useState<{ message: string; slotIssue: boolean } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<CustomerInput, unknown, CustomerDetails>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "", email: "", notes: "", company: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Warn before leaving with unsent details.
  useEffect(() => {
    if (!isDirty || isSubmitSuccessful) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, isSubmitSuccessful]);

  async function onSubmit(values: CustomerDetails) {
    setServerError(null);
    let result: Awaited<ReturnType<typeof submitBooking>>;
    try {
      result = await submitBooking({ ...selection, ...values });
    } catch {
      setServerError({
        message: `We couldn't reach the server. Check your connection, or call ${SITE.phone.display}.`,
        slotIssue: false,
      });
      return;
    }

    if (result.ok) {
      onBooked(result.booking);
      return;
    }

    let focused = false;
    for (const field of FIELDS) {
      const message = result.fieldErrors?.[field]?.[0];
      if (message) {
        setError(field, { message }, { shouldFocus: !focused });
        focused = true;
      }
    }
    setServerError({
      message: result.error,
      slotIssue: result.code === "conflict" || result.code === "unavailable",
    });
  }

  function handleNotesKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5" aria-label="Your details">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full Name" error={errors.name?.message} className="sm:col-span-2">
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jordan Smith…"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass(Boolean(errors.name))}
            {...register("name")}
          />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone?.message}>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(403) 555-0123…"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={cn(inputClass(Boolean(errors.phone)), "tabular")}
            {...register("phone")}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="name@example.com…"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass(Boolean(errors.email))}
            {...register("email")}
          />
        </Field>
        <Field
          id="notes"
          label="Notes"
          hint="Optional — style references, allergies, anything we should know."
          error={errors.notes?.message}
          className="sm:col-span-2"
        >
          <textarea
            id="notes"
            rows={3}
            placeholder="Low skin fade, keep length on top…"
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? "notes-error" : "notes-hint"}
            onKeyDown={handleNotesKeyDown}
            className={cn(inputClass(Boolean(errors.notes)), "h-auto min-h-24 resize-y py-3")}
            {...register("notes")}
          />
        </Field>
      </div>

      {/* Honeypot — hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {serverError ? (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2">
            <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
            {serverError.message}
          </span>
          {serverError.slotIssue ? (
            <button
              type="button"
              onClick={onSlotUnavailable}
              className="h-10 shrink-0 rounded-full border border-cream/20 px-4 font-semibold hover:bg-ink-700"
            >
              Choose Another Time
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-cream-subtle">
          Your details are used only to manage this appointment.
        </p>
        <MagneticButton type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="sm:w-auto">
          {isSubmitting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
          {isSubmitting ? "Confirming…" : "Confirm Booking"}
        </MagneticButton>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    "h-12 w-full rounded-xl border bg-ink-800 px-4 text-cream placeholder:text-cream-subtle transition-[border-color] duration-150",
    "focus:border-gold-300 focus-visible:outline-none",
    invalid ? "border-danger/70" : "border-cream/15 hover:border-cream/25",
  );
}

function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-cream">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm text-danger" aria-live="polite">
          <AlertCircle aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-cream-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BOOKING_STEPS, type BookingStep } from "@/lib/booking/params";
import { cn } from "@/lib/utils";

interface StepperProps {
  current: BookingStep;
  maxReachable: BookingStep;
  onSelect: (step: BookingStep) => void;
}

export function Stepper({ current, maxReachable, onSelect }: StepperProps) {
  const currentLabel = BOOKING_STEPS.find((s) => s.id === current)?.label;
  return (
    <nav aria-label="Booking progress" className="space-y-3">
      <ol className="grid grid-cols-4 gap-2 rounded-full border hairline bg-ink-850 p-1.5">
        {BOOKING_STEPS.map((step) => {
          const state = step.id < current ? "complete" : step.id === current ? "current" : "upcoming";
          const reachable = step.id <= maxReachable;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                disabled={!reachable || state === "current"}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "relative flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors duration-150",
                  state === "current" && "text-ink-950",
                  state === "complete" && "text-cream hover:text-gold-200",
                  state === "upcoming" && "text-cream-subtle",
                  reachable && state !== "current" && "cursor-pointer",
                  !reachable && "cursor-not-allowed",
                )}
              >
                {state === "current" ? (
                  <motion.span
                    layoutId="booking-step-pill"
                    className="absolute inset-0 rounded-full bg-gold-300"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                ) : null}
                <span className="relative flex size-5 items-center justify-center rounded-full text-xs tabular">
                  {state === "complete" ? <Check aria-hidden className="size-4 text-gold-300" /> : step.id}
                </span>
                <span className="relative hidden sm:inline">{step.label}</span>
                <span className="sr-only">
                  {` ${step.label}, ${state === "complete" ? "completed" : state === "current" ? "current step" : "not started"}`}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="text-center text-sm text-cream-muted sm:hidden">
        Step <span className="tabular">{current}</span> of 4 · {currentLabel}
      </p>
    </nav>
  );
}

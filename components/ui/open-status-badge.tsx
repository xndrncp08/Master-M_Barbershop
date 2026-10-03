"use client";

import { useMinuteClock } from "@/lib/hooks/use-minute-clock";
import { getOpenStatus } from "@/lib/time";
import { cn } from "@/lib/utils";

/** Live "Open Now / Closed" pill computed in Calgary local time. */
export function OpenStatusBadge({ className }: { className?: string }) {
  const now = useMinuteClock();
  const shell =
    "inline-flex h-9 min-w-[17.5rem] items-center justify-center gap-2.5 rounded-full border px-4 text-xs font-semibold tracking-[0.14em]";

  if (!now) {
    // Placeholder mirrors the final pill's box to avoid layout shift.
    return (
      <span className={cn(shell, "hairline bg-ink-800/60", className)} aria-hidden>
        <span className="h-2 w-2 rounded-full bg-ink-600" />
        <span className="h-3 w-44 rounded-full bg-ink-700" />
      </span>
    );
  }

  const status = getOpenStatus(now);
  return (
    <span
      role="status"
      data-testid="open-status"
      data-open={status.isOpen}
      className={cn(
        shell,
        status.isOpen
          ? "border-success/40 bg-success/10 text-success"
          : "border-danger/40 bg-danger/10 text-danger",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-2 w-2 rounded-full",
          status.isOpen ? "bg-success motion-safe:animate-pulse-dot" : "bg-danger",
        )}
      />
      <span>{status.label}</span>
      <span className="sr-only">. {status.detail}.</span>
    </span>
  );
}

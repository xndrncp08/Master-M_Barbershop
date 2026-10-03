/** Mirrors the step-1 layout (stepper, heading, service grid, summary) to prevent layout shift. */
export function BookingSkeleton() {
  return (
    <div aria-hidden className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-8">
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2 rounded-full border hairline bg-ink-850 p-1.5">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className="h-10 rounded-full bg-ink-800/80" />
            ))}
          </div>
          <span className="mx-auto block h-5 w-32 rounded-full bg-ink-800/60 sm:hidden" />
        </div>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="block h-8 w-64 rounded-lg bg-ink-800/80 sm:h-9" />
            <span className="block h-6 w-80 max-w-full rounded-lg bg-ink-800/50" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className="h-[9.5rem] rounded-2xl border border-cream/5 bg-ink-800/60 motion-safe:animate-pulse-dot" />
            ))}
          </div>
        </div>
      </div>
      <span className="h-56 rounded-3xl border hairline bg-ink-850" />
    </div>
  );
}

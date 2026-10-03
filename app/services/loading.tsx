/** Mirrors the services page header, tabs and card grid while the category loads. */
export default function ServicesLoading() {
  return (
    <div aria-hidden className="container space-y-8 py-12 sm:py-16">
      <div className="space-y-3">
        <span className="block h-4 w-40 rounded-full bg-ink-800/80" />
        <span className="block h-10 w-80 max-w-full rounded-lg bg-ink-800/80 sm:h-12" />
        <span className="block h-6 w-96 max-w-full rounded-lg bg-ink-800/50" />
      </div>
      <span className="block h-[3.25rem] w-[26rem] max-w-full rounded-full border hairline bg-ink-850" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="h-[13.5rem] rounded-2xl border border-cream/5 bg-ink-800/60 motion-safe:animate-pulse-dot" />
        ))}
      </div>
    </div>
  );
}

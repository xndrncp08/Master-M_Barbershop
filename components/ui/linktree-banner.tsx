import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SITE } from "@/lib/site";

/** Social hub call-out linking to the shop's Linktree. */
export function LinktreeBanner({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <section
      aria-labelledby="linktree-heading"
      className="relative overflow-hidden rounded-3xl border hairline bg-[radial-gradient(120%_140%_at_0%_0%,#2a2112_0%,#110f0c_55%,#0b0a08_100%)] p-6 shadow-card sm:p-10"
    >
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <BrandLogo size={72} alt="" className="shrink-0" />
          <div className="space-y-1.5">
            <Heading id="linktree-heading" className="font-display text-2xl font-semibold text-cream">
              Follow the Craft
            </Heading>
            <p className="max-w-md text-sm leading-relaxed text-cream-muted">
              Fresh cuts, shop updates & every social channel for{" "}
              <span translate="no">{SITE.shortName}</span> — all in one place.
            </p>
          </div>
        </div>
        <MagneticButton href={SITE.linktree} external variant="secondary" size="md" className="shrink-0">
          Open Social Hub
          <ArrowUpRight aria-hidden className="size-4" />
          <span className="sr-only">(opens Linktree in a new tab)</span>
        </MagneticButton>
      </div>
    </section>
  );
}

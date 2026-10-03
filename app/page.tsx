import { BarberLineArt } from "@/components/ui/barber-line-art";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <section className="relative isolate overflow-hidden">
      <BarberLineArt className="absolute inset-x-0 top-8 -z-10 mx-auto w-full max-w-6xl opacity-40" />
      <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-8 py-20 text-center">
        <BrandLogo size={160} priority />
        <h1 className="font-display text-4xl sm:text-6xl">
          <span translate="no">{SITE.name}</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-3">
          <MagneticButton href="/book">Book Now</MagneticButton>
          <MagneticButton href="/services" variant="secondary">
            View Services
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

import { ArrowUpRight, CalendarCheck, Crown, MapPin, Phone, Scissors, Sparkles } from "lucide-react";
import Link from "next/link";
import { HoursTable } from "@/components/contact/hours-table";
import { HeroHeadline } from "@/components/home/hero-headline";
import { ServiceCard } from "@/components/services/service-card";
import { BarberLineArt } from "@/components/ui/barber-line-art";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LinktreeBanner } from "@/components/ui/linktree-banner";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { OpenStatusBadge } from "@/components/ui/open-status-badge";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SERVICES } from "@/lib/services";
import { DIRECTIONS_URL, SITE } from "@/lib/site";

const featured = SERVICES.filter((s) => "featured" in s && s.featured);

const PILLARS = [
  {
    icon: Scissors,
    title: "Precision Craft",
    body: "Clean blends, sharp lines & cuts built around your head shape, hair type and routine.",
  },
  {
    icon: Crown,
    title: "Traditional Barbering",
    body: "Straight-razor finishes and hot towel shaves done the classic way — unhurried and exact.",
  },
  {
    icon: Sparkles,
    title: "Modern Grooming",
    body: "Current styles, beard sculpting & finishing products so you leave ready for anything.",
  },
];

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-[radial-gradient(60%_55%_at_50%_0%,rgba(212,166,74,0.18)_0%,rgba(11,10,8,0)_70%)]"
        />
        <BarberLineArt className="absolute left-1/2 top-10 -z-10 w-[min(1200px,140vw)] -translate-x-1/2 opacity-30" />

        <div className="container flex flex-col items-center gap-7 pb-20 pt-14 text-center sm:pt-20">
          <div className="relative">
            <div aria-hidden className="absolute inset-4 rounded-full bg-gold-400/25 blur-3xl" />
            <BrandLogo size={168} priority className="relative drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]" />
          </div>

          <OpenStatusBadge />

          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-300">
              <span translate="no">{SITE.name}</span> · SE Calgary
            </p>
            <HeroHeadline />
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-cream-muted">
              Calgary’s premier destination for traditional craft & modern men’s grooming.
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <MagneticButton href="/book" data-testid="hero-book-cta">
              <CalendarCheck aria-hidden className="size-5" />
              Book Now
            </MagneticButton>
            <MagneticButton href="/services" variant="secondary">
              View Services
            </MagneticButton>
            <MagneticButton href={SITE.linktree} external variant="secondary">
              Social Links
              <ArrowUpRight aria-hidden className="size-4" />
              <span className="sr-only">(opens Linktree in a new tab)</span>
            </MagneticButton>
          </div>
        </div>
      </section>

      <section aria-labelledby="signature-heading" className="container space-y-10 py-20">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              id="signature-heading"
              eyebrow="Signature Services"
              title="Built for the Sharpest Version of You"
              description="Most-booked services. Every visit includes a consultation & finishing style."
            />
            <Link href="/services" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-gold-200 hover:bg-ink-800">
              View All Services <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </div>
        </Reveal>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((service, index) => (
            <li key={service.id}>
              <Reveal delay={index * 0.06} className="h-full">
                <ServiceCard service={service} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="craft-heading" className="border-y hairline bg-ink-950/60">
        <div className="container space-y-12 py-20">
          <Reveal>
            <SectionHeading
              id="craft-heading"
              eyebrow="The Master M Standard"
              title="Old-School Craft. New-School Style."
              align="center"
            />
          </Reveal>
          <ul className="grid gap-5 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, body }, index) => (
              <li key={title}>
                <Reveal delay={index * 0.08} className="h-full">
                  <div className="h-full rounded-3xl border hairline bg-ink-850 p-7 shadow-card">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold-300/10 text-gold-300">
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream-muted">{body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="visit-heading" className="container grid gap-8 py-20 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-6">
            <SectionHeading
              id="visit-heading"
              eyebrow="Visit"
              title="Midnapore’s Neighbourhood Barber"
              description="Book online to guarantee your chair, or call to check same-day openings."
            />
            <address className="space-y-3 not-italic">
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-cream hover:text-gold-200">
                <MapPin aria-hidden className="mt-1 size-5 shrink-0 text-gold-300" />
                <span>{SITE.address.singleLine}<span className="sr-only"> (opens Google Maps in a new tab)</span></span>
              </a>
              <a href={SITE.phone.href} className="flex items-center gap-3 text-cream hover:text-gold-200">
                <Phone aria-hidden className="size-5 shrink-0 text-gold-300" />
                <span className="tabular">{SITE.phone.display}</span>
              </a>
            </address>
            <div className="flex flex-wrap gap-3">
              <MagneticButton href="/book" size="md">Reserve Your Spot</MagneticButton>
              <MagneticButton href="/contact" variant="secondary" size="md">Hours & Directions</MagneticButton>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-3xl border hairline bg-ink-850 p-6 shadow-card sm:p-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">Opening Hours</h3>
            <HoursTable />
          </div>
        </Reveal>
      </section>

      <div className="container pb-20">
        <Reveal>
          <LinktreeBanner />
        </Reveal>
      </div>
    </>
  );
}

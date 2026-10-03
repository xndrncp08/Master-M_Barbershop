import Link from "next/link";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { getHoursRows, toTimeLabel } from "@/lib/hours";
import { NAV_LINKS } from "@/lib/nav";
import { DIRECTIONS_URL, SITE } from "@/lib/site";

export function SiteFooter() {
  const hours = getHoursRows();
  return (
    <footer className="border-t hairline bg-ink-950 safe-pb">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-3" aria-label={`${SITE.name} — Home`}>
            <BrandLogo size={72} alt="" />
            <span translate="no" className="font-display text-xl tracking-[0.12em]">
              MASTER&nbsp;M
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-cream-muted">
            Calgary’s premier destination for traditional craft & modern men’s grooming.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Visit</h2>
          <address className="space-y-3 text-sm not-italic text-cream-muted">
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-cream">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-300" />
              <span>
                {SITE.address.street}
                <br />
                {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
              </span>
            </a>
            <a href={SITE.phone.href} className="flex items-center gap-2 hover:text-cream">
              <Phone aria-hidden className="size-4 shrink-0 text-gold-300" />
              <span className="tabular">{SITE.phone.display}</span>
            </a>
          </address>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Hours</h2>
          <dl className="space-y-2 text-sm">
            {hours.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-cream-muted">{row.label}</dt>
                <dd className="tabular text-cream">
                  {row.hours ? `${toTimeLabel(row.hours.open)} – ${toTimeLabel(row.hours.close)}` : "Closed"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Explore</h2>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-cream-muted hover:text-cream">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={SITE.linktree}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cream-muted hover:text-cream"
              >
                Social Links
                <ExternalLink aria-hidden className="size-3.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <p className="container py-6 text-xs text-cream-subtle">
          © {new Date().getFullYear()} <span translate="no">{SITE.name}</span> · SE Calgary, Alberta
        </p>
      </div>
    </footer>
  );
}

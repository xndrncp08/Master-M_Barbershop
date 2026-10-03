"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { NAV_LINKS, isActivePath } from "@/lib/nav";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const panelId = useId();

  // Close the mobile menu whenever the route changes.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-ink-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-ink-900/65">
      <div className="container flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full pr-2"
          aria-label={`${SITE.name} — Home`}
        >
          <BrandLogo size={48} priority alt="" />
          <span translate="no" className="hidden font-display text-lg tracking-[0.12em] text-cream sm:block">
            MASTER&nbsp;M
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150",
                      active ? "text-ink-950" : "text-cream-muted hover:text-cream",
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-gold-300"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={SITE.phone.href}
            className="hidden h-11 items-center gap-2 rounded-full px-3 text-sm text-cream-muted transition-colors duration-150 hover:text-cream lg:flex"
          >
            <Phone aria-hidden className="size-4 text-gold-300" />
            <span className="tabular">{SITE.phone.display}</span>
          </a>
          <MagneticButton href="/book" size="md" className="hidden sm:inline-flex">
            Book Now
          </MagneticButton>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border hairline text-cream md:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id={panelId}
        hidden={!open}
        className="border-t hairline bg-ink-900/95 md:hidden"
      >
        <nav aria-label="Mobile" className="container py-4">
          <ul className="grid gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center rounded-xl px-4 text-base font-medium",
                      active ? "bg-ink-700 text-gold-200" : "text-cream hover:bg-ink-800",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <a href={SITE.phone.href} className="flex h-12 items-center gap-2 rounded-xl px-4 text-cream hover:bg-ink-800">
                <Phone aria-hidden className="size-4 text-gold-300" />
                Call <span className="tabular">{SITE.phone.display}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

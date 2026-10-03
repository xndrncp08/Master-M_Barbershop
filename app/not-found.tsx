import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MagneticButton } from "@/components/ui/magnetic-button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <BrandLogo size={112} alt="" />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-300 tabular">404</p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">This Page Took a Walk-Out</h1>
        <p className="mx-auto max-w-md text-cream-muted">The link may be old or mistyped. Here’s where to go next.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <MagneticButton href="/book">Book Now</MagneticButton>
        <MagneticButton href="/services" variant="secondary">
          View Services
        </MagneticButton>
      </div>
      <Link href="/" className="text-sm text-cream-muted underline-offset-4 hover:text-cream hover:underline">
        Back to Home
      </Link>
    </div>
  );
}

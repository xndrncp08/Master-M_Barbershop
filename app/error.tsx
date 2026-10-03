"use client";

import Link from "next/link";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SITE } from "@/lib/site";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <BrandLogo size={96} alt="" />
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Something Went Wrong</h1>
        <p className="mx-auto max-w-md text-cream-muted">
          This page hit an unexpected error. Try again, or call{" "}
          <a href={SITE.phone.href} className="text-gold-200 underline-offset-4 hover:underline">
            {SITE.phone.display}
          </a>{" "}
          to book directly.
        </p>
        {error.digest ? <p className="text-xs text-cream-subtle tabular">Reference: {error.digest}</p> : null}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-gold-300 px-6 font-semibold text-ink-950 hover:bg-gold-200"
        >
          <RotateCw aria-hidden className="size-4" /> Try Again
        </button>
        <Link href="/" className="inline-flex h-12 items-center rounded-full border hairline px-6 font-semibold hover:bg-ink-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

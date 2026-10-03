import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingEngine } from "@/components/booking/booking-engine";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Book an Appointment Online",
  description:
    "Book your haircut, fade, beard grooming or hot towel shave at Master M Barbershop in SE Calgary. Pick your barber and a live open time in under a minute.",
  path: "/book",
});

export default function BookPage() {
  return (
    <div className="container py-12 sm:py-16">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Book", path: "/book" },
        ])}
      />
      <SectionHeading
        as="h1"
        eyebrow="Reserve Your Chair"
        title="Book an Appointment"
        description="4 quick steps. No account needed."
        className="mb-10"
      />
      <Suspense fallback={<BookingSkeleton />}>
        <BookingEngine />
      </Suspense>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { formatDuration, formatPrice, type Service } from "@/lib/services";

export function ServiceCard({ service, headingLevel = "h3" }: { service: Service; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <TiltCard>
      <article className="flex h-full flex-col rounded-2xl border border-cream/10 bg-[linear-gradient(160deg,#1f1b15_0%,#110f0c_70%)] p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <Heading className="font-display text-xl font-semibold text-cream">{service.name}</Heading>
          <p className="shrink-0 text-2xl font-semibold text-gold-200 tabular">
            <span className="sr-only">Price: </span>
            {formatPrice(service.priceCad)}
          </p>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-cream-muted">{service.description}</p>
        <div className="mt-6 flex items-center justify-between gap-3 border-t hairline pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-cream-muted">
            <Clock aria-hidden className="size-4 text-gold-300" />
            <span className="tabular">{formatDuration(service.durationMin)}</span>
          </span>
          <Link
            href={`/book?service=${service.id}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-gold-200 transition-colors duration-150 hover:bg-gold-300 hover:text-ink-950"
          >
            Book<span className="sr-only"> {service.name}</span>
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </article>
    </TiltCard>
  );
}

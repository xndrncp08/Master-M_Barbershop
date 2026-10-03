import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChoiceCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  badge?: string;
  className?: string;
}

/** Native radio input dressed as a card: full-card hit target, keyboard arrows, visible focus. */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  meta,
  badge,
  className,
}: ChoiceCardProps) {
  return (
    <label className={cn("group relative block cursor-pointer", className)}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "flex h-full flex-col gap-2 rounded-2xl border border-cream/10 bg-ink-800/70 p-5 shadow-card transition-[border-color,background-color,box-shadow] duration-150",
          "hover:border-gold-400/50 hover:bg-ink-700/70",
          "peer-checked:border-gold-300 peer-checked:bg-ink-700 peer-checked:shadow-glow",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-300",
        )}
      >
        <span className="flex items-start justify-between gap-3 pr-8">
          <span className="font-semibold text-cream">{title}</span>
          {badge ? (
            <span className="shrink-0 rounded-full bg-gold-300/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-200">
              {badge}
            </span>
          ) : null}
        </span>
        {description ? <span className="text-sm leading-relaxed text-cream-muted">{description}</span> : null}
        {meta ? <span className="mt-auto pt-1 text-sm">{meta}</span> : null}
      </span>
      <span
        aria-hidden
        className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full border border-cream/20 text-ink-950 transition-[background-color,border-color] duration-150 peer-checked:border-gold-300 peer-checked:bg-gold-300 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </label>
  );
}

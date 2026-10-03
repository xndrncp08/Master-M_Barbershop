"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { ComponentPropsWithoutRef, PointerEvent, ReactNode } from "react";
import { useFinePointer } from "@/lib/hooks/use-fine-pointer";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** How far (0–1) the button follows the cursor. */
  strength?: number;
}

type LinkProps = BaseProps & { href: string; external?: boolean } & Omit<
    ComponentPropsWithoutRef<"a">,
    "href" | "className" | "children"
  >;
type ButtonProps = BaseProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

export type MagneticButtonProps = LinkProps | ButtonProps;

const MAX_OFFSET = 14;
const spring = { stiffness: 260, damping: 18, mass: 0.4 };

const sizes: Record<Size, { shell: string; inner: string }> = {
  md: { shell: "h-11", inner: "px-5 text-sm" },
  lg: { shell: "h-14", inner: "px-7 text-base" },
};

const fills: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(180deg,#f2d58c_0%,#d4a64a_55%,#b98b34_100%)] text-ink-950 group-hover:brightness-110",
  secondary: "bg-ink-800 text-cream group-hover:bg-ink-700",
};

const borders: Record<Variant, string> = {
  primary:
    "bg-[conic-gradient(from_0deg,transparent_0deg,#fbf4e2_60deg,transparent_120deg,transparent_240deg,#f2d58c_300deg,transparent_360deg)]",
  secondary:
    "bg-[conic-gradient(from_0deg,transparent_0deg,#d4a64a_70deg,transparent_140deg,transparent_360deg)]",
};

function isLinkProps(props: MagneticButtonProps): props is LinkProps {
  return typeof props.href === "string";
}

/** Strip the props this component consumes so the rest can be forwarded to the DOM. */
function omitOwnProps<T extends BaseProps>(props: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, variant, size, className, strength, ...rest } = props;
  return rest;
}

/**
 * Primary CTA: follows the cursor with spring physics, shimmers with a rotating
 * conic-gradient border, and compresses slightly on press. Motion is skipped on
 * touch devices and for users who prefer reduced motion.
 */
export function MagneticButton(props: MagneticButtonProps) {
  const { children, variant = "primary", size = "lg", className, strength = 0.35 } = props;
  const reduceMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const magnetic = finePointer && !reduceMotion;

  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!magnetic) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (event.clientY - (rect.top + rect.height / 2)) * strength;
    x.set(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx)));
    y.set(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dy)));
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  const inner = (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <span
          className={cn(
            "absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-spin-slow",
            borders[variant],
          )}
        />
      </span>
      <span
        className={cn(
          "relative flex h-full w-full items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-[filter,background-color] duration-200",
          sizes[size].inner,
          fills[variant],
        )}
      >
        {children}
      </span>
    </>
  );

  const shellClass = cn(
    "group relative inline-flex w-full select-none items-stretch rounded-full p-[1.5px] shadow-card",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" && "shadow-glow",
    sizes[size].shell,
  );

  let control: ReactNode;
  if (isLinkProps(props)) {
    const { href, external, ...anchorRest } = omitOwnProps(props);
    control = external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={shellClass} {...anchorRest}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={shellClass} {...anchorRest}>
        {inner}
      </Link>
    );
  } else {
    const { type = "button", ...buttonRest } = omitOwnProps(props);
    control = (
      <button type={type} className={shellClass} {...buttonRest}>
        {inner}
      </button>
    );
  }

  return (
    <motion.div
      className={cn("inline-flex", className)}
      style={{ x, y }}
      whileTap={{ scale: 0.98 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {control}
    </motion.div>
  );
}

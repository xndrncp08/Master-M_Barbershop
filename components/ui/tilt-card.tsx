"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { useFinePointer } from "@/lib/hooks/use-fine-pointer";
import { cn } from "@/lib/utils";

const spring = { stiffness: 220, damping: 22, mass: 0.5 };

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. */
  maxTilt?: number;
}

/**
 * Card that tilts in 3D toward the cursor with a specular gold highlight that
 * tracks the pointer. Only transform and opacity are animated.
 */
export function TiltCard({ children, className, maxTilt = 9 }: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const enabled = finePointer && !reduceMotion;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), spring);
  const glareX = useTransform(px, [0, 1], ["-25%", "25%"]);
  const glareY = useTransform(py, [0, 1], ["-25%", "25%"]);
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 30 });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
    glareOpacity.set(1);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  }

  return (
    <motion.div
      className={cn("relative h-full rounded-2xl [transform-style:preserve-3d]", className)}
      style={enabled ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <motion.div
          className="absolute -inset-1/2 bg-[radial-gradient(circle_at_center,rgba(242,213,140,0.22)_0%,rgba(212,166,74,0.08)_22%,transparent_45%)]"
          style={{ x: glareX, y: glareY, opacity: glareOpacity }}
        />
      </div>
    </motion.div>
  );
}

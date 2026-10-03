"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#fbf4e2", "#f2d58c", "#d4a64a", "#b98b34", "#c8243a", "#2e55b8"];

/** Full-screen canvas that fires a gold confetti celebration once mounted. */
export function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let instance: { reset: () => void } | null = null;

    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const fire = confetti.create(canvas, { resize: true, disableForReducedMotion: true });
      instance = fire;
      void fire({ particleCount: 140, spread: 95, startVelocity: 48, origin: { y: 0.55 }, colors: COLORS, scalar: 1.05 });
      void fire({ particleCount: 70, angle: 60, spread: 62, origin: { x: 0, y: 0.75 }, colors: COLORS });
      void fire({ particleCount: 70, angle: 120, spread: 62, origin: { x: 1, y: 0.75 }, colors: COLORS });
      canvas.dataset.fired = "true";
    });

    return () => {
      cancelled = true;
      instance?.reset();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-testid="confetti-canvas"
      data-fired="false"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

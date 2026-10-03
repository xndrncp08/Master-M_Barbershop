"use client";

import { animate, stagger, svg } from "animejs";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Pivot of the scissors in viewBox coordinates. */
const PIVOT = { x: 300, y: 330 };

const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;

const COMB_TEETH = Array.from({ length: 22 }, (_, i) => {
  const x = 832 + i * 12;
  const length = i < 9 ? 54 : 40;
  return `M${x} 252 V${252 + length}`;
}).join(" ");

/**
 * Decorative line art echoing the emblem: crown, scissors and comb. Anime.js
 * draws each stroke in sequence, then the scissors keep a slow, subtle snip.
 * Hidden from assistive tech; static for reduced-motion users.
 */
export function BarberLineArt({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      root.dataset.ready = "true";
      return;
    }

    const drawables = svg.createDrawable(root.querySelectorAll("[data-draw]"));
    const draw = animate(drawables, {
      draw: ["0 0", "0 1"],
      ease: "inOutQuad",
      duration: 1400,
      delay: stagger(70),
    });
    root.dataset.ready = "true";

    const bladeA = root.querySelector<SVGGElement>("[data-blade='a']");
    const bladeB = root.querySelector<SVGGElement>("[data-blade='b']");
    const snipOptions = {
      duration: 700,
      ease: "inOutSine",
      loop: true,
      loopDelay: 2600,
      alternate: true,
      delay: 2200,
    } as const;
    const snipA = bladeA ? animate(bladeA, { rotate: [0, -7], ...snipOptions }) : null;
    const snipB = bladeB ? animate(bladeB, { rotate: [0, 7], ...snipOptions }) : null;

    return () => {
      draw.revert();
      snipA?.revert();
      snipB?.revert();
    };
  }, []);

  const pivotStyle = {
    transformBox: "view-box",
    transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`,
  } as const;

  return (
    <svg
      ref={ref}
      aria-hidden
      focusable="false"
      viewBox="0 0 1200 520"
      fill="none"
      className={cn(
        "pointer-events-none opacity-0 transition-opacity duration-300 data-[ready=true]:opacity-100",
        className,
      )}
    >
      <defs>
        <linearGradient id="line-art-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6e7bf" />
          <stop offset="50%" stopColor="#d4a64a" />
          <stop offset="100%" stopColor="#966d27" />
        </linearGradient>
      </defs>

      <g
        stroke="url(#line-art-gold)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Crown */}
        <path data-draw d="M530 140 L545 72 L580 106 L600 52 L620 106 L655 72 L670 140 Z" />
        <path data-draw d="M524 156 H676" />
        <path data-draw d={ring(545, 62, 7)} />
        <path data-draw d={ring(600, 41, 8)} />
        <path data-draw d={ring(655, 62, 7)} />

        {/* Scissors — each half rotates around the shared pivot */}
        <g data-blade="a" style={pivotStyle}>
          <path data-draw d={ring(170, 420, 34)} />
          <path data-draw d="M196 398 L300 330" />
          <path data-draw d="M300 330 L436 242 L306 343" />
        </g>
        <g data-blade="b" style={pivotStyle}>
          <path data-draw d={ring(128, 340, 34)} />
          <path data-draw d="M162 344 L300 330" />
          <path data-draw d="M300 330 L452 313 L296 343" />
        </g>
        <path data-draw d={ring(PIVOT.x, PIVOT.y, 7)} />

        {/* Comb */}
        <g transform="rotate(-14 960 270)">
          <path data-draw d="M822 222 H1110 Q1118 222 1118 230 V252 H822 Q814 252 814 244 V230 Q814 222 822 222 Z" />
          <path data-draw d={COMB_TEETH} />
        </g>
      </g>
    </svg>
  );
}

"use client";

import { motion } from "framer-motion";

const LINES = ["Precision Cuts.", "Master Barbering.", "Pure Style."];

/** Headline that reveals line by line; wrappers animate, never the text nodes themselves. */
export function HeroHeadline() {
  return (
    <h1 id="hero-heading" className="font-display text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
      {LINES.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-1">
          <motion.span
            className={index === 1 ? "block text-gold-gradient" : "block"}
            initial={{ opacity: 0, y: "60%" }}
            animate={{ opacity: 1, y: "0%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 + index * 0.12 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

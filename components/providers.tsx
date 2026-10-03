"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** `reducedMotion="user"` disables transform animations for users who opt out. */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

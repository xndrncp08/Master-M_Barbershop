"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 15_000);
  document.addEventListener("visibilitychange", callback);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", callback);
  };
}

const getMinute = () => Math.floor(Date.now() / 60_000);

/**
 * Current time bucketed to the minute, or null during SSR/hydration so
 * time-dependent UI renders a stable placeholder first.
 */
export function useMinuteClock(): Date | null {
  const minute = useSyncExternalStore(subscribe, getMinute, () => null);
  return minute === null ? null : new Date(minute * 60_000);
}

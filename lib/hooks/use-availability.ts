"use client";

import { useEffect, useState } from "react";
import type { Slot } from "@/lib/booking/slots";

const REFRESH_MS = 30_000;

interface AvailabilityQuery {
  date: string;
  barber: string;
  service: string;
}

/**
 * Live slot availability. Refreshes every 30 s and whenever the tab regains
 * focus so slot states stay current while someone is choosing.
 */
export function useAvailability(query: AvailabilityQuery | null) {
  const key = query ? `${query.date}|${query.barber}|${query.service}` : null;
  const [result, setResult] = useState<{ key: string; slots: Slot[] } | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!key) return;
    const [date, barber, service] = key.split("|") as [string, string, string];
    const controller = new AbortController();

    async function load() {
      try {
        const params = new URLSearchParams({ date, barber, service });
        const response = await fetch(`/api/availability?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(
            response.status === 429
              ? "Too many refreshes. Wait a moment, then try again."
              : "Couldn't load times. Check your connection and try again.",
          );
        }
        const json = (await response.json()) as { slots: Slot[] };
        setResult({ key: key!, slots: json.slots });
        setError(null);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError({
          key: key!,
          message: cause instanceof Error ? cause.message : "Couldn't load times.",
        });
      }
    }

    void load();
    const interval = window.setInterval(load, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [key, nonce]);

  return {
    /** null while the first response for this query is loading. */
    slots: result && result.key === key ? result.slots : null,
    error: error && error.key === key ? error.message : null,
    refresh: () => setNonce((n) => n + 1),
  };
}

"use server";

import { headers } from "next/headers";
import { processBooking, type BookingResult } from "@/lib/booking/service";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

/** Server Actions bypass the /api proxy matcher, so they carry their own limiter. */
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function submitBooking(input: unknown): Promise<BookingResult> {
  const ip = getClientIp(await headers());
  const rate = limiter.check(`action:booking:${ip}`);
  if (!rate.success) {
    return {
      ok: false,
      code: "validation",
      error: `Too many booking attempts. Try again in ${Math.ceil(rate.retryAfter / 60)} min, or call us.`,
    };
  }
  return processBooking(input);
}

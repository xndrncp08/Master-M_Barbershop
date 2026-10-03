import { NextResponse, type NextRequest } from "next/server";
import { createRateLimiter, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

/** Booking submissions: 5 per 10 minutes per client. */
const bookingLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
/** Everything else under /api (availability polling etc.): 60 per minute. */
const apiLimiter = createRateLimiter({ limit: 60, windowMs: 60 * 1000 });

export function proxy(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const isBookingWrite =
    request.method === "POST" && request.nextUrl.pathname.startsWith("/api/bookings");

  const limiter = isBookingWrite ? bookingLimiter : apiLimiter;
  const bucket = isBookingWrite ? "booking" : "api";
  const result = limiter.check(`${bucket}:${ip}`);
  const headers = rateLimitHeaders(result);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Wait a moment, then try again.",
        retryAfter: result.retryAfter,
      },
      { status: 429, headers },
    );
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};

/**
 * Sliding-window rate limiter.
 *
 * State lives in process memory, which is enough to blunt spam bursts against a
 * single instance. For multi-region deployments swap the Map for a shared store
 * (e.g. Upstash Redis) behind the same `check` signature.
 */

export interface RateLimitOptions {
  /** Maximum requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Upper bound on tracked keys before stale entries are swept. */
  maxKeys?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Epoch milliseconds when the oldest hit in the window expires. */
  reset: number;
  /** Seconds the caller should wait before retrying (0 when allowed). */
  retryAfter: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
  reset(key?: string): void;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: RateLimitOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  function sweep(now: number) {
    for (const [key, stamps] of hits) {
      const last = stamps[stamps.length - 1];
      if (last === undefined || now - last >= windowMs) hits.delete(key);
    }
  }

  return {
    check(key, now = Date.now()) {
      if (hits.size > maxKeys) sweep(now);

      const windowStart = now - windowMs;
      const stamps = (hits.get(key) ?? []).filter((t) => t > windowStart);
      const oldest = stamps[0] ?? now;
      const reset = oldest + windowMs;

      if (stamps.length >= limit) {
        hits.set(key, stamps);
        return {
          success: false,
          limit,
          remaining: 0,
          reset,
          retryAfter: Math.max(1, Math.ceil((reset - now) / 1000)),
        };
      }

      stamps.push(now);
      hits.set(key, stamps);
      return {
        success: true,
        limit,
        remaining: limit - stamps.length,
        reset: (stamps[0] ?? now) + windowMs,
        retryAfter: 0,
      };
    },
    reset(key) {
      if (key === undefined) hits.clear();
      else hits.delete(key);
    },
  };
}

/** Best-effort client identifier from proxy headers. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "anonymous";
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
  };
  if (!result.success) headers["Retry-After"] = String(result.retryAfter);
  return headers;
}

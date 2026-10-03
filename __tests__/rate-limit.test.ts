import { describe, expect, it } from "vitest";
import { createRateLimiter, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit, then blocks", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
    const results = [0, 1, 2, 3].map((t) => limiter.check("ip", 1000 + t));
    expect(results.map((r) => r.success)).toEqual([true, true, true, false]);
    expect(results[2]!.remaining).toBe(0);
    expect(results[3]!.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("frees capacity as the window slides", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    limiter.check("ip", 0);
    limiter.check("ip", 500);
    expect(limiter.check("ip", 900).success).toBe(false);
    expect(limiter.check("ip", 1001).success).toBe(true);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.check("a", 0).success).toBe(true);
    expect(limiter.check("b", 0).success).toBe(true);
    expect(limiter.check("a", 1).success).toBe(false);
  });
});

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for hop", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip, then anonymous", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
    expect(getClientIp(new Headers())).toBe("anonymous");
  });
});

describe("rateLimitHeaders", () => {
  it("adds Retry-After only when blocked", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(rateLimitHeaders(limiter.check("x", 0))).not.toHaveProperty("Retry-After");
    expect(rateLimitHeaders(limiter.check("x", 1))).toHaveProperty("Retry-After", "60");
  });
});

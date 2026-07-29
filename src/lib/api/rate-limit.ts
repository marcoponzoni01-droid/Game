/**
 * In-process sliding-window rate limiter.
 *
 * A fixed window lets a caller spend its whole allowance at the end of one
 * window and again at the start of the next — twice the intended rate across
 * the boundary. This weights the previous window by how much of it still
 * overlaps the last `windowMs`, which smooths that out for a few arithmetic
 * operations and one map entry per caller.
 *
 * IMPORTANT: the counters live in this process's memory. That is correct for a
 * single long-running server and wrong for anything horizontally scaled —
 * on Vercel each lambda gets its own map, so the effective limit is roughly
 * (limit x instances) and resets on every cold start. Moving to Redis or
 * Upstash is the fix; `check()` is deliberately the only thing that would need
 * to change.
 */

type Bucket = {
  windowStart: number;
  count: number;
  previousCount: number;
};

const buckets = new Map<string, Bucket>();

/** Stop the map growing without bound when callers come and go. */
const MAX_TRACKED = 10_000;

function sweep(now: number, windowMs: number) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > windowMs * 2) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the window rolls over. */
  resetSeconds: number;
};

export function check(
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED) sweep(now, windowMs);

  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = { windowStart: now, count: 0, previousCount: 0 };
    buckets.set(identifier, bucket);
  }

  const elapsed = now - bucket.windowStart;

  if (elapsed >= windowMs * 2) {
    // Idle for more than two windows — nothing worth carrying forward.
    bucket.windowStart = now;
    bucket.previousCount = 0;
    bucket.count = 0;
  } else if (elapsed >= windowMs) {
    bucket.windowStart = bucket.windowStart + windowMs;
    bucket.previousCount = bucket.count;
    bucket.count = 0;
  }

  const intoWindow = now - bucket.windowStart;
  const carryOver = bucket.previousCount * (1 - intoWindow / windowMs);
  const estimated = bucket.count + carryOver;

  const resetSeconds = Math.max(
    1,
    Math.ceil((bucket.windowStart + windowMs - now) / 1000),
  );

  if (estimated >= limit) {
    return { allowed: false, limit, remaining: 0, resetSeconds };
  }

  bucket.count += 1;

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, Math.floor(limit - estimated - 1)),
    resetSeconds,
  };
}

/** Test seam — the limiter is module state, so tests need a way to reset it. */
export function reset() {
  buckets.clear();
}

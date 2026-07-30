import { authenticate } from "@/lib/api/auth";
import { check, type RateLimitResult } from "@/lib/api/rate-limit";
import { tooManyRequests, unauthorized } from "@/lib/api/responses";

/**
 * Authentication and rate limiting for the read-only API.
 *
 * This is a per-route wrapper rather than `proxy.ts`, because validating a key
 * means a Prisma lookup and the Next docs are explicit that Proxy "should not
 * be used as a full session management or authorization solution" and is "not
 * intended for slow data fetching".
 */

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

/**
 * Off by default: the API serves exactly what the website already renders
 * publicly, so requiring a key is a deployment decision rather than a
 * correctness one. Set API_REQUIRE_KEY=true when it is exposed to the internet.
 */
function requireKey(): boolean {
  return process.env.API_REQUIRE_KEY === "true";
}

function limits() {
  return {
    anonymous: envInt("API_RATE_LIMIT_ANON", 60),
    authenticated: envInt("API_RATE_LIMIT_AUTHENTICATED", 600),
    windowMs: envInt("API_RATE_LIMIT_WINDOW_SECONDS", 60) * 1000,
  };
}

/**
 * Best-effort client identity for anonymous callers.
 *
 * `x-forwarded-for` is only trustworthy when a proxy you control sets it —
 * Vercel and most managed platforms do. Exposed directly to the internet, a
 * caller can forge it and sidestep the anonymous limit, which is one more
 * reason to turn on API_REQUIRE_KEY in that situation.
 */
function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return `ip:${forwarded.split(",")[0].trim()}`;

  const real = request.headers.get("x-real-ip");
  if (real) return `ip:${real.trim()}`;

  return "ip:unknown";
}

function withRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
): Response {
  const headers = new Headers(response.headers);
  headers.set("RateLimit-Limit", String(result.limit));
  headers.set("RateLimit-Remaining", String(result.remaining));
  headers.set("RateLimit-Reset", String(result.resetSeconds));

  // A constructed Response's headers are mutable, but rebuilding is immune to
  // whichever guard the runtime applies.
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

type Handler<C> = (request: Request, context: C) => Promise<Response>;

export function withApi<C>(handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    const auth = await authenticate(request);
    const { anonymous, authenticated, windowMs } = limits();

    if (auth.state === "invalid") {
      return unauthorized(auth.reason);
    }

    if (auth.state === "anonymous" && requireKey()) {
      return unauthorized(
        "An API key is required. Send it as `Authorization: Bearer <key>` or `X-API-Key: <key>`.",
      );
    }

    // Authenticated callers are limited per key, so one caller's traffic cannot
    // exhaust another's, and get a much higher ceiling than shared anonymous IPs.
    const identifier =
      auth.state === "valid" ? `key:${auth.keyId}` : clientIdentifier(request);
    const limit = auth.state === "valid" ? authenticated : anonymous;

    const result = check(identifier, limit, windowMs);

    if (!result.allowed) {
      return withRateLimitHeaders(
        tooManyRequests(result.resetSeconds),
        result,
      );
    }

    return withRateLimitHeaders(await handler(request, context), result);
  };
}

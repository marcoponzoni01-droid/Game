/** JSON response helpers shared by every route handler under `src/app/api`. */

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export function ok(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export function badRequest(message: string): Response {
  return Response.json(
    { error: { code: "bad_request", message } } satisfies ApiError,
    { status: 400 },
  );
}

export function notFound(message: string): Response {
  return Response.json(
    { error: { code: "not_found", message } } satisfies ApiError,
    { status: 404 },
  );
}

export function unauthorized(message: string): Response {
  return Response.json(
    { error: { code: "unauthorized", message } } satisfies ApiError,
    {
      status: 401,
      // Tells a client which scheme to retry with, per RFC 9110.
      headers: { "WWW-Authenticate": 'Bearer realm="The Archive API"' },
    },
  );
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return Response.json(
    {
      error: {
        code: "rate_limited",
        message: `Rate limit exceeded. Retry in ${retryAfterSeconds}s.`,
      },
    } satisfies ApiError,
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export function serverError(message: string): Response {
  return Response.json(
    { error: { code: "server_error", message } } satisfies ApiError,
    { status: 500 },
  );
}

export type Pagination = {
  total: number;
  limit: number;
  offset: number;
};

export function list<T>(data: T[], pagination: Pagination): Response {
  return ok({ data, pagination });
}

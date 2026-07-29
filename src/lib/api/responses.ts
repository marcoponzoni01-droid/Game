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

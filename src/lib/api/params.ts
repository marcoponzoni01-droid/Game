/** Query-parameter parsing and validation for the read-only API. */

export type Parsed<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export type Paging = { limit: number; offset: number };

function parseNonNegativeInt(
  raw: string,
  name: string,
): Parsed<number> {
  // Number() would accept "1e3", " 12 " and "0x10"; be stricter than that.
  if (!/^\d+$/.test(raw)) {
    return { ok: false, message: `${name} must be a non-negative integer.` };
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value)) {
    return { ok: false, message: `${name} is out of range.` };
  }

  return { ok: true, value };
}

export function parsePaging(params: URLSearchParams): Parsed<Paging> {
  let limit = DEFAULT_LIMIT;
  let offset = 0;

  const rawLimit = params.get("limit");
  if (rawLimit !== null) {
    const parsed = parseNonNegativeInt(rawLimit, "limit");
    if (!parsed.ok) return parsed;

    if (parsed.value < 1 || parsed.value > MAX_LIMIT) {
      return {
        ok: false,
        message: `limit must be between 1 and ${MAX_LIMIT}.`,
      };
    }

    limit = parsed.value;
  }

  const rawOffset = params.get("offset");
  if (rawOffset !== null) {
    const parsed = parseNonNegativeInt(rawOffset, "offset");
    if (!parsed.ok) return parsed;
    offset = parsed.value;
  }

  return { ok: true, value: { limit, offset } };
}

/**
 * Repeatable filters. Both `?event_type=a&event_type=b` and `?event_type=a,b`
 * work, because clients reasonably expect one or the other.
 */
export function parseMulti(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((raw) => raw.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseBoolean(
  params: URLSearchParams,
  key: string,
): Parsed<boolean | undefined> {
  const raw = params.get(key);
  if (raw === null) return { ok: true, value: undefined };

  if (raw === "true") return { ok: true, value: true };
  if (raw === "false") return { ok: true, value: false };

  return { ok: false, message: `${key} must be "true" or "false".` };
}

export const CASE_STUDY_SORTS = ["date_desc", "date_asc", "title"] as const;
export type CaseStudySort = (typeof CASE_STUDY_SORTS)[number];

export function parseCaseStudySort(
  params: URLSearchParams,
): Parsed<CaseStudySort> {
  const raw = params.get("sort");
  if (raw === null) return { ok: true, value: "date_desc" };

  if ((CASE_STUDY_SORTS as readonly string[]).includes(raw)) {
    return { ok: true, value: raw as CaseStudySort };
  }

  return {
    ok: false,
    message: `sort must be one of: ${CASE_STUDY_SORTS.join(", ")}.`,
  };
}

export const SEARCH_TYPES = ["case_study", "glossary_term"] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export function parseSearchType(
  params: URLSearchParams,
): Parsed<SearchType | undefined> {
  const raw = params.get("type");
  if (raw === null) return { ok: true, value: undefined };

  if ((SEARCH_TYPES as readonly string[]).includes(raw)) {
    return { ok: true, value: raw as SearchType };
  }

  return {
    ok: false,
    message: `type must be one of: ${SEARCH_TYPES.join(", ")}.`,
  };
}

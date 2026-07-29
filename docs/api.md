# Read-only API

JSON over HTTP, `GET` only. Every other method returns `405`.

## Authentication

Optional by default, because the API serves exactly what the website already
renders publicly. Set `API_REQUIRE_KEY=true` to require a key on every `/api/*`
route — do that whenever the app is reachable from the internet.

Keys are accepted in either header:

```
curl -H "Authorization: Bearer arch_…" https://…/api/case-studies
curl -H "X-API-Key: arch_…"            https://…/api/case-studies
```

Manage them from the command line:

```
npm run api:key -- create "docs site" [--expires-days 90]
npm run api:key -- list
npm run api:key -- revoke <id-or-prefix>
```

The full key is printed **once**, at creation. Only a SHA-256 hash is stored, so
a lost key cannot be recovered — mint a replacement and revoke the old one.
Revoking sets a timestamp rather than deleting, so the key stays auditable.

A key that is unknown, revoked or past its `expiresAt` gets `401` with a
`WWW-Authenticate` header and a message saying which of the three it was.

## Rate limiting

Every response carries the current state:

```
RateLimit-Limit: 60
RateLimit-Remaining: 58
RateLimit-Reset: 41
```

Exceeding the limit returns `429` with `Retry-After` in seconds. Anonymous
callers are counted per client IP and key holders per key, so one caller cannot
spend another's allowance — and authenticated callers get a much higher ceiling.

| Setting                          | Default |
| -------------------------------- | ------- |
| `API_RATE_LIMIT_ANON`            | 60      |
| `API_RATE_LIMIT_AUTHENTICATED`   | 600     |
| `API_RATE_LIMIT_WINDOW_SECONDS`  | 60      |

**Two limitations worth knowing before you rely on this.**

The counters live in the server process's memory. That is correct for one
long-running instance and wrong for anything horizontally scaled: on Vercel each
lambda keeps its own counters, so the effective limit is roughly *limit x
instances* and resets on every cold start. Moving to Redis or Upstash is the
fix, and `check()` in `src/lib/api/rate-limit.ts` is the only function that
would change.

Anonymous limiting identifies callers by `x-forwarded-for`, which is only
trustworthy when a proxy you control sets it. Managed platforms do; a directly
exposed server does not, and there a caller can forge the header to get a fresh
allowance. That is the main reason to turn `API_REQUIRE_KEY` on in that setup.

> **Field names are provisional.** `schema.md` is not in this repository, so
> these names are derived from `prisma/schema.prisma` and serialised to
> snake_case. If `schema.md` names things differently, `src/lib/api/serialize.ts`
> is the only file that needs changing — no route handler builds a response
> object itself.

**Visibility.** Every endpoint is restricted to case studies whose
`verification_status` is `verified` or `published`, using the same
`PUBLIC_STATUSES` constant the website uses (`src/lib/queries.ts`). Drafts are
invisible here, including in nested `related_case_studies`.

## Endpoints

### `GET /api/case-studies`

| Param        | Notes                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| `event_type` | Slug or display name, case-insensitive. Repeatable, or comma-separated. |
| `region`     | Same.                                                                   |
| `era`        | Same.                                                                   |
| `asset_class`| Matches any case study with an impact in that class, e.g. `Commodities`.|
| `featured`   | `true` / `false`.                                                       |
| `limit`      | 1–100, default 20.                                                      |
| `offset`     | Default 0.                                                              |
| `sort`       | `date_desc` (default), `date_asc`, `title`.                             |

Repeated values within one filter are OR-ed; different filters are AND-ed.
`?event_type=energy-shock&event_type=sanctions` means either type;
`?event_type=energy-shock&region=europe` means both.

```
GET /api/case-studies?event_type=energy-shock&limit=2
{
  "data": [ /* case study, summary form */ ],
  "pagination": { "total": 2, "limit": 2, "offset": 0 }
}
```

### `GET /api/case-studies/{slug}`

Detail form. `404` if the slug is unknown or the entry is not public.

### `GET /api/glossary-terms`

`case_study` (slug, repeatable) narrows to terms linked to those case studies.
`limit` / `offset` as above. Sorted by `term`.

### `GET /api/glossary-terms/{slug}`

Detail form. `404` if unknown.

### `GET /api/search`

`q` is required. Optional `type=case_study|glossary_term` narrows to one table;
`limit` / `offset` page the combined result.

Matches case-insensitive substrings on case-study `title`, `summary`,
`so_what`, `deep_dive`, `persistence`, and on glossary `term`,
`short_definition`.

```
GET /api/search?q=oil
{
  "query": "oil",
  "data": [ { "type": "case_study", ... }, { "type": "glossary_term", ... } ],
  "counts": { "case_studies": 3, "glossary_terms": 1 },
  "pagination": { "total": 4, "limit": 20, "offset": 0 }
}
```

## Shapes

**Case study — summary form.** Used in lists, search hits, and every nested
position.

```
id, title, slug, start_date, end_date, date_display, summary, so_what,
featured, event_types[], regions[], eras[], asset_classes[]
```

`end_date` is `null` for an ongoing event. Dates are ISO 8601.
`asset_classes[]` is the distinct list derived from the entry's market impacts.
Tags are `{ id, name, slug }`; eras add `sort_order`.

**Case study — detail form.** Summary form plus:

```
deep_dive, persistence, verification_status, created_at, updated_at,
market_impacts[], sources[], related_glossary_terms[], related_case_studies[],
newsletter_issues[]
```

- `related_glossary_terms[]` — full objects: `{ id, term, slug, short_definition }`
- `related_case_studies[]` — full objects in **summary form**, each with a
  `note` explaining why the link exists (the note lives on the join, not on
  either case study)
- `market_impacts[]` — `{ id, asset_class, instrument, direction, magnitude, timeframe, mechanism, sort_order }`; `direction` is one of `rise`, `decline`, `mixed`, `flat`
- `sources[]` — `{ id, url, label, sort_order }`
- `newsletter_issues[]` — `{ issue_number, title, publish_date }`

**Nested case studies are never expanded further.** A response is always exactly
one level deep, so there are no cycles and no unbounded payloads.

**Glossary term.** `{ id, term, slug, short_definition }`; the detail form adds
`related_case_studies[]` in summary form.

## Errors

```
{ "error": { "code": "not_found", "message": "No case study with slug \"nope\"." } }
```

`400` `bad_request` for invalid params, `404` `not_found` for unknown slugs,
`405` for any non-`GET` method.

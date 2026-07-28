# The Archive

A searchable database of geopolitical events and the market impact each one
had, paired with a weekly newsletter. Written for students and generalists —
the aim is to teach the mechanism, not to be a professional trading tool.

**Phase 1 scope.** Public site skeleton, Prisma data model, and the "The
Archive" design system, with four real seed entries so every page type is
testable end to end. Authentication, the `/admin` verification dashboard, and
real newsletter sending are Phase 2.

## Running it

Requires Node 20+ and a local Postgres.

```bash
# 1. a local database — either of these works
docker run --name archive-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=archive -p 5432:5432 -d postgres:16
# ...or, with Postgres already installed locally:
createdb archive

# 2. point the app at it
cp .env.example .env      # edit DATABASE_URL if your setup differs

# 3. schema + seed data
npm install
npm run db:migrate
npm run db:seed

# 4. go
npm run dev               # http://localhost:3000
```

### Scripts

| Script             | Does                                                |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Development server                                   |
| `npm run build`    | `prisma generate` then `next build`                  |
| `npm run db:migrate` | Create and apply a migration from the schema       |
| `npm run db:seed`  | Wipe and reseed the four entries and four issues     |
| `npm run db:reset` | Drop, re-migrate, reseed                             |
| `npm run db:studio`| Prisma Studio                                        |

## Pages in this phase

| Route                       | What it is                                                        |
| --------------------------- | ----------------------------------------------------------------- |
| `/`                         | Latest newsletter teaser + featured database entries               |
| `/database`                 | All entries, client-side filters by event type, region, asset class |
| `/database/[slug]`          | Card view → expandable deep dive, market impact, related events, sources |
| `/newsletter`               | Issue archive                                                      |
| `/newsletter/[issueNumber]` | A single issue with its linked precedents                          |

Deliberately not built yet: glossary page, timeline view, map view, `/admin`,
auth, newsletter sending.

## Structure

```
prisma/
  schema.prisma     data model (see docs/schema-field-map.md)
  seed.ts           four researched entries + four issues
src/
  app/              routes
  components/       shared UI, all built on the design tokens
  lib/
    prisma.ts       client singleton (Prisma 7 + node-postgres adapter)
    queries.ts      every database read the pages make
    format.ts       direction → accent colour, dates, paragraph splitting
  generated/prisma  generated client — not committed, rebuilt by postinstall
docs/
  schema-field-map.md
```

## Design system — "The Archive"

Tokens live in `src/app/globals.css` under `@theme`, and nowhere else. No raw
hex in components.

| Role                    | Token                | Hex       |
| ----------------------- | -------------------- | --------- |
| Background              | `--color-parchment`  | `#F7F3EA` |
| Primary text, headlines | `--color-ink`        | `#1B2A4A` |
| Secondary text          | `--color-ink-muted`  | `#5C5648` |
| Accent — decline        | `--color-decline`    | `#A6553B` |
| Accent — rise           | `--color-rise`       | `#3E6B4F` |
| Tag background          | `--color-tag-bg`     | `#EFE2D3` |
| Tag text                | `--color-tag-text`   | `#7A4A2E` |
| Divider                 | `--color-rule`       | `#D9CFBE` |

- Headlines and pull-quotes: **Source Serif 4**. Body and UI: **Inter**. Both
  self-hosted via `next/font`.
- Numbers and stats use the `stat-value` utility — sans, weight 500, tabular
  figures. Not monospace: this is narrative-first, not dashboard-first.
- Tags are 4px-radius pills using the tag background/text pair, never grey.
- Market-impact stats render as label-above / value-below rows, not a boxed
  table.
- `editorial-note` (serif italic) is reserved for "so what" lines and
  newsletter teasers — the signature tying the two content types together.
- Hairline borders only, via `hairline-t` / `hairline-b` / `hairline-l` /
  `hairline-all` (1px, 0.5px on retina). No drop shadows.

## Notes for Phase 2

- Data pages are `force-dynamic` so a reseed shows up immediately and the build
  never needs a database. Switch to `revalidate` when hosting lands.
- The database is local by design in Phase 1; Neon/Supabase is a Phase 2
  decision, once the schema has stopped moving.
- Seed entries are marked `verified` purely so the public queries return them.
  `PUBLIC_STATUSES` in `src/lib/queries.ts` is the one place to change when the
  real `draft → needs_verification → verified → published` workflow exists.

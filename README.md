# The Archive

A searchable database of geopolitical events and the market impact each one
had, paired with a weekly newsletter. Written for students and generalists —
the aim is to teach the mechanism, not to be a professional trading tool.

**Phase 1 scope.** Public site skeleton, Prisma data model, and the "The
Archive" design system, with four real seed entries so every page type is
testable end to end. Authentication, the `/admin` verification dashboard, and
real newsletter sending are Phase 2.

## Running it

You need **Node 20.9.0 or newer** (the floor Next 16 sets) and a Postgres to
point at. The commands below are single-line on purpose, so they behave the
same in PowerShell, cmd and bash.

**1. Start a database.** Docker is the path of least resistance — it matches
`.env.example` exactly, so there is nothing to configure:

```
docker run --name archive-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=archive -p 5432:5432 -d postgres:16
```

On Windows this needs Docker Desktop running first. After a reboot the
container is stopped rather than gone — start it again with
`docker start archive-db`, not `docker run`.

<details>
<summary>Using a Postgres you installed natively instead</summary>

Create the database, then **edit `DATABASE_URL` in `.env` to match your own
role and password** — a native install rarely has the `postgres`/`postgres`
credentials the Docker image ships with, and the mismatch shows up as an
authentication error rather than anything obvious:

```
createdb archive
```

</details>

**2. Point the app at it.**

```
Copy-Item .env.example .env    # PowerShell
cp .env.example .env           # bash / zsh
```

**3. Install, migrate, seed.**

```
npm install
npm run db:migrate
npm run db:seed
```

**4. Run it.**

```
npm run dev
```

Then open <http://localhost:3000>.

### Did it work?

`npm run db:migrate` applies the schema but does **not** seed — the two are
separate steps. A successful `npm run db:seed` prints its row counts:

```
Seeded The Archive: {
  entries: 4,
  marketImpacts: 23,
  sources: 23,
  relatedEvents: 6,
  glossaryTerms: 12,
  issues: 4
}
```

`/database` should then list four entries — the 1973 oil embargo, the 2016
Brexit referendum, the 2020 COVID shock, and Russia's 2022 invasion of Ukraine
— and `/newsletter` should list four issues. If the pages render but the lists
are empty, the app reached Postgres but the seed did not run.

### Troubleshooting

| Symptom                                                        | Cause and fix                                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `error during connect` / `docker: command not found`            | Docker Desktop isn't running (or isn't installed). Start it and retry.                                                     |
| `port is already allocated` / `address already in use`          | Something else holds 5432 — usually an existing Postgres service. Stop it, or map another port (`-p 5433:5432`) and change the port in `.env` to match. |
| `DATABASE_URL is not set. Copy .env.example to .env…`           | Step 2 was skipped. That message comes from `src/lib/prisma.ts`.                                                            |
| `password authentication failed for user "postgres"`            | You're on a native Postgres whose credentials differ from the defaults. Edit `DATABASE_URL` in `.env`.                      |
| `Can't reach database server at 127.0.0.1:5432`                 | The database isn't up. `docker start archive-db`.                                                                          |

### Scripts

| Script             | Does                                                |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Development server                                   |
| `npm run build`    | `prisma generate` then `next build`                  |
| `npm run db:migrate` | Create and apply a migration from the schema       |
| `npm run db:seed`  | Wipe and reseed the four entries and four issues     |
| `npm run db:reset` | Drop, re-migrate, reseed                             |
| `npm run db:studio`| Prisma Studio                                        |
| `npm run api:key`  | Create, list and revoke API keys                     |

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

## API

A read-only JSON API sits over the same data: list, filter and detail
endpoints for case studies and glossary terms, plus search across both.

```
GET /api/case-studies            ?event_type= &region= &era= &asset_class= &featured= &limit= &offset= &sort=
GET /api/case-studies/{slug}     related_glossary_terms and related_case_studies resolved into full objects
GET /api/glossary-terms          ?case_study=
GET /api/glossary-terms/{slug}
GET /api/search?q=               both tables, results discriminated by `type`
```

Keys are optional by default and required when `API_REQUIRE_KEY=true`; every
response is rate limited and carries `RateLimit-*` headers.

```
npm run api:key -- create "docs site"    # prints the key once
npm run api:key -- list
npm run api:key -- revoke <id-or-prefix>
```

Full reference, including every field name, in [`docs/api.md`](docs/api.md).

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

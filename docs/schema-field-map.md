# Schema field map

Where each item from the Phase 1 brief lives in `prisma/schema.prisma`.

> **Note:** `product-spec.md` is not in this repository (see the Phase 1 note in
> the README). The names below were taken from the wording of the brief itself.
> If the spec's §3–4 use different names, rename here first — every column is
> referenced from `src/lib/queries.ts` and the components, so a Prisma rename
> plus a migration is the whole change.

## §3 — Database entry

| Brief                                   | Model.field                          |
| --------------------------------------- | ------------------------------------ |
| title                                   | `DatabaseEntry.title`                |
| slug                                    | `DatabaseEntry.slug` (unique)        |
| date range                              | `DatabaseEntry.startDate` / `.endDate` (null = ongoing) |
| — display form of the range             | `DatabaseEntry.dateDisplay` †        |
| summary (card)                          | `DatabaseEntry.summary`              |
| deep-dive body                          | `DatabaseEntry.deepDive`             |
| duration / persistence                  | `DatabaseEntry.persistence`          |
| "so what" pattern line                  | `DatabaseEntry.soWhat`               |
| verification status enum                | `DatabaseEntry.verificationStatus` → `VerificationStatus { draft, needs_verification, verified, published }` |
| — home-page surfacing                   | `DatabaseEntry.featured` †           |

## Tag tables (many-to-many with `DatabaseEntry`)

| Brief       | Model       | Fields                          |
| ----------- | ----------- | ------------------------------- |
| EventType   | `EventType` | `name`, `slug`                  |
| Region      | `Region`    | `name`, `slug`                  |
| Era         | `Era`       | `name`, `slug`, `sortOrder` †   |

## MarketImpact (belongs to a DatabaseEntry)

| Brief                  | Field                                        |
| ---------------------- | -------------------------------------------- |
| asset class            | `assetClass`                                 |
| instrument / example   | `instrument`                                 |
| direction              | `direction` → `ImpactDirection { rise, decline, mixed, flat }` ‡ |
| magnitude              | `magnitude`                                  |
| timeframe              | `timeframe`                                  |
| mechanism explanation  | `mechanism`                                  |
| — stable ordering      | `sortOrder` †                                |

## Other models

| Brief                                          | Model / fields                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| RelatedEvent — self-relation, precedents       | `RelatedEvent.entryId` → `.relatedEntryId`, plus `note` † and `sortOrder` † |
| Source — belongs to entry; url, label          | `Source.url`, `Source.label`, `Source.sortOrder` †                    |
| GlossaryTerm — term, short definition, linked  | `GlossaryTerm.term`, `.slug`, `.shortDefinition`, `entries` (m2m)     |

## §4 — NewsletterIssue

| Brief                              | Field                                    |
| ---------------------------------- | ---------------------------------------- |
| issue number                       | `issueNumber` (unique, used as the URL)  |
| publish date                       | `publishDate`                            |
| current-event summary              | `currentEventSummary`                    |
| essay body                         | `essayBody`                              |
| linked DatabaseEntry precedents    | `precedents` (many-to-many)              |
| optional "what to watch"           | `whatToWatch` (nullable)                 |
| — headline                         | `title` †                                |
| — serif-italic teaser              | `teaser` †                               |

---

† Not named in the brief; added because a page specified for Phase 1 needs it
(a display date string for "October 1973 – March 1974", a `featured` flag for
the home page, a `title`/`teaser` for the newsletter archive listing, and
`sortOrder` columns so editorial ordering survives a reseed).

‡ The brief lists `direction` without saying enum. It is one here because the
design system picks the rise/decline accent colour from it, and free text would
make that mapping unreliable.

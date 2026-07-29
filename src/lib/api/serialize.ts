/**
 * Prisma row → API JSON.
 *
 * Every field name the API exposes is decided here and nowhere else. The names
 * are snake_case, derived from `prisma/schema.prisma`, and are **provisional**:
 * `schema.md` is not in this repository, so if it names things differently this
 * is the single file to reconcile. Route handlers never build response objects
 * themselves.
 */

import type { ImpactDirection, VerificationStatus } from "@/generated/prisma/enums";

/* -------------------------------------------------------------------------
   Prisma selects — kept next to the serialisers that consume them so the two
   cannot drift apart.
------------------------------------------------------------------------- */

const TAG_SELECT = { id: true, name: true, slug: true };

const ERA_SELECT = { id: true, name: true, slug: true, sortOrder: true };

/** Everything a case study needs in list, search-hit and nested positions. */
export const CASE_STUDY_SUMMARY_SELECT = {
  id: true,
  title: true,
  slug: true,
  startDate: true,
  endDate: true,
  dateDisplay: true,
  summary: true,
  soWhat: true,
  featured: true,
  eventTypes: { select: TAG_SELECT },
  regions: { select: TAG_SELECT },
  eras: { select: ERA_SELECT },
  // Only the asset class, to derive `asset_classes`. Present in every summary
  // so the shape never varies by position.
  marketImpacts: { select: { assetClass: true } },
};

export const GLOSSARY_TERM_SELECT = {
  id: true,
  term: true,
  slug: true,
  shortDefinition: true,
};

/* -------------------------------------------------------------------------
   Row types
------------------------------------------------------------------------- */

type TagRow = { id: string; name: string; slug: string };
type EraRow = TagRow & { sortOrder: number };

export type CaseStudySummaryRow = {
  id: string;
  title: string;
  slug: string;
  startDate: Date;
  endDate: Date | null;
  dateDisplay: string;
  summary: string;
  soWhat: string;
  featured: boolean;
  eventTypes: TagRow[];
  regions: TagRow[];
  eras: EraRow[];
  marketImpacts: { assetClass: string }[];
};

export type MarketImpactRow = {
  id: string;
  assetClass: string;
  instrument: string;
  direction: ImpactDirection;
  magnitude: string;
  timeframe: string;
  mechanism: string;
  sortOrder: number;
};

export type SourceRow = {
  id: string;
  url: string;
  label: string;
  sortOrder: number;
};

export type GlossaryTermRow = {
  id: string;
  term: string;
  slug: string;
  shortDefinition: string;
};

export type CaseStudyDetailRow = CaseStudySummaryRow & {
  deepDive: string;
  persistence: string;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  marketImpacts: MarketImpactRow[];
  sources: SourceRow[];
  glossaryTerms: GlossaryTermRow[];
  relatedEvents: {
    note: string | null;
    relatedEntry: CaseStudySummaryRow;
  }[];
  newsletterIssues: {
    issueNumber: number;
    title: string;
    publishDate: Date;
  }[];
};

/* -------------------------------------------------------------------------
   Serialisers
------------------------------------------------------------------------- */

function tag(row: TagRow) {
  return { id: row.id, name: row.name, slug: row.slug };
}

function era(row: EraRow) {
  return { id: row.id, name: row.name, slug: row.slug, sort_order: row.sortOrder };
}

/** Distinct asset classes touched, in first-seen order. */
function assetClasses(impacts: { assetClass: string }[]): string[] {
  return [...new Set(impacts.map((impact) => impact.assetClass))];
}

export function serializeCaseStudySummary(row: CaseStudySummaryRow) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    start_date: row.startDate.toISOString(),
    end_date: row.endDate ? row.endDate.toISOString() : null,
    date_display: row.dateDisplay,
    summary: row.summary,
    so_what: row.soWhat,
    featured: row.featured,
    event_types: row.eventTypes.map(tag),
    regions: row.regions.map(tag),
    eras: row.eras.map(era),
    asset_classes: assetClasses(row.marketImpacts),
  };
}

export function serializeMarketImpact(row: MarketImpactRow) {
  return {
    id: row.id,
    asset_class: row.assetClass,
    instrument: row.instrument,
    direction: row.direction,
    magnitude: row.magnitude,
    timeframe: row.timeframe,
    mechanism: row.mechanism,
    sort_order: row.sortOrder,
  };
}

export function serializeSource(row: SourceRow) {
  return {
    id: row.id,
    url: row.url,
    label: row.label,
    sort_order: row.sortOrder,
  };
}

export function serializeGlossaryTerm(row: GlossaryTermRow) {
  return {
    id: row.id,
    term: row.term,
    slug: row.slug,
    short_definition: row.shortDefinition,
  };
}

/**
 * Detail form. `related_glossary_terms` and `related_case_studies` are resolved
 * into full objects rather than ids.
 *
 * Nested case studies use the summary form and are never expanded further, so
 * a response is always exactly one level deep — no cycles, bounded size.
 */
export function serializeCaseStudyDetail(row: CaseStudyDetailRow) {
  return {
    ...serializeCaseStudySummary(row),
    deep_dive: row.deepDive,
    persistence: row.persistence,
    verification_status: row.verificationStatus,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    market_impacts: row.marketImpacts.map(serializeMarketImpact),
    sources: row.sources.map(serializeSource),
    related_glossary_terms: row.glossaryTerms.map(serializeGlossaryTerm),
    related_case_studies: row.relatedEvents.map((link) => ({
      ...serializeCaseStudySummary(link.relatedEntry),
      // Why this precedent was linked — lives on the join, not on either entry.
      note: link.note,
    })),
    newsletter_issues: row.newsletterIssues.map((issue) => ({
      issue_number: issue.issueNumber,
      title: issue.title,
      publish_date: issue.publishDate.toISOString(),
    })),
  };
}

export function serializeGlossaryTermDetail(
  row: GlossaryTermRow & { entries: CaseStudySummaryRow[] },
) {
  return {
    ...serializeGlossaryTerm(row),
    related_case_studies: row.entries.map(serializeCaseStudySummary),
  };
}

/* -------------------------------------------------------------------------
   Search hits — discriminated by `type`
------------------------------------------------------------------------- */

export function caseStudyHit(row: CaseStudySummaryRow) {
  return { type: "case_study" as const, ...serializeCaseStudySummary(row) };
}

export function glossaryTermHit(row: GlossaryTermRow) {
  return { type: "glossary_term" as const, ...serializeGlossaryTerm(row) };
}

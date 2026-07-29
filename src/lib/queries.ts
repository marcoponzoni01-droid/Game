import { VerificationStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

/**
 * What the public site is allowed to show. Phase 1 seeds entries straight to
 * `verified`; Phase 2's admin dashboard promotes them to `published`.
 *
 * Exported because the read-only API under `src/app/api` applies the same
 * visibility rule — there must be exactly one definition of "public".
 */
export const PUBLIC_STATUSES = [
  VerificationStatus.verified,
  VerificationStatus.published,
];

const TAG_SELECT = { select: { name: true, slug: true } } as const;

export async function getEntriesForIndex() {
  return prisma.databaseEntry.findMany({
    where: { verificationStatus: { in: PUBLIC_STATUSES } },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      dateDisplay: true,
      summary: true,
      soWhat: true,
      eventTypes: TAG_SELECT,
      regions: TAG_SELECT,
      eras: TAG_SELECT,
      marketImpacts: {
        select: { assetClass: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export type EntryListItem = Awaited<
  ReturnType<typeof getEntriesForIndex>
>[number];

export async function getFeaturedEntries(take = 3) {
  return prisma.databaseEntry.findMany({
    where: { verificationStatus: { in: PUBLIC_STATUSES }, featured: true },
    orderBy: { startDate: "desc" },
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      dateDisplay: true,
      summary: true,
      soWhat: true,
      eventTypes: TAG_SELECT,
      regions: TAG_SELECT,
    },
  });
}

export type FeaturedEntry = Awaited<
  ReturnType<typeof getFeaturedEntries>
>[number];

export async function getEntryBySlug(slug: string) {
  return prisma.databaseEntry.findFirst({
    where: { slug, verificationStatus: { in: PUBLIC_STATUSES } },
    include: {
      eventTypes: true,
      regions: true,
      eras: true,
      glossaryTerms: { orderBy: { term: "asc" } },
      marketImpacts: { orderBy: { sortOrder: "asc" } },
      sources: { orderBy: { sortOrder: "asc" } },
      relatedEvents: {
        orderBy: { sortOrder: "asc" },
        include: {
          relatedEntry: {
            select: {
              title: true,
              slug: true,
              dateDisplay: true,
              summary: true,
              verificationStatus: true,
            },
          },
        },
      },
      newsletterIssues: {
        orderBy: { issueNumber: "desc" },
        select: { issueNumber: true, title: true, publishDate: true },
      },
    },
  });
}

export type EntryDetail = NonNullable<
  Awaited<ReturnType<typeof getEntryBySlug>>
>;

export async function getPublicEntrySlugs() {
  return prisma.databaseEntry.findMany({
    where: { verificationStatus: { in: PUBLIC_STATUSES } },
    select: { slug: true },
  });
}

/* -------------------------------------------------------------------------
   Newsletter
------------------------------------------------------------------------- */

export async function getIssuesForArchive() {
  return prisma.newsletterIssue.findMany({
    orderBy: { issueNumber: "desc" },
    select: {
      id: true,
      issueNumber: true,
      publishDate: true,
      title: true,
      teaser: true,
      precedents: { select: { title: true, slug: true } },
    },
  });
}

export type IssueListItem = Awaited<
  ReturnType<typeof getIssuesForArchive>
>[number];

export async function getLatestIssue() {
  return prisma.newsletterIssue.findFirst({
    orderBy: { issueNumber: "desc" },
    select: {
      issueNumber: true,
      publishDate: true,
      title: true,
      teaser: true,
      currentEventSummary: true,
    },
  });
}

export async function getIssueByNumber(issueNumber: number) {
  return prisma.newsletterIssue.findUnique({
    where: { issueNumber },
    include: {
      precedents: {
        orderBy: { startDate: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          dateDisplay: true,
          summary: true,
          soWhat: true,
        },
      },
    },
  });
}

export type IssueDetail = NonNullable<
  Awaited<ReturnType<typeof getIssueByNumber>>
>;

export async function getIssueNumbers() {
  return prisma.newsletterIssue.findMany({ select: { issueNumber: true } });
}

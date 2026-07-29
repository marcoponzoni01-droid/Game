import { notFound, ok } from "@/lib/api/responses";
import {
  CASE_STUDY_SUMMARY_SELECT,
  GLOSSARY_TERM_SELECT,
  serializeCaseStudyDetail,
} from "@/lib/api/serialize";
import { prisma } from "@/lib/prisma";
import { PUBLIC_STATUSES } from "@/lib/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const row = await prisma.databaseEntry.findFirst({
    where: { slug, verificationStatus: { in: PUBLIC_STATUSES } },
    select: {
      ...CASE_STUDY_SUMMARY_SELECT,
      deepDive: true,
      persistence: true,
      verificationStatus: true,
      createdAt: true,
      updatedAt: true,
      // Overrides the summary's asset-class-only select with the full rows.
      marketImpacts: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          assetClass: true,
          instrument: true,
          direction: true,
          magnitude: true,
          timeframe: true,
          mechanism: true,
          sortOrder: true,
        },
      },
      sources: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, label: true, sortOrder: true },
      },
      glossaryTerms: {
        orderBy: { term: "asc" },
        select: GLOSSARY_TERM_SELECT,
      },
      relatedEvents: {
        // Never leak a precedent that is not itself public.
        where: {
          relatedEntry: { verificationStatus: { in: PUBLIC_STATUSES } },
        },
        orderBy: { sortOrder: "asc" },
        select: {
          note: true,
          relatedEntry: { select: CASE_STUDY_SUMMARY_SELECT },
        },
      },
      newsletterIssues: {
        orderBy: { issueNumber: "desc" },
        select: { issueNumber: true, title: true, publishDate: true },
      },
    },
  });

  if (!row) {
    return notFound(`No case study with slug "${slug}".`);
  }

  return ok(serializeCaseStudyDetail(row));
}

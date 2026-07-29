import { parsePaging, parseSearchType } from "@/lib/api/params";
import { badRequest, ok } from "@/lib/api/responses";
import {
  CASE_STUDY_SUMMARY_SELECT,
  GLOSSARY_TERM_SELECT,
  caseStudyHit,
  glossaryTermHit,
} from "@/lib/api/serialize";
import { prisma } from "@/lib/prisma";
import { PUBLIC_STATUSES } from "@/lib/queries";

/**
 * Search across both tables. Case-insensitive substring matching is plenty at
 * archive scale — the same reasoning as the client-side filters on /database.
 * Postgres full-text search is the upgrade path if the corpus outgrows it.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const q = (params.get("q") ?? "").trim();
  if (q === "") {
    return badRequest("q is required and must not be empty.");
  }

  const paging = parsePaging(params);
  if (!paging.ok) return badRequest(paging.message);

  const type = parseSearchType(params);
  if (!type.ok) return badRequest(type.message);

  const match = { contains: q, mode: "insensitive" as const };

  const wantCaseStudies = type.value === undefined || type.value === "case_study";
  const wantGlossary = type.value === undefined || type.value === "glossary_term";

  const [caseStudies, glossaryTerms] = await Promise.all([
    wantCaseStudies
      ? prisma.databaseEntry.findMany({
          where: {
            verificationStatus: { in: PUBLIC_STATUSES },
            OR: [
              { title: match },
              { summary: match },
              { soWhat: match },
              { deepDive: match },
              { persistence: match },
            ],
          },
          orderBy: { startDate: "desc" },
          select: CASE_STUDY_SUMMARY_SELECT,
        })
      : Promise.resolve([]),
    wantGlossary
      ? prisma.glossaryTerm.findMany({
          where: {
            OR: [{ term: match }, { shortDefinition: match }],
          },
          orderBy: { term: "asc" },
          select: GLOSSARY_TERM_SELECT,
        })
      : Promise.resolve([]),
  ]);

  // Case studies first, then glossary terms; paging is applied to the combined
  // list so a client can walk everything with one cursor.
  const all = [
    ...caseStudies.map(caseStudyHit),
    ...glossaryTerms.map(glossaryTermHit),
  ];

  const page = all.slice(
    paging.value.offset,
    paging.value.offset + paging.value.limit,
  );

  return ok({
    query: q,
    data: page,
    counts: {
      case_studies: caseStudies.length,
      glossary_terms: glossaryTerms.length,
    },
    pagination: {
      total: all.length,
      limit: paging.value.limit,
      offset: paging.value.offset,
    },
  });
}

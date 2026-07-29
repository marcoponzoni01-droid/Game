import type { Prisma } from "@/generated/prisma/client";
import { withApi } from "@/lib/api/guard";
import { parseMulti, parsePaging } from "@/lib/api/params";
import { badRequest, list } from "@/lib/api/responses";
import { GLOSSARY_TERM_SELECT, serializeGlossaryTerm } from "@/lib/api/serialize";
import { prisma } from "@/lib/prisma";
import { PUBLIC_STATUSES } from "@/lib/queries";

export const GET = withApi(async (request: Request) => {
  const params = new URL(request.url).searchParams;

  const paging = parsePaging(params);
  if (!paging.ok) return badRequest(paging.message);

  // Optional: only terms linked to these case studies (by slug).
  const caseStudies = parseMulti(params, "case_study");

  const where: Prisma.GlossaryTermWhereInput =
    caseStudies.length > 0
      ? {
          entries: {
            some: {
              slug: { in: caseStudies, mode: "insensitive" },
              verificationStatus: { in: PUBLIC_STATUSES },
            },
          },
        }
      : {};

  const [rows, total] = await Promise.all([
    prisma.glossaryTerm.findMany({
      where,
      orderBy: { term: "asc" },
      take: paging.value.limit,
      skip: paging.value.offset,
      select: GLOSSARY_TERM_SELECT,
    }),
    prisma.glossaryTerm.count({ where }),
  ]);

  return list(rows.map(serializeGlossaryTerm), {
    total,
    limit: paging.value.limit,
    offset: paging.value.offset,
  });
});

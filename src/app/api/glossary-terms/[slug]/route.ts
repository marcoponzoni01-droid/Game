import { withApi } from "@/lib/api/guard";
import { notFound, ok } from "@/lib/api/responses";
import {
  CASE_STUDY_SUMMARY_SELECT,
  GLOSSARY_TERM_SELECT,
  serializeGlossaryTermDetail,
} from "@/lib/api/serialize";
import { prisma } from "@/lib/prisma";
import { PUBLIC_STATUSES } from "@/lib/queries";

export const GET = withApi(async (
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await params;

  const row = await prisma.glossaryTerm.findUnique({
    where: { slug },
    select: {
      ...GLOSSARY_TERM_SELECT,
      entries: {
        where: { verificationStatus: { in: PUBLIC_STATUSES } },
        orderBy: { startDate: "desc" },
        select: CASE_STUDY_SUMMARY_SELECT,
      },
    },
  });

  if (!row) {
    return notFound(`No glossary term with slug "${slug}".`);
  }

  return ok(serializeGlossaryTermDetail(row));
});

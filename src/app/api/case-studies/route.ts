import type { Prisma } from "@/generated/prisma/client";
import { assetClassWhere, tagWhere } from "@/lib/api/filters";
import {
  parseBoolean,
  parseCaseStudySort,
  parseMulti,
  parsePaging,
} from "@/lib/api/params";
import { badRequest, list } from "@/lib/api/responses";
import {
  CASE_STUDY_SUMMARY_SELECT,
  serializeCaseStudySummary,
} from "@/lib/api/serialize";
import { prisma } from "@/lib/prisma";
import { PUBLIC_STATUSES } from "@/lib/queries";

const ORDER_BY: Record<string, Prisma.DatabaseEntryOrderByWithRelationInput> = {
  date_desc: { startDate: "desc" },
  date_asc: { startDate: "asc" },
  title: { title: "asc" },
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const paging = parsePaging(params);
  if (!paging.ok) return badRequest(paging.message);

  const sort = parseCaseStudySort(params);
  if (!sort.ok) return badRequest(sort.message);

  const featured = parseBoolean(params, "featured");
  if (!featured.ok) return badRequest(featured.message);

  const eventTypes = parseMulti(params, "event_type");
  const regions = parseMulti(params, "region");
  const eras = parseMulti(params, "era");
  const assetClasses = parseMulti(params, "asset_class");

  const where: Prisma.DatabaseEntryWhereInput = {
    verificationStatus: { in: PUBLIC_STATUSES },
    ...(eventTypes.length > 0 ? { eventTypes: tagWhere(eventTypes) } : {}),
    ...(regions.length > 0 ? { regions: tagWhere(regions) } : {}),
    ...(eras.length > 0 ? { eras: tagWhere(eras) } : {}),
    ...(assetClasses.length > 0
      ? { marketImpacts: assetClassWhere(assetClasses) }
      : {}),
    ...(featured.value !== undefined ? { featured: featured.value } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.databaseEntry.findMany({
      where,
      orderBy: ORDER_BY[sort.value],
      take: paging.value.limit,
      skip: paging.value.offset,
      select: CASE_STUDY_SUMMARY_SELECT,
    }),
    prisma.databaseEntry.count({ where }),
  ]);

  return list(rows.map(serializeCaseStudySummary), {
    total,
    limit: paging.value.limit,
    offset: paging.value.offset,
  });
}

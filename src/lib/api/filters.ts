import type { Prisma } from "@/generated/prisma/client";

/**
 * Tag filters accept either a slug or a display name, case-insensitively —
 * `?region=europe` and `?region=Europe` should not behave differently.
 */
export function tagWhere(values: string[]) {
  return {
    some: {
      OR: [
        { slug: { in: values, mode: "insensitive" } },
        { name: { in: values, mode: "insensitive" } },
      ],
    },
  } satisfies { some: Prisma.EventTypeWhereInput };
}

/** Matches a case study that has at least one impact in any of these classes. */
export function assetClassWhere(values: string[]) {
  return {
    some: { assetClass: { in: values, mode: "insensitive" } },
  } satisfies { some: Prisma.MarketImpactWhereInput };
}

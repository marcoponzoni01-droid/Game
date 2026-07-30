import Link from "next/link";

import { SoWhat } from "@/components/editorial";
import { Tag, TagRow } from "@/components/tag";
import type { EntryListItem } from "@/lib/queries";

/**
 * The archive row: a date gutter on the left, the entry itself on the right,
 * separated from its neighbours by a hairline rather than boxed into a card.
 */
export function EntryRow({ entry }: { entry: EntryListItem }) {
  const assetClasses = [
    ...new Set(entry.marketImpacts.map((impact) => impact.assetClass)),
  ];

  return (
    <article className="hairline-t grid gap-x-10 gap-y-3 py-9 md:grid-cols-[9rem_1fr]">
      <div className="md:pt-1.5">
        <p className="stat-value text-sm text-ink">{entry.dateDisplay}</p>
        {entry.eras[0] ? (
          <p className="mt-1.5 eyebrow">{entry.eras[0].name}</p>
        ) : null}
      </div>

      <div className="max-w-2xl">
        <h2 className="font-serif text-2xl leading-tight tracking-tight">
          <Link
            href={`/database/${entry.slug}`}
            className="transition-colors hover:text-tag-text"
          >
            {entry.title}
          </Link>
        </h2>

        <p className="mt-3 text-[0.9375rem] leading-[1.75] text-ink-muted">
          {entry.summary}
        </p>

        <div className="mt-5">
          <SoWhat>{entry.soWhat}</SoWhat>
        </div>

        <TagRow className="mt-5">
          {entry.eventTypes.map((tag) => (
            <Tag key={tag.slug}>{tag.name}</Tag>
          ))}
          {entry.regions.map((tag) => (
            <Tag key={tag.slug}>{tag.name}</Tag>
          ))}
        </TagRow>

        {assetClasses.length > 0 ? (
          <p className="mt-4 flex flex-wrap items-baseline gap-x-2 text-xs text-ink-muted">
            <span className="eyebrow">Markets touched</span>
            <span aria-hidden className="text-rule">
              /
            </span>
            <span>{assetClasses.join(" · ")}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

export type CardEntry = {
  slug: string;
  title: string;
  dateDisplay: string;
  summary: string;
  eventTypes?: { name: string; slug: string }[];
};

/** Compact version for the home page and newsletter precedent lists. */
export function EntryCard({ entry }: { entry: CardEntry }) {
  return (
    <article className="hairline-t flex flex-col pt-5">
      <p className="stat-value text-xs text-ink-muted">{entry.dateDisplay}</p>

      <h3 className="mt-2 font-serif text-xl leading-snug tracking-tight">
        <Link
          href={`/database/${entry.slug}`}
          className="transition-colors hover:text-tag-text"
        >
          {entry.title}
        </Link>
      </h3>

      <p className="mt-2.5 text-sm leading-[1.7] text-ink-muted">
        {entry.summary}
      </p>

      {entry.eventTypes && entry.eventTypes.length > 0 ? (
        <TagRow className="mt-4">
          {entry.eventTypes.map((tag) => (
            <Tag key={tag.slug}>{tag.name}</Tag>
          ))}
        </TagRow>
      ) : null}
    </article>
  );
}

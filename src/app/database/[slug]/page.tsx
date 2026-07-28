import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeepDive } from "@/components/deep-dive";
import { Prose, SectionHeading, SoWhat } from "@/components/editorial";
import { MarketImpactList } from "@/components/market-impact-list";
import { Tag, TagRow } from "@/components/tag";
import { VerificationStatus } from "@/generated/prisma/enums";
import { formatIssueDate } from "@/lib/format";
import { getEntryBySlug } from "@/lib/queries";

// Rendered per request in Phase 1 so a reseed shows up immediately and the
// build never needs a database. Swap to `revalidate` once hosting lands.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) return {};

  return { title: entry.title, description: entry.summary };
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function EntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) notFound();

  const precedents = entry.relatedEvents.filter(
    (link) =>
      link.relatedEntry.verificationStatus === VerificationStatus.verified ||
      link.relatedEntry.verificationStatus === VerificationStatus.published,
  );

  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <Link
        href="/database"
        className="eyebrow transition-colors hover:text-ink"
      >
        ← The Database
      </Link>

      <header className="mt-8">
        {entry.eras[0] ? (
          <p className="eyebrow text-tag-text">{entry.eras[0].name}</p>
        ) : null}

        <h1 className="mt-3 font-serif text-4xl leading-[1.15] tracking-tight sm:text-[2.75rem]">
          {entry.title}
        </h1>

        <p className="stat-value mt-4 text-ink-muted">{entry.dateDisplay}</p>

        <TagRow className="mt-5">
          {entry.eventTypes.map((tag) => (
            <Tag key={tag.id}>{tag.name}</Tag>
          ))}
          {entry.regions.map((tag) => (
            <Tag key={tag.id}>{tag.name}</Tag>
          ))}
        </TagRow>
      </header>

      {/* Card view — the summary anyone gets before committing to the long read. */}
      <div className="mt-10">
        <p className="text-[1.125rem] leading-[1.7] text-ink">
          {entry.summary}
        </p>

        <div className="mt-7">
          <SoWhat>{entry.soWhat}</SoWhat>
        </div>
      </div>

      <div className="mt-10">
        <DeepDive body={entry.deepDive} />
      </div>

      <section className="mt-16">
        <SectionHeading>How markets moved</SectionHeading>
        <div className="mt-8">
          <MarketImpactList impacts={entry.marketImpacts} />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading>How long it lasted</SectionHeading>
        <div className="mt-6">
          <Prose body={entry.persistence} />
        </div>
      </section>

      {entry.glossaryTerms.length > 0 ? (
        <section className="mt-16">
          <SectionHeading>Terms in this entry</SectionHeading>
          <dl className="mt-6 space-y-5">
            {entry.glossaryTerms.map((term) => (
              <div key={term.id} className="max-w-2xl">
                <dt className="font-serif text-lg leading-snug text-ink">
                  {term.term}
                </dt>
                <dd className="mt-1 text-[0.9375rem] leading-[1.75] text-ink-muted">
                  {term.shortDefinition}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {precedents.length > 0 ? (
        <section className="mt-16">
          <SectionHeading>Precedents &amp; echoes</SectionHeading>
          <div className="mt-6 space-y-7">
            {precedents.map((link) => (
              <div key={link.id} className="hairline-t pt-5">
                <p className="stat-value text-xs text-ink-muted">
                  {link.relatedEntry.dateDisplay}
                </p>
                <h3 className="mt-1.5 font-serif text-xl leading-snug tracking-tight">
                  <Link
                    href={`/database/${link.relatedEntry.slug}`}
                    className="transition-colors hover:text-tag-text"
                  >
                    {link.relatedEntry.title}
                  </Link>
                </h3>
                {link.note ? (
                  <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-[1.75] text-ink-muted">
                    {link.note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16">
        <SectionHeading>Sources</SectionHeading>
        <ol className="mt-6 space-y-3">
          {entry.sources.map((source, index) => (
            <li
              key={source.id}
              className="grid grid-cols-[1.75rem_1fr] items-baseline"
            >
              <span className="stat-value text-xs text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="body-copy text-[0.9375rem] leading-[1.7]">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink"
                >
                  {source.label}
                </a>
                <span className="mt-0.5 block text-xs text-ink-muted">
                  {hostname(source.url)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {entry.newsletterIssues.length > 0 ? (
        <section className="mt-16">
          <SectionHeading>Cited in the newsletter</SectionHeading>
          <ul className="mt-6 space-y-3">
            {entry.newsletterIssues.map((issue) => (
              <li key={issue.issueNumber}>
                <Link
                  href={`/newsletter/${issue.issueNumber}`}
                  className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <span className="eyebrow whitespace-nowrap">
                    No. {String(issue.issueNumber).padStart(3, "0")} ·{" "}
                    {formatIssueDate(issue.publishDate)}
                  </span>
                  <span className="font-serif text-lg leading-snug transition-colors group-hover:text-tag-text">
                    {issue.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

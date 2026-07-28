import Link from "next/link";

import { SectionHeading, Teaser } from "@/components/editorial";
import { EntryCard } from "@/components/entry-card";
import { formatIssueDate } from "@/lib/format";
import { getFeaturedEntries, getLatestIssue } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestIssue, featured] = await Promise.all([
    getLatestIssue(),
    getFeaturedEntries(3),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="py-16 sm:py-20">
        <h1 className="max-w-3xl font-serif text-[2.5rem] leading-[1.1] tracking-tight sm:text-5xl">
          Every crisis has a precedent. Most of them left a mark on markets.
        </h1>
        <p className="mt-7 max-w-2xl text-[1.0625rem] leading-[1.75] text-ink-muted">
          The Archive is a record of geopolitical events and what each one did
          to currencies, commodities, equities and bonds — with the mechanism
          spelled out rather than assumed. Every week, one newsletter connects
          something happening now to the entries that rhyme with it.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            href="/database"
            className="hairline-all rounded-pill px-5 py-2 text-sm text-ink transition-colors hover:bg-tag-bg hover:text-tag-text"
          >
            Browse the database
          </Link>
          <Link
            href="/newsletter"
            className="text-sm text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
          >
            Read the newsletter archive
          </Link>
        </div>
      </section>

      {latestIssue ? (
        <section className="pb-20">
          <SectionHeading>This week&rsquo;s newsletter</SectionHeading>

          <div className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-[9rem_1fr]">
            <p className="eyebrow md:pt-2">
              No. {String(latestIssue.issueNumber).padStart(3, "0")}
              <span className="mt-1 block normal-case tracking-normal">
                {formatIssueDate(latestIssue.publishDate)}
              </span>
            </p>

            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl leading-tight tracking-tight">
                <Link
                  href={`/newsletter/${latestIssue.issueNumber}`}
                  className="transition-colors hover:text-tag-text"
                >
                  {latestIssue.title}
                </Link>
              </h2>

              <Teaser className="mt-4">{latestIssue.teaser}</Teaser>

              <p className="mt-5 text-[0.9375rem] leading-[1.75] text-ink-muted">
                {latestIssue.currentEventSummary}
              </p>

              <Link
                href={`/newsletter/${latestIssue.issueNumber}`}
                className="mt-6 inline-block text-sm text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink-muted"
              >
                Read the issue
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="pb-8">
          <SectionHeading>From the database</SectionHeading>

          <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>

          <Link
            href="/database"
            className="mt-10 inline-block text-sm text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
          >
            See every entry
          </Link>
        </section>
      ) : null}
    </div>
  );
}

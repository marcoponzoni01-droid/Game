import type { Metadata } from "next";
import Link from "next/link";

import { Teaser } from "@/components/editorial";
import { formatIssueDate } from "@/lib/format";
import { getIssuesForArchive } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newsletter archive",
  description:
    "Every issue: one thing happening now, read against the entries in the archive that rhyme with it.",
};

export default async function NewsletterIndexPage() {
  const issues = await getIssuesForArchive();

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">The Newsletter</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight">
          One week, one pattern
        </h1>
        <p className="mt-5 text-[1.0625rem] leading-[1.75] text-ink-muted">
          Each issue takes one thing happening in the world and reads it
          against the archive: what the closest precedents were, what markets
          did then, and which parts of the comparison actually hold.
        </p>
      </header>

      <div className="mt-14">
        {issues.map((issue) => (
          <article
            key={issue.id}
            className="hairline-t grid gap-x-10 gap-y-3 py-9 md:grid-cols-[9rem_1fr]"
          >
            <p className="eyebrow md:pt-2">
              No. {String(issue.issueNumber).padStart(3, "0")}
              <span className="mt-1 block normal-case tracking-normal">
                {formatIssueDate(issue.publishDate)}
              </span>
            </p>

            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl leading-tight tracking-tight">
                <Link
                  href={`/newsletter/${issue.issueNumber}`}
                  className="transition-colors hover:text-tag-text"
                >
                  {issue.title}
                </Link>
              </h2>

              <Teaser className="mt-3.5">{issue.teaser}</Teaser>

              {issue.precedents.length > 0 ? (
                <p className="mt-5 flex flex-wrap items-baseline gap-x-2 text-xs text-ink-muted">
                  <span className="eyebrow">Precedents</span>
                  <span aria-hidden className="text-rule">
                    /
                  </span>
                  <span>
                    {issue.precedents.map((entry) => entry.title).join(" · ")}
                  </span>
                </p>
              ) : null}
            </div>
          </article>
        ))}

        {issues.length === 0 ? (
          <p className="hairline-t py-16 editorial-note text-ink-muted">
            No issues published yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

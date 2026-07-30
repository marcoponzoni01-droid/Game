import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Prose, SectionHeading, Teaser } from "@/components/editorial";
import { EntryCard } from "@/components/entry-card";
import { formatIssueDate } from "@/lib/format";
import { getIssueByNumber, getIssueNumbers } from "@/lib/queries";

export const revalidate = 3600;

type Props = { params: Promise<{ issueNumber: string }> };

// Route params are strings even when the underlying column is an integer.
export async function generateStaticParams() {
  const issues = await getIssueNumbers();
  return issues.map(({ issueNumber }) => ({ issueNumber: String(issueNumber) }));
}

function parseIssueNumber(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { issueNumber } = await params;
  const parsed = parseIssueNumber(issueNumber);
  if (parsed === null) return {};

  const issue = await getIssueByNumber(parsed);
  if (!issue) return {};

  return { title: issue.title, description: issue.teaser };
}

export default async function IssuePage({ params }: Props) {
  const { issueNumber } = await params;
  const parsed = parseIssueNumber(issueNumber);

  if (parsed === null) notFound();

  const issue = await getIssueByNumber(parsed);

  if (!issue) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <Link
        href="/newsletter"
        className="eyebrow transition-colors hover:text-ink"
      >
        ← Newsletter archive
      </Link>

      <header className="mt-8">
        <p className="eyebrow text-tag-text">
          Issue No. {String(issue.issueNumber).padStart(3, "0")}
          <span className="mx-2 text-rule">·</span>
          <span className="normal-case tracking-normal">
            {formatIssueDate(issue.publishDate)}
          </span>
        </p>

        <h1 className="mt-3 font-serif text-4xl leading-[1.15] tracking-tight sm:text-[2.75rem]">
          {issue.title}
        </h1>

        <Teaser className="mt-5 text-xl">{issue.teaser}</Teaser>
      </header>

      <section className="mt-14">
        <SectionHeading>What happened</SectionHeading>
        <div className="mt-6">
          <Prose body={issue.currentEventSummary} size="lead" />
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading>The read</SectionHeading>
        <div className="mt-6">
          <Prose body={issue.essayBody} size="lead" />
        </div>
      </section>

      {issue.precedents.length > 0 ? (
        <section className="mt-16">
          <SectionHeading>The precedents</SectionHeading>
          <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {issue.precedents.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      {issue.whatToWatch ? (
        <section className="mt-16">
          <SectionHeading>What to watch</SectionHeading>
          <div className="mt-6">
            <Prose body={issue.whatToWatch} />
          </div>
        </section>
      ) : null}
    </article>
  );
}

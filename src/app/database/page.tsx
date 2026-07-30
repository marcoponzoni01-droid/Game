import type { Metadata } from "next";

import { DatabaseBrowser } from "@/components/database-browser";
import { getEntriesForIndex } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Database",
  description:
    "Every entry in the archive: a geopolitical event, what it did to markets, and why.",
};

export default async function DatabaseIndexPage() {
  const entries = await getEntriesForIndex();

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">The Database</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight">
          What happened, and what it did to markets
        </h1>
        <p className="mt-5 text-[1.0625rem] leading-[1.75] text-ink-muted">
          Each entry pairs a geopolitical event with the moves it produced
          across asset classes — the size of the move, how long it lasted, and
          the mechanism connecting the two. Filter by what you are curious
          about.
        </p>
      </header>

      <div className="mt-12">
        <DatabaseBrowser entries={entries} />
      </div>
    </div>
  );
}

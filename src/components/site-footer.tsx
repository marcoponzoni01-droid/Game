import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="hairline-t mt-24">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-serif text-lg leading-snug text-ink">
              The Archive
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              A record of what happened in the world, and what it did to
              markets. Written for people who want to understand the
              mechanism, not trade the headline.
            </p>
          </div>

          <nav className="flex gap-10">
            <div>
              <p className="eyebrow">Browse</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/database"
                    className="text-ink-muted transition-colors hover:text-ink"
                  >
                    The Database
                  </Link>
                </li>
                <li>
                  <Link
                    href="/newsletter"
                    className="text-ink-muted transition-colors hover:text-ink"
                  >
                    Newsletter archive
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <p className="mt-10 text-xs text-ink-muted">
          Educational reference. Nothing here is investment advice. Figures are
          approximate and drawn from the cited sources.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";

const NAV = [
  { href: "/database", label: "The Database" },
  { href: "/newsletter", label: "Newsletter" },
];

export function SiteHeader() {
  return (
    <header className="hairline-b">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:py-8">
        <Link href="/" className="group">
          <span className="block font-serif text-2xl leading-none tracking-tight text-ink">
            The Archive
          </span>
          <span className="mt-1.5 block eyebrow">
            Geopolitics &amp; markets, explained
          </span>
        </Link>

        <nav>
          <ul className="flex items-center gap-6">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

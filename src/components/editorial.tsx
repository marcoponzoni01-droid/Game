import { paragraphs } from "@/lib/format";

/**
 * The "so what" line — the pattern takeaway that ties an entry to everything
 * else in the archive. Serif italic, offset by a hairline: the same treatment
 * newsletter teasers get, because they are doing the same job.
 */
export function SoWhat({ children }: { children: React.ReactNode }) {
  return (
    <p className="hairline-l editorial-note py-1 pl-4 text-[1.0625rem]">
      {children}
    </p>
  );
}

/** Newsletter teaser. Same signature style, without the rule. */
export function Teaser({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`editorial-note text-lg ${className}`}>{children}</p>
  );
}

/** A section heading: uppercase label above a hairline. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="hairline-b eyebrow pb-2 text-ink-muted">{children}</h2>
  );
}

/** Long-form body copy stored as plain text with blank-line paragraph breaks. */
export function Prose({
  body,
  size = "base",
}: {
  body: string;
  size?: "base" | "lead";
}) {
  const sizeClass =
    size === "lead"
      ? "text-[1.0625rem] leading-[1.75] text-ink"
      : "text-[0.9875rem] leading-[1.8] text-ink-muted";

  return (
    <div className={`body-copy space-y-4 ${sizeClass}`}>
      {paragraphs(body).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

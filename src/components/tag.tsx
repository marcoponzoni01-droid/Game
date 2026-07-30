const BASE =
  "inline-flex items-center rounded-pill bg-tag-bg px-2 py-0.5 text-xs text-tag-text";

/** Small rounded pill. Tag background + tag text, never plain grey. */
export function Tag({ children }: { children: React.ReactNode }) {
  return <span className={BASE}>{children}</span>;
}

/** Interactive variant used by the database filters. */
export function TagButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? `${BASE} cursor-pointer ring-1 ring-tag-text/40`
          : `${BASE} cursor-pointer bg-transparent text-ink-muted ring-1 ring-rule transition-colors hover:text-ink`
      }
    >
      {children}
    </button>
  );
}

export function TagRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {children}
    </div>
  );
}

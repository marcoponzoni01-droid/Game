import type { ImpactDirection } from "@/generated/prisma/enums";
import { directionClass, directionLabel, directionMark } from "@/lib/format";

export type MarketImpactView = {
  id: string;
  assetClass: string;
  instrument: string;
  direction: ImpactDirection;
  magnitude: string;
  timeframe: string;
  mechanism: string;
};

function Stat({
  label,
  value,
  valueClass = "text-ink",
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className={`stat-value mt-1 text-[0.9375rem] ${valueClass}`}>{value}</p>
    </div>
  );
}

function Impact({ impact }: { impact: MarketImpactView }) {
  const accent = directionClass(impact.direction);

  return (
    <div className="hairline-t py-7">
      <h4 className="font-serif text-xl leading-snug text-ink">
        {impact.instrument}
      </h4>

      {/* Label above, value below — deliberately not a boxed data table.
          Magnitude takes the flexible column because it is the longest. */}
      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-[6.5rem_1fr_12.5rem]">
        <Stat
          label="Direction"
          value={
            <span className={accent}>
              <span aria-hidden className="mr-1.5 text-[0.7em]">
                {directionMark(impact.direction)}
              </span>
              {directionLabel(impact.direction)}
            </span>
          }
        />
        <Stat label="Magnitude" value={impact.magnitude} valueClass={accent} />
        <Stat label="Timeframe" value={impact.timeframe} />
      </div>

      <p className="mt-5 max-w-2xl text-[0.9375rem] leading-[1.75] text-ink-muted">
        {impact.mechanism}
      </p>
    </div>
  );
}

export function MarketImpactList({ impacts }: { impacts: MarketImpactView[] }) {
  const byAssetClass = new Map<string, MarketImpactView[]>();

  for (const impact of impacts) {
    const group = byAssetClass.get(impact.assetClass) ?? [];
    group.push(impact);
    byAssetClass.set(impact.assetClass, group);
  }

  return (
    <div className="space-y-12">
      {[...byAssetClass].map(([assetClass, group]) => (
        <section key={assetClass}>
          <p className="eyebrow text-tag-text">{assetClass}</p>
          <div className="mt-5">
            {group.map((impact) => (
              <Impact key={impact.id} impact={impact} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

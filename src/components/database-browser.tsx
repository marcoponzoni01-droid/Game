"use client";

import { useMemo, useState } from "react";

import { EntryRow } from "@/components/entry-card";
import { TagButton, TagRow } from "@/components/tag";
import type { EntryListItem } from "@/lib/queries";

type FacetKey = "eventType" | "region" | "assetClass";

const FACET_LABELS: Record<FacetKey, string> = {
  eventType: "Event type",
  region: "Region",
  assetClass: "Asset class",
};

function facetValues(entry: EntryListItem, facet: FacetKey): string[] {
  switch (facet) {
    case "eventType":
      return entry.eventTypes.map((tag) => tag.name);
    case "region":
      return entry.regions.map((tag) => tag.name);
    case "assetClass":
      return entry.marketImpacts.map((impact) => impact.assetClass);
  }
}

/**
 * Client-side filtering. At archive scale a few hundred entries fit
 * comfortably in memory — no search service needed until they don't.
 */
export function DatabaseBrowser({ entries }: { entries: EntryListItem[] }) {
  const [selected, setSelected] = useState<Record<FacetKey, string[]>>({
    eventType: [],
    region: [],
    assetClass: [],
  });

  const options = useMemo(() => {
    const collect = (facet: FacetKey) =>
      [...new Set(entries.flatMap((entry) => facetValues(entry, facet)))].sort(
        (a, b) => a.localeCompare(b),
      );

    return {
      eventType: collect("eventType"),
      region: collect("region"),
      assetClass: collect("assetClass"),
    };
  }, [entries]);

  const visible = useMemo(() => {
    return entries.filter((entry) =>
      (Object.keys(FACET_LABELS) as FacetKey[]).every((facet) => {
        const chosen = selected[facet];
        if (chosen.length === 0) return true;
        const values = facetValues(entry, facet);
        return chosen.some((value) => values.includes(value));
      }),
    );
  }, [entries, selected]);

  const activeCount = Object.values(selected).flat().length;

  function toggle(facet: FacetKey, value: string) {
    setSelected((current) => {
      const chosen = current[facet];
      return {
        ...current,
        [facet]: chosen.includes(value)
          ? chosen.filter((item) => item !== value)
          : [...chosen, value],
      };
    });
  }

  function clear() {
    setSelected({ eventType: [], region: [], assetClass: [] });
  }

  return (
    <div>
      <div className="hairline-t hairline-b space-y-5 py-7">
        {(Object.keys(FACET_LABELS) as FacetKey[]).map((facet) => (
          <div
            key={facet}
            className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:items-baseline sm:gap-6"
          >
            <p className="eyebrow">{FACET_LABELS[facet]}</p>
            <TagRow>
              {options[facet].map((value) => (
                <TagButton
                  key={value}
                  active={selected[facet].includes(value)}
                  onClick={() => toggle(facet, value)}
                >
                  {value}
                </TagButton>
              ))}
            </TagRow>
          </div>
        ))}
      </div>

      <div className="flex items-baseline justify-between py-5">
        <p className="text-sm text-ink-muted">
          <span className="stat-value text-ink">{visible.length}</span>{" "}
          {visible.length === 1 ? "entry" : "entries"}
          {activeCount > 0 ? (
            <span className="text-ink-muted"> matching your filters</span>
          ) : null}
        </p>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="cursor-pointer text-sm text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {visible.length > 0 ? (
        <div>
          {visible.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <p className="hairline-t py-16 text-center editorial-note text-ink-muted">
          Nothing in the archive matches that combination yet.
        </p>
      )}
    </div>
  );
}

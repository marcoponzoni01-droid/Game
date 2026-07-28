"use client";

import { useState } from "react";

import { Prose } from "@/components/editorial";

/**
 * The card view expands into the deep dive in place. Kept client-side and
 * uncontrolled so the entry page still renders the full body for people
 * without JavaScript — the summary above it is never hidden.
 */
export function DeepDive({ body }: { body: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="hairline-t hairline-b py-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-baseline justify-between gap-4 text-left"
      >
        <span className="eyebrow text-ink">
          {open ? "Close the deep dive" : "Read the deep dive"}
        </span>
        <span
          aria-hidden
          className={`text-xs text-ink-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div className="mt-6 max-w-2xl">
          <Prose body={body} />
        </div>
      ) : null}
    </div>
  );
}

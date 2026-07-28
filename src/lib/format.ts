import type { ImpactDirection } from "@/generated/prisma/enums";

/** Accent colour for a market move. Rise and decline are the only two accents
 *  in the palette; mixed and flat stay in ink so the accents keep their weight. */
export function directionClass(direction: ImpactDirection): string {
  switch (direction) {
    case "rise":
      return "text-rise";
    case "decline":
      return "text-decline";
    default:
      return "text-ink";
  }
}

export function directionLabel(direction: ImpactDirection): string {
  switch (direction) {
    case "rise":
      return "Rise";
    case "decline":
      return "Decline";
    case "mixed":
      return "Mixed";
    case "flat":
      return "Little changed";
  }
}

/** A small directional mark that sits before the magnitude. Kept as a glyph
 *  rather than an icon so it inherits the type colour and baseline. */
export function directionMark(direction: ImpactDirection): string {
  switch (direction) {
    case "rise":
      return "▲";
    case "decline":
      return "▼";
    case "mixed":
      return "◆";
    case "flat":
      return "—";
  }
}

const ISSUE_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatIssueDate(date: Date): string {
  return ISSUE_DATE.format(date);
}

/** Splits stored long-form copy into paragraphs. Bodies are written as plain
 *  text with blank lines between paragraphs — no markdown parser in Phase 1. */
export function paragraphs(body: string): string[] {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

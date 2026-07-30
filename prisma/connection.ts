/**
 * Which database a command-line tool talks to.
 *
 * The project has one rule, and this is the only place it lives:
 *
 *   Anything run from a developer machine resolves DIRECT_URL ?? DATABASE_URL.
 *   The running app uses DATABASE_URL only.
 *
 * Hosted Postgres offers a pooled endpoint and a direct one. The pooler runs in
 * transaction mode, which cannot hold the session state migrations rely on, so
 * DIRECT_URL exists to bypass it. Anything that migrates, seeds or administers
 * the database therefore has to follow DIRECT_URL when it is set — otherwise
 * pointing DIRECT_URL at production and running a seed quietly rewrites the
 * local database instead, reporting success either way.
 *
 * `src/lib/prisma.ts` deliberately does NOT use this. The deployed app must go
 * through the pooler; a DIRECT_URL fallback there would let a misconfigured
 * deploy open unpooled connections from every serverless instance.
 */

export function cliConnectionString(): string {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Neither DIRECT_URL nor DATABASE_URL is set. Copy .env.example to .env — " +
        "see README → Deploying for which of the two a hosted database needs.",
    );
  }

  return connectionString;
}

/** Host and port only — safe to print, since it drops the password. */
export function describeTarget(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    return `${url.hostname}:${url.port || "5432"}${url.pathname}`;
  } catch {
    return "(unparseable connection string)";
  }
}

/**
 * Manage API keys.
 *
 *   npm run api:key -- create "docs site" [--expires-days 90]
 *   npm run api:key -- list
 *   npm run api:key -- revoke <id-or-prefix>
 *
 * The full key is shown exactly once, at creation. Only its SHA-256 hash is
 * stored, so a lost key cannot be recovered — mint a new one and revoke the old.
 */

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { cliConnectionString, describeTarget } from "../prisma/connection";
import { generateApiKey } from "../src/lib/api/auth";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = cliConnectionString();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const USAGE = `Usage:
  npm run api:key -- create "<name>" [--expires-days <n>]
  npm run api:key -- list
  npm run api:key -- revoke <id-or-prefix>`;

function flagValue(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

/** Everything that isn't a `--flag` or a flag's value. */
function positionals(argv: string[]): string[] {
  const out: string[] = [];

  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) {
      i += 1;
      continue;
    }
    out.push(argv[i]);
  }

  return out;
}

async function create(argv: string[]) {
  // Joined so an unquoted multi-word name still does the obvious thing.
  const name = positionals(argv).join(" ").trim();

  if (!name) {
    throw new Error('A name is required, e.g. create "docs site"');
  }

  const rawDays = flagValue(argv, "--expires-days");
  let expiresAt: Date | null = null;

  if (rawDays !== undefined) {
    const days = Number(rawDays);
    if (!Number.isFinite(days) || days <= 0) {
      throw new Error("--expires-days must be a positive number.");
    }
    expiresAt = new Date(Date.now() + days * 86_400_000);
  }

  const { key, prefix, keyHash } = generateApiKey();

  const record = await prisma.apiKey.create({
    data: { name, prefix, keyHash, expiresAt },
    select: { id: true, name: true, expiresAt: true },
  });

  // Say which database it landed in. A key minted against the wrong one still
  // prints successfully, so the target is the only thing that distinguishes a
  // production key from a local one.
  console.log(`\nCreated "${record.name}" in ${describeTarget(connectionString)}  (id ${record.id})`);
  if (record.expiresAt) {
    console.log(`Expires ${record.expiresAt.toISOString()}`);
  }
  console.log(`\n  ${key}\n`);
  console.log("This is the only time the key is shown. Store it now.\n");
  console.log("Use it as either:");
  console.log(`  curl -H "Authorization: Bearer ${key}" …`);
  console.log(`  curl -H "X-API-Key: ${key}" …\n`);
}

async function list() {
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n${describeTarget(connectionString)}\n`);

  if (keys.length === 0) {
    console.log("No API keys yet. Create one with:  npm run api:key -- create \"my key\"");
    return;
  }

  const now = Date.now();

  for (const key of keys) {
    const state = key.revokedAt
      ? "revoked"
      : key.expiresAt && key.expiresAt.getTime() <= now
        ? "expired"
        : "active";

    console.log(
      [
        state.padEnd(8),
        `${key.prefix}…`.padEnd(16),
        key.name.padEnd(24),
        `last used ${key.lastUsedAt ? key.lastUsedAt.toISOString() : "never"}`,
        key.id,
      ].join("  "),
    );
  }
}

async function revoke(argv: string[]) {
  const target = positionals(argv)[0];

  if (!target) throw new Error("Pass the key's id or prefix.");

  const record = await prisma.apiKey.findFirst({
    where: { OR: [{ id: target }, { prefix: target }] },
  });

  if (!record) throw new Error(`No API key matching "${target}".`);

  if (record.revokedAt) {
    console.log(`"${record.name}" was already revoked at ${record.revokedAt.toISOString()}.`);
    return;
  }

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  console.log(`Revoked "${record.name}" (${record.prefix}…). It stays listed for audit.`);
}

async function main() {
  const argv = process.argv.slice(2);

  switch (argv[0]) {
    case "create":
      return create(argv);
    case "list":
      return list();
    case "revoke":
      return revoke(argv);
    default:
      console.log(USAGE);
      process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(`\n${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

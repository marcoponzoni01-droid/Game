import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

/**
 * API key handling.
 *
 * Keys are 256 bits of CSPRNG output, so they are stored as a plain SHA-256
 * hash rather than bcrypt/argon2. Slow password hashing exists to make
 * *guessable* secrets expensive to attack; a random 256-bit key has nothing to
 * guess, and running a deliberately slow KDF on every API request would cost
 * real latency for no security gain. What matters — that a database leak can't
 * be replayed against the API — holds either way.
 */

const PREFIX = "arch_";
/** Enough to identify a key in a list or log line, useless for authenticating. */
const PREFIX_LENGTH = PREFIX.length + 7;

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

export function generateApiKey() {
  const key = PREFIX + randomBytes(32).toString("base64url");

  return {
    key,
    prefix: key.slice(0, PREFIX_LENGTH),
    keyHash: hashApiKey(key),
  };
}

/** `Authorization: Bearer <key>`, or `X-API-Key: <key>`. */
export function readKeyFromRequest(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
    if (match) return match[1].trim();
  }

  const header = request.headers.get("x-api-key");
  return header ? header.trim() : null;
}

export type AuthResult =
  | { state: "anonymous" }
  | { state: "invalid"; reason: string }
  | { state: "valid"; keyId: string; name: string };

/**
 * Only update `lastUsedAt` when it is meaningfully stale — otherwise every
 * request turns into a database write.
 */
const LAST_USED_THROTTLE_MS = 60_000;

export async function authenticate(request: Request): Promise<AuthResult> {
  const presented = readKeyFromRequest(request);

  if (!presented) return { state: "anonymous" };

  // Single indexed read on the hash. The presented key is never logged.
  const record = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiKey(presented) },
    select: {
      id: true,
      name: true,
      revokedAt: true,
      expiresAt: true,
      lastUsedAt: true,
    },
  });

  if (!record) return { state: "invalid", reason: "Unknown API key." };

  if (record.revokedAt) {
    return { state: "invalid", reason: "This API key has been revoked." };
  }

  if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
    return { state: "invalid", reason: "This API key has expired." };
  }

  const stale =
    !record.lastUsedAt ||
    Date.now() - record.lastUsedAt.getTime() > LAST_USED_THROTTLE_MS;

  if (stale) {
    await prisma.apiKey.update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    });
  }

  return { state: "valid", keyId: record.id, name: record.name };
}

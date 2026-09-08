import { eq } from "drizzle-orm";

import { db } from "../database/db";
import { refreshTokens } from "../database/schema/refresh_tokens";
import { generateRefreshToken, hashRefreshToken } from "../utils/refresh-token";
import { REFRESH_TOKEN_EXPIRES_DAYS } from "../config/env";

export const createRefreshToken = async (
  userId: string,
  userAgent: string | undefined,
  ipAddress: string | undefined,
): Promise<string> => {
  const rawToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawToken);

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    userAgent: userAgent ?? null,
    ipAddress: ipAddress ?? null,
    expiresAt,
  });

  return rawToken;
};

export const findValidRefreshToken = async (rawToken: string) => {
  const tokenHash = hashRefreshToken(rawToken);

  const [token] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!token) {
    return null;
  }

  if (token.isRevoked) {
    return null;
  }

  if (token.expiresAt <= new Date()) {
    return null;
  }

  return token;
};

export const revokeRefreshToken = async (rawToken: string): Promise<void> => {
  const tokenHash = hashRefreshToken(rawToken);

  await db
    .update(refreshTokens)
    .set({
      isRevoked: true,
      updatedAt: new Date(),
    })
    .where(eq(refreshTokens.tokenHash, tokenHash));
};

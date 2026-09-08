import jwt, { type SignOptions } from "jsonwebtoken";

import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";
import type { AccessTokenPayload } from "../types/auth";

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.sub !== "string" ||
    typeof decoded.role !== "string" ||
    !["customer", "admin"].includes(decoded.role)
  ) {
    throw new Error("Invalid access token payload");
  }

  return {
    sub: decoded.sub,
    role: decoded.role as AccessTokenPayload["role"],
  };
};

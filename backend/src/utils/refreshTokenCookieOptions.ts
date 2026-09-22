import type { CookieOptions } from "express";

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true, // Required when sameSite is "none"
  sameSite: "none", // Allows cross-domain cookies between Vercel & Render
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

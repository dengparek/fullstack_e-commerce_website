import rateLimit, { type Options } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

import { AppError } from "../utils/app-error";

// Optional: Redis store integration for load-balanced/multi-instance setups
// import RedisStore from "rate-limit-redis";
// import { redisClient } from "../config/redis";

/**
 * Standard handler to pass rate-limit rejections through AppError
 */
const rateLimitHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction,
  _options: Options,
) => {
  next(
    new AppError(
      "Too many requests. Please try again in 15 minutes.",
      429,
      "TOO_MANY_REQUESTS",
    ),
  );
};

/**
 * Strict Rate Limiter: For brute-force sensitive endpoints (Login, Register, Password Reset)
 * Limit: 10 requests per 15 minutes per IP
 */
export const strictAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler,
  // store: new RedisStore({ sendCommand: (...args: string[]) => redisClient.sendCommand(args) }),
});

/**
 * Moderate Rate Limiter: For background session maintenance (Refresh Token, Logout, /me)
 * Limit: 60 requests per 15 minutes per IP
 */
export const tokenRefreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler,
  // store: new RedisStore({ sendCommand: (...args: string[]) => redisClient.sendCommand(args) }),
});

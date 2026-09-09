import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { registerUser, loginUser } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { refreshTokenCookieOptions } from "../utils/refreshTokenCookieOptions";
import { generateAccessToken } from "../utils/access-tokens";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";
import { db } from "../database/db";
import {
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
} from "../services/refresh-token.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const validationResult = registerSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid registration data",
      errors: z.treeifyError(validationResult.error),
    });
    return;
  }

  try {
    const result = await registerUser(validationResult.data);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    if (
      error?.statusCode === 409 ||
      error?.message === "Email is already registered"
    ) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const validationResult = loginSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid login data",
      errors: z.treeifyError(validationResult.error),
    });
    return;
  }

  try {
    const result = await loginUser(
      validationResult.data,
      req.get("user-agent"),
      req.ip,
    );

    res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);
    const { refreshToken: _refreshToken, ...loginData } = result;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    if (
      error?.statusCode === 401 ||
      error?.message === "Invalid email or password"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    if (error?.statusCode === 403 || error?.message === "Account is inactive") {
      res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
      return;
    }

    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: "Refresh token is required",
    });
    return;
  }

  try {
    const storedToken = await findValidRefreshToken(refreshToken);

    if (!storedToken) {
      res.clearCookie("refreshToken", refreshTokenCookieOptions);
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, storedToken.userId))
      .limit(1);

    if (!user || !user.isActive) {
      res.clearCookie("refreshToken", refreshTokenCookieOptions);
      res.status(401).json({
        success: false,
        message: "Invalid or inactive account",
      });
      return;
    }

    // Revoke old token and issue a fresh pair
    await revokeRefreshToken(refreshToken);

    const newRefreshToken = await createRefreshToken(
      user.id,
      req.get("user-agent"),
      req.ip,
    );

    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
    });

    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

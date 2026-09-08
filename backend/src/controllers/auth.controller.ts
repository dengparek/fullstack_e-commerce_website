import type { Request, Response, NextFunction, CookieOptions } from "express";
import { z } from "zod";

import { registerUser, loginUser } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validations/auth.validation";

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

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

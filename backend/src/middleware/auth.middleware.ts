import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { verifyAccessToken } from "../utils/access-tokens";
import type { AuthenticatedUser, UserRole } from "../types/auth";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authorizationHeader = req.get("Authorization");

  if (!authorizationHeader) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    res.status(401).json({
      success: false,
      message: "Invalid authorization header format",
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    const authenticatedUser: AuthenticatedUser = {
      id: payload.sub,
      role: payload.role,
    };

    req.user = authenticatedUser;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Access token expired",
        code: "TOKEN_EXPIRED", // Helpful flag for frontend refresh interceptors
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};

/**
 * Role-Based Authorization Guard Middleware
 * Usage: router.post("/products", authenticate, authorize("admin"), createProduct)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
};

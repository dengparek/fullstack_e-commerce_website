import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { verifyAccessToken } from "../utils/access-tokens";
import type { AuthenticatedUser, UserRole } from "../types/auth";
import { db } from "../database/db";
import { users } from "../database/schema/users";

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
        code: "TOKEN_EXPIRED",
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
 * Role-Based Authorization Guard with DB Verification
 *
 * Usage:
 * router.post("/products", authenticate, authorize("admin"), createProduct);
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    try {
      const [user] = await db
        .select({
          id: users.id,
          role: users.role,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User account not found",
        });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: "Account is inactive",
        });
        return;
      }

      if (allowedRoles.length === 0) {
        res.status(500).json({
          success: false,
          message: "No authorization roles configured",
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
        return;
      }

      // Synchronize req.user with fresh database state
      req.user = {
        id: user.id,
        role: user.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

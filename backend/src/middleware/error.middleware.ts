import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { z } from "zod";

import { AppError } from "../utils/app-error";
import { NODE_ENV } from "../config/env";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Operational AppErrors (explicit status code and message)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code && { code: err.code }),
    });
    return;
  }

  // 2. Unhandled Zod Validation Errors (fallback catch for safeParse exceptions)
  if (err instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: z.treeifyError(err),
    });
    return;
  }

  // 3. PostgreSQL / Drizzle Foreign Key Violations & Unique Constraint Violations
  const pgError = err as { code?: string; detail?: string };
  if (pgError.code === "23505") {
    res.status(409).json({
      success: false,
      message: "A record with this unique identifier already exists",
    });
    return;
  }

  if (pgError.code === "23503") {
    res.status(400).json({
      success: false,
      message: "Referenced entity does not exist",
    });
    return;
  }

  // 4. Unexpected / Programming Errors (500)
  console.error("Unhandled Application Error:", err);

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred on the server",
    ...(NODE_ENV === "development" && {
      stack: err.stack,
      errorDetails: err.message,
    }),
  });
};

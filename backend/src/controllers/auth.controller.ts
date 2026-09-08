import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { registerSchema } from "../validations/auth.validation";
import { registerUser } from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // 1. Validate Input
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
    // 2. Execute Business Logic
    const result = await registerUser(validationResult.data);

    // 3. Respond
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    // Check if custom status exists on error object or fallback to message check
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

    // Forward unexpected errors to global Express error handler
    next(error);
  }
};

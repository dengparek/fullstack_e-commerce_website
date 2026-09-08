import { eq } from "drizzle-orm";

import { db } from "../database/db";
import { users } from "../database/schema/users";
import { hashPassword } from "../utils/password";
import { generateAccessToken } from "../utils/tokens";

import type { RegisterResult } from "../types/auth";
import type { RegisterInput } from "../validations/auth.validation";

// Optional: Lightweight custom error classes for clean HTTP mapping
export class ConflictError extends Error {
  statusCode = 409;
}

export class BadRequestError extends Error {
  statusCode = 400;
}

export const registerUser = async (
  input: RegisterInput,
): Promise<RegisterResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1. Existence check (Fast-path error reporting)
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser) {
    throw new ConflictError("Email is already registered");
  }

  // 2. Hash password after validating email doesn't exist (saves CPU cycles)
  const passwordHash = await hashPassword(input.password);

  try {
    // 3. Insert and return user payload
    const [user] = await db
      .insert(users)
      .values({
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    if (!user) {
      throw new BadRequestError("Failed to create user");
    }

    // 4. Generate JWT
    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user,
      accessToken,
    };
  } catch (error: any) {
    // Catch database-level unique constraint violations (pg code 23505)
    if (error?.code === "23505") {
      throw new ConflictError("Email is already registered");
    }
    throw error;
  }
};

import type { users } from "../database/schema/users";

// Reuse role type directly from Drizzle schema definition
export type UserRole = typeof users.$inferSelect.role;

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RegisterResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
}

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

export interface LoginResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string | null;
  price: number;
  stock?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface ListProductsOptions {
  page: number;
  limit: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
  includeInactive?: boolean;
}

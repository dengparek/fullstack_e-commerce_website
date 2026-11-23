import { db } from "../database/db";
import { categories, products } from "../database/schema";
import { and, eq, ne } from "drizzle-orm";
import { AppError } from "./app-error";

// --------------------------------------------------
// UTILITY FUNCTIONS
// --------------------------------------------------

export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ensureUniqueSku = async (
  sku: string,
  excludeProductId?: string,
): Promise<void> => {
  const whereCondition = excludeProductId
    ? and(eq(products.sku, sku), ne(products.id, excludeProductId))
    : eq(products.sku, sku);

  const [existingProduct] = await db
    .select({ id: products.id })
    .from(products)
    .where(whereCondition)
    .limit(1);

  if (existingProduct) {
    throw AppError.conflict(
      "A product with this SKU already exists",
      "PRODUCT_SKU_EXISTS",
    );
  }
};

export const ensureCategoryExists = async (
  categoryId: string,
): Promise<void> => {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    throw AppError.notFound("Category not found", "CATEGORY_NOT_FOUND");
  }
};

export const generateUniqueSlug = async (
  name: string,
  excludeProductId?: string,
): Promise<string> => {
  const baseSlug = generateSlug(name);

  if (!baseSlug) {
    throw AppError.badRequest(
      "Product name cannot produce a valid slug",
      "INVALID_PRODUCT_SLUG",
    );
  }

  let slug = baseSlug;
  let counter = 1;
  const maxAttempts = 50;

  while (counter <= maxAttempts) {
    const whereCondition = excludeProductId
      ? and(eq(products.slug, slug), ne(products.id, excludeProductId))
      : eq(products.slug, slug);

    const [existingProduct] = await db
      .select({ id: products.id })
      .from(products)
      .where(whereCondition)
      .limit(1);

    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  throw AppError.internal("Could not generate a unique product slug");
};

// Common SELECT columns with Category JOIN
export const productSelectFields = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  sku: products.sku,
  categoryId: products.categoryId,
  description: products.description,
  price: products.price,
  stock: products.stock,
  imageUrl: products.imageUrl,
  isActive: products.isActive,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,

  category: {
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
  },
};

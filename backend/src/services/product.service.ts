import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  ne,
  or,
} from "drizzle-orm";

import { db } from "../database/db";
import { products } from "../database/schema/products";
import { AppError } from "../utils/app-error";

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

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const ensureUniqueSku = async (
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

const generateUniqueSlug = async (
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
  const maxAttempts = 100;

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

export const createProduct = async (input: CreateProductInput) => {
  await ensureUniqueSku(input.sku);

  const slug = await generateUniqueSlug(input.name);

  const [product] = await db
    .insert(products)
    .values({
      name: input.name,
      slug,
      sku: input.sku,
      description: input.description ?? null,
      price: input.price.toFixed(2),
      stock: input.stock ?? 0,
      imageUrl: input.imageUrl ?? null,
      isActive: input.isActive ?? true,
    })
    .returning();

  if (!product) {
    throw AppError.internal("Failed to create product");
  }

  return product;
};

export const getProductById = async (productId: string) => {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }

  return product;
};

export const getProductBySlug = async (slug: string) => {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }

  return product;
};

export const listProducts = async (options: ListProductsOptions) => {
  const {
    page,
    limit,
    search,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
    includeInactive = false,
  } = options;

  const offset = (page - 1) * limit;
  const conditions = [];

  if (!includeInactive) {
    conditions.push(eq(products.isActive, true));
  }

  if (search?.trim()) {
    const searchPattern = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, searchPattern),
        ilike(products.description, searchPattern),
        ilike(products.sku, searchPattern),
      ),
    );
  }

  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice.toFixed(2)));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice.toFixed(2)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy = {
    name: products.name,
    price: products.price,
    createdAt: products.createdAt,
  }[sortBy];

  const order = sortOrder === "asc" ? asc(orderBy) : desc(orderBy);

  const [productRows, [countResult]] = await Promise.all([
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(order)
      .limit(limit)
      .offset(offset),

    db.select({ total: count() }).from(products).where(whereClause),
  ]);

  const total = Number(countResult?.total ?? 0);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    products: productRows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const updateProduct = async (
  productId: string,
  input: UpdateProductInput,
) => {
  const existingProduct = await getProductById(productId);

  if (input.sku && input.sku !== existingProduct.sku) {
    await ensureUniqueSku(input.sku, productId);
  }

  let slug: string | undefined;
  if (input.name && input.name !== existingProduct.name) {
    slug = await generateUniqueSlug(input.name, productId);
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (slug !== undefined) updateData.slug = slug;
  if (input.sku !== undefined) updateData.sku = input.sku;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.price !== undefined) updateData.price = input.price.toFixed(2);
  if (input.stock !== undefined) updateData.stock = input.stock;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const [updatedProduct] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, productId))
    .returning();

  if (!updatedProduct) {
    throw AppError.internal("Failed to update product");
  }

  return updatedProduct;
};

export const deactivateProduct = async (productId: string) => {
  const [product] = await db
    .update(products)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning();

  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }

  return product;
};

import { and, asc, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";

import type {
  CreateProductInput,
  ListProductsQueryInput,
  UpdateProductInput,
} from "../validations/product.validation";

import { db } from "../database/db";

import { AppError } from "../utils/app-error";
import { categories, products } from "../database/schema";
import {
  ensureCategoryExists,
  ensureUniqueSku,
  generateUniqueSlug,
  productSelectFields,
} from "../utils/product_utilFuncs";

// --------------------------------------------------
// SERVICE METHODS
// --------------------------------------------------

export const createProduct = async (input: CreateProductInput) => {
  // Validate category exists
  if (!input.categoryId) {
    throw AppError.badRequest(
      "Category ID is required",
      "CATEGORY_ID_REQUIRED",
    );
  }
  const [categoryExists] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, input.categoryId))
    .limit(1);

  if (!categoryExists) {
    throw AppError.notFound(
      "Selected category does not exist",
      "CATEGORY_NOT_FOUND",
    );
  }

  if (input.categoryId !== undefined && input.categoryId !== null) {
    await ensureCategoryExists(input.categoryId);
  }

  await ensureUniqueSku(input.sku);
  const slug = await generateUniqueSlug(input.name);

  try {
    const [product] = await db
      .insert(products)
      .values({
        name: input.name,
        slug,
        sku: input.sku,
        categoryId: input.categoryId,
        description: input.description ?? null,
        price: input.price.toFixed(2),
        stock: input.stock ?? 0,
        imageUrl: input.imageUrl ?? null,
        isActive: input.isActive ?? true,
      })
      .returning({ id: products.id });

    if (!product) {
      throw AppError.internal("Failed to create product");
    }

    return getProductById(product.id);
  } catch (error: any) {
    if (error?.code === "23505") {
      throw AppError.conflict(
        "A product with this SKU or slug already exists",
        "PRODUCT_DUPLICATE",
      );
    }
    throw error;
  }
};

export const getProductById = async (productId: string) => {
  const [product] = await db
    .select(productSelectFields)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }

  return product;
};

export const getProductBySlug = async (slug: string) => {
  const [product] = await db
    .select(productSelectFields)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }

  return product;
};

export const listProducts = async (options: ListProductsQueryInput) => {
  const {
    page = 1,
    limit = 10,
    search,
    categoryId,
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

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
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

  const sortColumnMap = {
    name: products.name,
    price: products.price,
    createdAt: products.createdAt,
  };

  const selectedSortColumn = sortColumnMap[sortBy] ?? products.createdAt;
  const order =
    sortOrder === "asc" ? asc(selectedSortColumn) : desc(selectedSortColumn);

  const [productRows, [countResult]] = await Promise.all([
    db
      .select(productSelectFields)
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
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

  if (input.categoryId && input.categoryId !== existingProduct.categoryId) {
    const [categoryExists] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1);

    if (!categoryExists) {
      throw AppError.notFound(
        "Selected category does not exist",
        "CATEGORY_NOT_FOUND",
      );
    }
  }

  if (input.categoryId !== undefined && input.categoryId !== null) {
    await ensureCategoryExists(input.categoryId);
  }

  if (input.sku && input.sku !== existingProduct.sku) {
    await ensureUniqueSku(input.sku, productId);
  }

  let slug: string | undefined;
  if (input.name && input.name !== existingProduct.name) {
    slug = await generateUniqueSlug(input.name, productId);
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    ...(input.name !== undefined && { name: input.name }),
    ...(slug !== undefined && { slug }),
    ...(input.sku !== undefined && { sku: input.sku }),
    ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.price !== undefined && { price: input.price.toFixed(2) }),
    ...(input.stock !== undefined && { stock: input.stock }),
    ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  };

  const [updatedProduct] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, productId))
    .returning({ id: products.id });

  if (!updatedProduct) {
    throw AppError.internal("Failed to update product");
  }

  return getProductById(updatedProduct.id);
};

export const deactivateProduct = async (productId: string) => {
  const [product] = await db
    .update(products)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning({ id: products.id });

  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }

  return product;
};

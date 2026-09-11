import { and, asc, eq, isNull, ne, or } from "drizzle-orm";

import { db } from "../database/db";
import { categories } from "../database/schema/categories";
import { AppError } from "../utils/app-error";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validations/category.validation";

// --------------------------------------------------
// GET ALL CATEGORIES (SUPPORT TREE BUILDING)
// --------------------------------------------------

export const getAllCategories = async (includeInactive = false) => {
  const whereCondition = includeInactive
    ? undefined
    : eq(categories.isActive, true);

  const allCategories = await db
    .select()
    .from(categories)
    .where(whereCondition)
    .orderBy(asc(categories.name));

  return allCategories;
};

// --------------------------------------------------
// GET CATEGORY BY ID
// --------------------------------------------------

export const getCategoryById = async (categoryId: string) => {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    throw AppError.notFound("Category not found");
  }

  return category;
};

// --------------------------------------------------
// GET CATEGORY BY SLUG
// --------------------------------------------------

export const getCategoryBySlug = async (slug: string) => {
  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
    .limit(1);

  if (!category) {
    throw AppError.notFound("Category not found");
  }

  return category;
};

// --------------------------------------------------
// CREATE CATEGORY
// --------------------------------------------------

export const createCategory = async (input: CreateCategoryInput) => {
  // 1. Single query to check both name and slug collision
  const [existing] = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .where(or(eq(categories.name, input.name), eq(categories.slug, input.slug)))
    .limit(1);

  if (existing) {
    if (existing.name === input.name) {
      throw AppError.conflict("A category with this name already exists");
    }
    if (existing.slug === input.slug) {
      throw AppError.conflict("A category with this slug already exists");
    }
  }

  // 2. Validate Parent Category if provided
  if (input.parentId) {
    await getCategoryById(input.parentId);
  }

  // 3. Insert Category with Unique Constraint Guard
  try {
    const [category] = await db
      .insert(categories)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        parentId: input.parentId ?? null,
      })
      .returning();

    if (!category) {
      throw AppError.internal("Failed to create category");
    }

    return category;
  } catch (error: any) {
    if (error?.code === "23505") {
      throw AppError.conflict(
        "A category with this name or slug already exists",
      );
    }
    throw error;
  }
};

// --------------------------------------------------
// UPDATE CATEGORY
// --------------------------------------------------

export const updateCategory = async (
  categoryId: string,
  input: UpdateCategoryInput,
) => {
  const existingCategory = await getCategoryById(categoryId);

  // 1. Prevent Category from becoming its own parent
  if (input.parentId && input.parentId === categoryId) {
    throw AppError.badRequest("A category cannot be its own parent");
  }

  // 2. Validate new parent existence if updated
  if (input.parentId && input.parentId !== existingCategory.parentId) {
    await getCategoryById(input.parentId);
  }

  // 3. Single query duplicate check excluding current category
  if (input.name || input.slug) {
    const conditions = [];
    if (input.name) conditions.push(eq(categories.name, input.name));
    if (input.slug) conditions.push(eq(categories.slug, input.slug));

    const [duplicate] = await db
      .select({ name: categories.name, slug: categories.slug })
      .from(categories)
      .where(and(ne(categories.id, categoryId), or(...conditions)))
      .limit(1);

    if (duplicate) {
      if (input.name && duplicate.name === input.name) {
        throw AppError.conflict("A category with this name already exists");
      }
      if (input.slug && duplicate.slug === input.slug) {
        throw AppError.conflict("A category with this slug already exists");
      }
    }
  }

  // 4. Perform Update
  const [updatedCategory] = await db
    .update(categories)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.parentId !== undefined && { parentId: input.parentId }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(categories.id, categoryId))
    .returning();

  if (!updatedCategory) {
    throw AppError.internal("Failed to update category");
  }

  return updatedCategory;
};

// --------------------------------------------------
// SOFT DELETE / DEACTIVATE CATEGORY
// --------------------------------------------------

export const deleteCategory = async (categoryId: string) => {
  const existingCategory = await getCategoryById(categoryId);

  if (!existingCategory.isActive) {
    throw AppError.badRequest("Category is already inactive");
  }

  const [updatedCategory] = await db
    .update(categories)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, categoryId))
    .returning();

  if (!updatedCategory) {
    throw AppError.internal("Failed to deactivate category");
  }

  return updatedCategory;
};

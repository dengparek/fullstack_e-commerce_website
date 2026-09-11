import { z } from "zod";

// Utility function to convert strings to clean slugs
export const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W_]+(-[\s\W_]+)*/g, "-") // Replace spaces and special characters with hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

// Common validation primitives
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugErrorMessage =
  "Category slug must contain only lowercase letters, numbers, and hyphens";

// --------------------------------------------------
// CREATE CATEGORY SCHEMA
// --------------------------------------------------
export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters"),

    slug: z
      .string()
      .trim()
      .min(2, "Category slug must be at least 2 characters")
      .max(120, "Category slug cannot exceed 120 characters")
      .regex(slugRegex, slugErrorMessage)
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, "Category description cannot exceed 1000 characters")
      .optional(),

    parentId: z
      .string()
      .uuid("Invalid parent category ID")
      .nullable()
      .optional(),
  })
  .transform((data) => ({
    ...data,
    // Auto-generate slug from name if not explicitly provided
    slug: data.slug ? data.slug : slugify(data.name),
  }));

// --------------------------------------------------
// UPDATE CATEGORY SCHEMA
// --------------------------------------------------
export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters")
      .optional(),

    slug: z
      .string()
      .trim()
      .min(2, "Category slug must be at least 2 characters")
      .max(120, "Category slug cannot exceed 120 characters")
      .regex(slugRegex, slugErrorMessage)
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, "Category description cannot exceed 1000 characters")
      .nullable()
      .optional(),

    parentId: z
      .string()
      .uuid("Invalid parent category ID")
      .nullable()
      .optional(),

    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.slug !== undefined ||
      data.description !== undefined ||
      data.parentId !== undefined ||
      data.isActive !== undefined,
    {
      message: "At least one field must be provided for update",
    },
  );

// --------------------------------------------------
// PARAM & QUERY SCHEMAS
// --------------------------------------------------
export const categoryIdParamSchema = z.object({
  id: z.uuid("Invalid category ID format"),
});

export const categorySlugParamSchema = z.object({
  slug: z.string().trim().regex(slugRegex, slugErrorMessage),
});

export const categoryListQuerySchema = z.object({
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true")
    .default(false),
});

// --------------------------------------------------
// TYPE INFERENCES
// --------------------------------------------------
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParamInput = z.infer<typeof categoryIdParamSchema>;
export type CategorySlugParamInput = z.infer<typeof categorySlugParamSchema>;
export type CategoryListQueryInput = z.infer<typeof categoryListQuerySchema>;

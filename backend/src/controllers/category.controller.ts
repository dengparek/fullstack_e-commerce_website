import type { NextFunction, Request, Response } from "express";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
} from "../services/category.service";
import {
  categoryIdParamSchema,
  categoryListQuerySchema,
  categorySlugParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validations/category.validation";

// --------------------------------------------------
// Get all categories (Public / Admin Filterable)
// GET /api/categories
// --------------------------------------------------
export const handlegetAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { includeInactive } = categoryListQuerySchema.parse(req.query);

    const categories = await getAllCategories(includeInactive);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Get category by ID
// GET /api/categories/:id
// --------------------------------------------------
export const handlegetCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);

    const category = await getCategoryById(id);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Get category by Slug (Public Storefront)
// GET /api/categories/slug/:slug
// --------------------------------------------------
export const handleGetCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { slug } = categorySlugParamSchema.parse(req.params);

    const category = await getCategoryBySlug(slug);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Create new category (Admin)
// POST /api/categories
// --------------------------------------------------
export const handlecreateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = createCategorySchema.parse(req.body);

    const category = await createCategory(input);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Update category (Admin)
// PATCH /api/categories/:id
// --------------------------------------------------
export const handleupdateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const input = updateCategorySchema.parse(req.body);

    const category = await updateCategory(id, input);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Deactivate category (Admin)
// DELETE /api/categories/:id
// --------------------------------------------------
export const handledeactivateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);

    const category = await deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

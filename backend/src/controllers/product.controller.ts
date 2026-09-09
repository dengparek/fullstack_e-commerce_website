import type { Request, Response, NextFunction } from "express";

import {
  createProduct,
  deactivateProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  updateProduct,
} from "../services/product.service";

import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  listProductsQuerySchema,
} from "../validations/product.validation";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validationResult = createProductSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
      return;
    }

    const product = await createProduct(validationResult.data);

    res.status(201).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validationResult = productIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
        errors: validationResult.error.issues,
      });
      return;
    }

    const product = await getProductById(validationResult.data.id);

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const slug = req.params.slug;

    if (!slug) {
      res.status(400).json({
        success: false,
        message: "Product slug is required",
      });
      return;
    }

    const product = await getProductBySlug(slug);

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate query parameters cleanly using Zod
    const validationResult = listProductsQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validationResult.error.issues,
      });
      return;
    }

    const result = await listProducts(validationResult.data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const paramValidation = productIdParamSchema.safeParse(req.params);

    if (!paramValidation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const bodyValidation = updateProductSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: bodyValidation.error.issues,
      });
      return;
    }

    const product = await updateProduct(
      paramValidation.data.id,
      bodyValidation.data,
    );

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deactivate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validationResult = productIdParamSchema.safeParse(req.params);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await deactivateProduct(validationResult.data.id);

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

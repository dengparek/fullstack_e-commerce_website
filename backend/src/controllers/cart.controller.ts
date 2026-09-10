import type { Request, Response, NextFunction } from "express";

import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/cart.service";

import {
  addCartItemSchema,
  cartItemProductIdParamSchema,
  updateCartItemSchema,
} from "../validations/cart.validation";
import { AppError } from "../utils/app-error";

// Helper to ensure authenticated user exists
const getAuthUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw AppError.unauthorized("Authentication required");
  }
  return req.user.id;
};

// --------------------------------------------------
// Get user's cart
// GET /api/cart
// --------------------------------------------------
export const getItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthUserId(req);
    const cart = await getCart(userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Add item to cart
// POST /api/cart/items
// --------------------------------------------------
export const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthUserId(req);
    const input = addCartItemSchema.parse(req.body);

    const item = await addCartItem(userId, input);

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Update cart item quantity
// PATCH /api/cart/items/:productId
// --------------------------------------------------
export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthUserId(req);
    const { productId } = cartItemProductIdParamSchema.parse(req.params);
    const input = updateCartItemSchema.parse(req.body);

    const item = await updateCartItem(userId, productId, input);

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Remove item from cart
// DELETE /api/cart/items/:productId
// --------------------------------------------------
export const removeItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthUserId(req);
    const { productId } = cartItemProductIdParamSchema.parse(req.params);

    await removeCartItem(userId, productId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Clear user's cart
// DELETE /api/cart
// --------------------------------------------------
export const clear = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthUserId(req);

    await clearCart(userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

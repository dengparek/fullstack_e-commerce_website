import type { NextFunction, Request, Response } from "express";

import {
  createOrder,
  getUserOrderById,
  getUserOrders,
} from "../services/order.service";
import { AppError } from "../utils/app-error";
import {
  createOrderSchema,
  orderIdParamSchema,
  orderListQuerySchema,
} from "../validations/order.validation";

// Helper to ensure authenticated user exists
const getAuthUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw AppError.unauthorized("Authentication required");
  }

  return req.user.id;
};

// --------------------------------------------------
// Create new order (Checkout)
// POST /api/orders
// --------------------------------------------------
export const createNewOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthUserId(req);
    const input = createOrderSchema.parse(req.body);

    const order = await createOrder(userId, input);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Get user's orders list
// GET /api/orders
// --------------------------------------------------
export const listAllUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthUserId(req);
    const { page, limit } = orderListQuerySchema.parse(req.query);
    const orders = await getUserOrders(userId, page, limit);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Get single order details
// GET /api/orders/:id
// --------------------------------------------------
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthUserId(req);
    const { id } = orderIdParamSchema.parse(req.params);

    const order = await getUserOrderById(userId, id);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

import type { NextFunction, Request, Response } from "express";

import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../services/admin-order.service";
import {
  orderIdParamSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
} from "../validations/order.validation";

// --------------------------------------------------
// Get all orders (Paginated & Filterable)
// GET /api/admin/orders
// --------------------------------------------------
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, status, paymentStatus } = orderListQuerySchema.parse(
      req.query,
    );

    const result = await getAllOrders({
      page,
      limit,
      status,
      paymentStatus,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Get order details by ID
// GET /api/admin/orders/:id
// --------------------------------------------------
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = orderIdParamSchema.parse(req.params);

    const order = await getOrderById(id);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Update order status or payment status
// PATCH /api/admin/orders/:id/status
// --------------------------------------------------
export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = orderIdParamSchema.parse(req.params);
    const input = updateOrderStatusSchema.parse(req.body);

    const updatedOrder = await updateOrderStatus(id, input);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

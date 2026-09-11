import { and, asc, count, desc, eq, sql } from "drizzle-orm";

import { db } from "../database/db";
import { orderItems, orders } from "../database/schema/orders";
import { products } from "../database/schema/products";
import { AppError } from "../utils/app-error";
import type { UpdateOrderStatusInput } from "../validations/order.validation";

import {
  ALLOWED_ORDER_TRANSITIONS,
  ALLOWED_PAYMENT_TRANSITIONS,
  type GetAllOrdersOptions,
} from "../types/auth";

// --------------------------------------------------
// GET ALL ORDERS (PAGINATED & FILTERABLE)
// --------------------------------------------------

export const getAllOrders = async ({
  page,
  limit,
  status,
  paymentStatus,
}: GetAllOrdersOptions) => {
  const offset = (page - 1) * limit;

  const whereConditions = and(
    status ? eq(orders.status, status) : undefined,
    paymentStatus ? eq(orders.paymentStatus, paymentStatus) : undefined,
  );

  const [orderList, countResult] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        userId: orders.userId,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        subtotal: orders.subtotal,
        shippingAmount: orders.shippingAmount,
        totalAmount: orders.totalAmount,
        shippingName: orders.shippingName,
        shippingPhone: orders.shippingPhone,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(whereConditions)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),

    db
      .select({
        total: count(),
      })
      .from(orders)
      .where(whereConditions),
  ]);

  const total = Number(countResult[0]?.total ?? 0);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: orderList,
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

// --------------------------------------------------
// GET ORDER BY ID WITH LIVE PRODUCT METADATA
// --------------------------------------------------

export const getOrderById = async (orderId: string) => {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      userId: orders.userId,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      subtotal: orders.subtotal,
      shippingAmount: orders.shippingAmount,
      totalAmount: orders.totalAmount,
      shippingName: orders.shippingName,
      shippingPhone: orders.shippingPhone,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    throw AppError.notFound("Order not found");
  }

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      productName: orderItems.productName,
      unitPrice: orderItems.unitPrice,
      quantity: orderItems.quantity,
      subtotal: orderItems.subtotal,
      currentProductImage: products.imageUrl,
      createdAt: orderItems.createdAt,
      updatedAt: orderItems.updatedAt,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.createdAt));

  return {
    ...order,
    items,
  };
};

// --------------------------------------------------
// UPDATE ORDER STATUS (WITH AUTOMATIC INVENTORY RESTORATION)
// --------------------------------------------------

export const updateOrderStatus = async (
  orderId: string,
  input: UpdateOrderStatusInput,
) => {
  return db.transaction(async (tx) => {
    // 1. Lock the order row for transactional integrity
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .for("update");

    if (!order) {
      throw AppError.notFound("Order not found");
    }

    // 2. Validate Order Status Transitions
    if (input.status !== undefined) {
      if (input.status === order.status) {
        throw AppError.badRequest(`Order status is already "${order.status}"`);
      }

      const allowedStatuses = ALLOWED_ORDER_TRANSITIONS[order.status];

      if (!allowedStatuses.includes(input.status)) {
        throw AppError.badRequest(
          `Cannot change order status from "${order.status}" to "${input.status}"`,
        );
      }
    }

    // 3. Validate Payment Status Transitions
    if (input.paymentStatus !== undefined) {
      if (input.paymentStatus === order.paymentStatus) {
        throw AppError.badRequest(
          `Payment status is already "${order.paymentStatus}"`,
        );
      }

      const allowedPaymentStatuses =
        ALLOWED_PAYMENT_TRANSITIONS[order.paymentStatus];

      if (!allowedPaymentStatuses.includes(input.paymentStatus)) {
        throw AppError.badRequest(
          `Cannot change payment status from "${order.paymentStatus}" to "${input.paymentStatus}"`,
        );
      }
    }

    // 4. Restore Product Stock if transitioning to "cancelled"
    if (input.status === "cancelled" && order.status !== "cancelled") {
      const itemsToRestore = await tx
        .select({
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      for (const item of itemsToRestore) {
        if (item.productId) {
          await tx
            .update(products)
            .set({
              stock: sql`${products.stock} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }
      }
    }

    // 5. Update Order Record
    const [updatedOrder] = await tx
      .update(orders)
      .set({
        ...(input.status !== undefined && { status: input.status }),
        ...(input.paymentStatus !== undefined && {
          paymentStatus: input.paymentStatus,
        }),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      throw AppError.internal("Failed to update order status");
    }

    return updatedOrder;
  });
};

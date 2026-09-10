import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "../database/db";
import { cartItems, carts } from "../database/schema/carts";
import { orderItems, orders } from "../database/schema/orders";
import { products } from "../database/schema/products";
import { AppError } from "../utils/app-error";
import { generateOrderNumber } from "../utils/order-number";
import type { CreateOrderInput } from "../validations/order.validation";

// --------------------------------------------------
// Create new order (Atomic Checkout Transaction)
// --------------------------------------------------
export const createOrder = async (userId: string, input: CreateOrderInput) => {
  return db.transaction(async (tx) => {
    // 1. Get the user's cart
    const [cart] = await tx
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (!cart) {
      throw AppError.badRequest("Your cart is empty");
    }

    // 2. Get cart items
    const items = await tx
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id))
      .orderBy(asc(cartItems.id));

    if (items.length === 0) {
      throw AppError.badRequest("Your cart is empty");
    }

    // Sort product IDs deterministically to prevent Postgres deadlocks on row locks
    const productIds = items
      .map((item) => item.productId)
      .sort((a, b) => a.localeCompare(b));

    // 3. Lock all products involved in deterministic order
    const lockedProducts = await tx
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        isActive: products.isActive,
      })
      .from(products)
      .where(inArray(products.id, productIds))
      .orderBy(asc(products.id))
      .for("update");

    // 4. Validate product existence
    if (lockedProducts.length !== productIds.length) {
      throw AppError.badRequest(
        "One or more products in your cart are no longer available",
      );
    }

    const productMap = new Map(
      lockedProducts.map((product) => [product.id, product]),
    );

    // 5. Validate inventory, status, and calculate totals
    let subtotalCents = 0;
    const orderItemValues = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product || !product.isActive) {
        throw AppError.badRequest(
          `Product "${product?.name ?? "Unknown"}" is no longer available`,
        );
      }

      if (product.stock < item.quantity) {
        throw AppError.badRequest(
          `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) available`,
        );
      }

      const unitPriceCents = Math.round(Number(product.price) * 100);
      const itemSubtotalCents = unitPriceCents * item.quantity;

      subtotalCents += itemSubtotalCents;

      orderItemValues.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: (itemSubtotalCents / 100).toFixed(2),
      });
    }

    const shippingAmountCents = 0;
    const totalAmountCents = subtotalCents + shippingAmountCents;

    const subtotal = (subtotalCents / 100).toFixed(2);
    const shippingAmount = (shippingAmountCents / 100).toFixed(2);
    const totalAmount = (totalAmountCents / 100).toFixed(2);

    // 6. Create order record
    const orderNumber = generateOrderNumber();

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        userId,
        status: "pending",
        paymentStatus: "pending",
        subtotal,
        shippingAmount,
        totalAmount,
        shippingName: input.shippingName,
        shippingPhone: input.shippingPhone,
        shippingAddress: input.shippingAddress,
      })
      .returning();

    if (!order) {
      throw AppError.internal("Failed to create order");
    }

    // 7. Insert order item snapshots
    await tx.insert(orderItems).values(
      orderItemValues.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    );

    // 8. Decrement product stock atomically
    for (const item of items) {
      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId));
    }

    // 9. Clear cart
    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return {
      ...order,
      items: orderItemValues,
    };
  });
};

export const getUserOrders = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const offset = (page - 1) * limit;

  const [userOrders, countResult] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
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
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),

    db
      .select({
        total: count(),
      })
      .from(orders)
      .where(eq(orders.userId, userId)),
  ]);

  const total = countResult[0]?.total ?? 0;

  const totalPages = Math.ceil(total / limit);

  return {
    data: userOrders,
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
// Get single order details
// --------------------------------------------------
export const getUserOrderById = async (userId: string, orderId: string) => {
  // 1. Fetch order record from Postgres
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    throw AppError.notFound("Order not found");
  }

  // 2. Fetch associated items from Postgres
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.createdAt));

  return {
    ...order,
    items,
  };
};

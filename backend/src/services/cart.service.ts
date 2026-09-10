import { and, eq, sql } from "drizzle-orm";

import { db } from "../database/db";
import { cartItems, carts } from "../database/schema/carts";
import { products } from "../database/schema/products";
import { AppError } from "../utils/app-error";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "../validations/cart.validation";

// Helper type to accept either the standard DB client or a Transaction
type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

// --------------------------------------------------
// Get or create a cart for a user (Reusable in transactions)
// --------------------------------------------------
const getOrCreateCart = async (userId: string, client: DbOrTx = db) => {
  const [createdCart] = await client
    .insert(carts)
    .values({ userId })
    .onConflictDoNothing({
      target: carts.userId,
    })
    .returning();

  if (createdCart) {
    return createdCart;
  }

  const [existingCart] = await client
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (!existingCart) {
    throw AppError.internal("Failed to create or retrieve cart");
  }

  return existingCart;
};

// --------------------------------------------------
// Get user's cart
// --------------------------------------------------
export const getCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      product: {
        id: products.id,
        name: products.name,
        sku: products.sku,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        isActive: products.isActive,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  let totalItems = 0;
  let subtotalCents = 0;

  for (const item of items) {
    totalItems += item.quantity;
    const priceCents = Math.round(Number(item.product.price) * 100);
    subtotalCents += priceCents * item.quantity;
  }

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    totalItems,
    subtotal: (subtotalCents / 100).toFixed(2),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

// --------------------------------------------------
// Add item to cart (Transactional & Row-locked)
// --------------------------------------------------
export const addCartItem = async (userId: string, input: AddCartItemInput) => {
  return db.transaction(async (tx) => {
    // 1. Lock product row to prevent stock race conditions
    const [product] = await tx
      .select({
        id: products.id,
        stock: products.stock,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.id, input.productId))
      .for("update");

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    if (!product.isActive) {
      throw AppError.badRequest("Product is not available");
    }

    // 2. Get/create cart using the transaction context
    const cart = await getOrCreateCart(userId, tx);

    // 3. Read current item quantity within lock
    const [existingItem] = await tx
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, input.productId),
        ),
      )
      .limit(1);

    const currentQuantity = existingItem?.quantity ?? 0;
    const newQuantity = currentQuantity + input.quantity;

    if (newQuantity > product.stock) {
      throw AppError.badRequest(
        `Cannot add ${input.quantity} item(s). Only ${product.stock} available (${currentQuantity} already in cart)`,
      );
    }

    // 4. Atomic upsert using EXCLUDED in Postgres SQL expression
    const [upsertedItem] = await tx
      .insert(cartItems)
      .values({
        cartId: cart.id,
        productId: input.productId,
        quantity: input.quantity,
      })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.productId],
        set: {
          quantity: sql`${cartItems.quantity} + EXCLUDED.quantity`,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!upsertedItem) {
      throw AppError.internal("Failed to add item to cart");
    }

    return upsertedItem;
  });
};

// --------------------------------------------------
// Update cart item quantity
// --------------------------------------------------
export const updateCartItem = async (
  userId: string,
  productId: string,
  input: UpdateCartItemInput,
) => {
  const [product] = await db
    .select({
      id: products.id,
      stock: products.stock,
      isActive: products.isActive,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw AppError.notFound("Product not found");
  }

  if (!product.isActive) {
    throw AppError.badRequest("Product is not available");
  }

  if (input.quantity > product.stock) {
    throw AppError.badRequest(
      `Only ${product.stock} unit(s) of this product are available`,
    );
  }

  const [cart] = await db
    .select({
      id: carts.id,
    })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (!cart) {
    throw AppError.notFound("Cart item not found");
  }

  const [updatedItem] = await db
    .update(cartItems)
    .set({
      quantity: input.quantity,
      updatedAt: new Date(),
    })
    .where(
      and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)),
    )
    .returning();

  if (!updatedItem) {
    throw AppError.notFound("Cart item not found");
  }

  return updatedItem;
};

// --------------------------------------------------
// Remove item from cart
// --------------------------------------------------
export const removeCartItem = async (
  userId: string,
  productId: string,
): Promise<void> => {
  const [cart] = await db
    .select({
      id: carts.id,
    })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (!cart) {
    throw AppError.notFound("Cart item not found");
  }

  const result = await db
    .delete(cartItems)
    .where(
      and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)),
    )
    .returning({
      id: cartItems.id,
    });

  if (result.length === 0) {
    throw AppError.notFound("Cart item not found");
  }
};

// --------------------------------------------------
// Clear cart
// --------------------------------------------------
export const clearCart = async (userId: string): Promise<void> => {
  const [cart] = await db
    .select({
      id: carts.id,
    })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (!cart) {
    return;
  }

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
};

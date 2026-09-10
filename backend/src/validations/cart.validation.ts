import { z } from "zod";

const cartQuantitySchema = z.coerce
  .number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(100, "Quantity cannot exceed 100");

export const addCartItemSchema = z.object({
  productId: z.uuid("Invalid product ID"),
  quantity: cartQuantitySchema,
});

export const updateCartItemSchema = z.object({
  quantity: cartQuantitySchema,
});

export const cartItemProductIdParamSchema = z.object({
  productId: z.uuid("Invalid product ID"),
});

// Inferred Types
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export type CartItemProductIdParamInput = z.infer<
  typeof cartItemProductIdParamSchema
>;

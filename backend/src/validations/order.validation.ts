import { z } from "zod";

const orderStatusValues = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const paymentStatusValues = ["pending", "paid", "failed", "refunded"] as const;

export const createOrderSchema = z.object({
  shippingName: z
    .string()
    .trim()
    .min(2, "Shipping name must be at least 2 characters")
    .max(200, "Shipping name cannot exceed 200 characters"),

  shippingPhone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s\-()]{7,30}$/,
      "Shipping phone contains invalid characters",
    )
    .refine(
      (value) => (value.match(/[0-9]/g) ?? []).length >= 7,
      "Shipping phone must contain at least 7 digits",
    ),

  shippingAddress: z
    .string()
    .trim()
    .min(5, "Shipping address must be at least 5 characters")
    .max(1000, "Shipping address cannot exceed 1000 characters"),
});

export const orderIdParamSchema = z.object({
  id: z.uuid("Invalid order ID"),
});

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(orderStatusValues).optional(),

    paymentStatus: z.enum(paymentStatusValues).optional(),
  })
  .strict()
  .refine(
    (data) => data.status !== undefined || data.paymentStatus !== undefined,
    {
      message: "At least one status field must be provided",
    },
  );

export const orderListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(20),
});

export type OrderListQueryInput = z.infer<typeof orderListQuerySchema>;
// Inferred Types

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type OrderIdParamInput = z.infer<typeof orderIdParamSchema>;

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

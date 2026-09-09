import { z } from "zod";

const productNameSchema = z
  .string()
  .trim()
  .min(2, "Product name must be at least 2 characters")
  .max(200, "Product name must not exceed 200 characters");

const productDescriptionSchema = z
  .string()
  .trim()
  .max(5000, "Product description must not exceed 5000 characters")
  .nullable()
  .optional();

const productPriceSchema = z.coerce
  .number()
  .finite("Price must be a valid number")
  .min(0, "Price cannot be negative")
  .refine(
    (value) => Number.isInteger(value * 100),
    "Price can have at most 2 decimal places",
  );

const productStockSchema = z.coerce
  .number()
  .int("Stock must be a whole number")
  .min(0, "Stock cannot be negative");

const productImageUrlSchema = z
  .string()
  .trim()
  .url("Image URL must be a valid URL")
  .max(2048, "Image URL must not exceed 2048 characters")
  .nullable()
  .optional();

const productSkuSchema = z
  .string()
  .trim()
  .min(1, "SKU is required")
  .max(100, "SKU must not exceed 100 characters")
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
    "SKU may only contain letters, numbers, dots, underscores, and hyphens",
  );

const baseProductShape = {
  name: productNameSchema,
  sku: productSkuSchema,
  description: productDescriptionSchema,
  price: productPriceSchema,
  stock: productStockSchema,
  imageUrl: productImageUrlSchema,
  isActive: z.boolean(),
};

export const createProductSchema = z.object({
  ...baseProductShape,
  stock: productStockSchema.default(0),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = z
  .object(baseProductShape)
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one product field must be provided",
  );

export const productIdParamSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

export const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    includeInactive: z.coerce.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "Minimum price cannot be greater than maximum price",
      path: ["minPrice"],
    },
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQueryInput = z.infer<typeof listProductsQuerySchema>;

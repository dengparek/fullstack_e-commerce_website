import { z } from "zod";

export const adminUserIdParamSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});

export const adminUserUpdateSchema = z
  .object({
    role: z.enum(["customer", "admin"]).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => data.role !== undefined || data.isActive !== undefined, {
    message: "At least one field must be provided for update",
  });

export type AdminUserIdParamInput = z.infer<typeof adminUserIdParamSchema>;
export type AdminUserListQueryInput = z.infer<typeof adminUserListQuerySchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;

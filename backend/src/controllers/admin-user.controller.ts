import type { Request, Response, NextFunction } from "express";

import {
  adminUserIdParamSchema,
  adminUserListQuerySchema,
  adminUserUpdateSchema,
} from "../validations/admin-user.validation";

import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
} from "../services/admin-user.service";

// Extend Request type to include authenticated admin user
// interface AuthenticatedRequest extends Request {
//   user?: {
//     id: string;
//     role: string;
//   };
// }

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "customer" | "admin"; // Changed from string to literal union
  };
}

export const handleGetAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = adminUserListQuerySchema.parse(req.query);

    const result = await getAdminUsers(query.page, query.limit, query.search);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetAdminUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = adminUserIdParamSchema.parse(req.params);

    const user = await getAdminUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateAdminUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = adminUserIdParamSchema.parse(req.params);
    const input = adminUserUpdateSchema.parse(req.body);
    const currentAdminId = req.user?.id;

    const sanitizedInput = Object.fromEntries(
      Object.entries(input).filter(([_, v]) => v !== undefined),
    );

    const user = await updateAdminUser(id, sanitizedInput, currentAdminId);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

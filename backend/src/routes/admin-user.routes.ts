import { Router } from "express";

import {
  handleGetAdminUsers,
  handleGetAdminUserById,
  handleUpdateAdminUser,
} from "../controllers/admin-user.controller";

import { authenticate, authorize } from "../middleware/auth.middleware";

const adminUserRouter = Router();

adminUserRouter.use(authenticate);
adminUserRouter.use(authorize("admin"));

adminUserRouter.get("/", handleGetAdminUsers);

adminUserRouter.get("/:id", handleGetAdminUserById);

adminUserRouter.patch("/:id", handleUpdateAdminUser);

export default adminUserRouter;

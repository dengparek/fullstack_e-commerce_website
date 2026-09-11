import { Router } from "express";

import {
  getAll,
  getById,
  updateStatus,
} from "../controllers/admin-order.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const adminOrderRouter = Router();

adminOrderRouter.use(authenticate);
adminOrderRouter.use(authorize("admin"));

adminOrderRouter.get("/", getAll);
adminOrderRouter.get("/:id", getById);
adminOrderRouter.patch("/:id/status", updateStatus);

export default adminOrderRouter;

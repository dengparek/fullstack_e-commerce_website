import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import {
  createNewOrder,
  getOrderById,
  listAllUserOrders,
} from "../controllers/order.controller";

const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post("/", createNewOrder);
orderRouter.get("/", listAllUserOrders);
orderRouter.get("/:id", getOrderById);

export default orderRouter;

import { Router } from "express";
import {
  CreateOrder,
  getAllOrders,
  getSingleOrder,
  deleteOrder,
  updateOrder,
} from "../controllers/order.controller";

const router = Router();

router.get("/", getAllOrders);

router.get("/:id", getSingleOrder);

router.post("/", CreateOrder);

router.put("/:id", updateOrder);

router.delete("/:id", deleteOrder);

export default router;

import { Router } from "express";

import {
  addItem,
  clear,
  getItem,
  removeItem,
  updateItem,
} from "../controllers/cart.controller";

import { authenticate } from "../middleware/auth.middleware";

const cartRouter = Router();

// All cart routes require authentication.
cartRouter.use(authenticate);

// Get current user's cart
cartRouter.get("/", getItem);

// Add item to cart
cartRouter.post("/items", addItem);

// Update cart item quantity
cartRouter.patch("/items/:productId", updateItem);

// Remove item from cart
cartRouter.delete("/items/:productId", removeItem);

// Clear current user's cart
cartRouter.delete("/", clear);

export default cartRouter;

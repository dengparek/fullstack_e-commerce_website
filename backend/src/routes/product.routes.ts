import { Router } from "express";

import {
  create,
  deactivate,
  getById,
  getBySlug,
  list,
  update,
} from "../controllers/product.controller";

import { authenticate, authorize } from "../middleware/auth.middleware";

const productRouter = Router();

// Public product endpoints
productRouter.get("/", list);
productRouter.get("/slug/:slug", getBySlug);
productRouter.get("/:id", getById);

// Admin product management
productRouter.post("/", authenticate, authorize("admin"), create);

productRouter.patch("/:id", authenticate, authorize("admin"), update);

productRouter.delete("/:id", authenticate, authorize("admin"), deactivate);

export default productRouter;

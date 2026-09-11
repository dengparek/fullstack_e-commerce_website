import { Router } from "express";

import {
  handlecreateCategory,
  handlegetAllCategories,
  handlegetCategoryById,
  handleupdateCategory,
  handledeactivateCategory,
  handleGetCategoryBySlug,
} from "../controllers/category.controller";

import { authenticate, authorize } from "../middleware/auth.middleware";

const categoryRouter = Router();

// Public
categoryRouter.get("/", handlegetAllCategories);
categoryRouter.get("/slug/:slug", handleGetCategoryBySlug);
categoryRouter.get("/:id", handlegetCategoryById);

// Admin only
categoryRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  handlecreateCategory,
);

categoryRouter.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  handleupdateCategory,
);

categoryRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  handledeactivateCategory,
);

export default categoryRouter;

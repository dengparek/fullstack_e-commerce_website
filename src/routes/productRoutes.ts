import { Router } from "express";
import {
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  updateProduct,
  CreateProduct,
} from "../controllers/product.controller";

const router = Router();
router.get("/", getAllProducts);

router.get("/:id", getSingleProduct);

router.post("/", CreateProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;

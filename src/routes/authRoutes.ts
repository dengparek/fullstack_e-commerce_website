import { Router } from "express";
import {
  CreateUser,
  LoginUser,
  SignOutUser,
} from "../controllers/auth.controller";

const router = Router();
router.post("/signup", CreateUser);

router.post("/login", LoginUser);

router.post("/logout", SignOutUser);

export default router;

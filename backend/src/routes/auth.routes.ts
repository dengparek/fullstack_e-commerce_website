import { Router } from "express";

import {
  login,
  register,
  refresh,
  logout,
} from "../controllers/auth.controller";
import { strictAuthRateLimiter } from "../middleware/rate-limit.middleware";

const authRouter = Router();

authRouter.post("/register", strictAuthRateLimiter, register);
authRouter.post("/login", strictAuthRateLimiter, login);
authRouter.post("/refresh", strictAuthRateLimiter, refresh);
authRouter.post("/logout", strictAuthRateLimiter, logout);

export default authRouter;

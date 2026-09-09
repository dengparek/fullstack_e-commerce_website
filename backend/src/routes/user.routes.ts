import { Router } from "express";

import { getCurrentUser } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.get("/me", authenticate, getCurrentUser);

export default userRouter;

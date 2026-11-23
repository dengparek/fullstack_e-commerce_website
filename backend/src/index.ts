import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { NODE_ENV } from "./config/env";
import authRouter from "./routes/auth.routes";
import { AppError } from "./utils/app-error";
import { errorHandler } from "./middleware/error.middleware";
import userRouter from "./routes/user.routes";
import productRouter from "./routes/product.routes";
import cartRouter from "./routes/cart.routes";
import orderRouter from "./routes/order.routes";
import adminOrderRouter from "./routes/admin-order.routes";
import categoryRouter from "./routes/category.routes";
import adminUserRouter from "./routes/admin-user.routes";
import {
  httpRequestDuration,
  httpRequestsTotal,
  metricsRegistry,
} from "./prometheus/metrics";
import { startServer } from "./server";

export const app = express();

// Security: Lock down CORS when handling cookies
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_URL,
  "https://fullstack-e-commerce-website-pi.vercel.app",
  "http://localhost:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith("-dura4.vercel.app") ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin/users", adminUserRouter);

// Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Prometheus Metrics Endpoint
app.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

// 404 Fallback Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Catch-all 404 Handler for undefined routes
app.use((_req, _res, next) => {
  next(AppError.notFound("Requested API route does not exist"));
});

// Global Error Handler (MUST be the last app.use call)
app.use(errorHandler);

app.set("trust proxy", 1);

startServer();

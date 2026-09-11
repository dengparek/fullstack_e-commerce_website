import type { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB, pool } from "./database/db";
import { NODE_ENV, PORT } from "./config/env";
import authRouter from "./routes/auth.routes";
import { AppError } from "./utils/app-error";
import { errorHandler } from "./middleware/error.middleware";
import userRouter from "./routes/user.routes";
import productRouter from "./routes/product.routes";
import cartRouter from "./routes/cart.routes";
import orderRouter from "./routes/order.routes";
import adminOrderRouter from "./routes/admin-order.routes";

export const app = express();

// Security: Lock down CORS when handling cookies
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
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

// Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
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

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });

    // Graceful Shutdown Logic
    const shutdown = async (signal: string) => {
      console.log(
        `\n${signal} received. Closing HTTP server and DB connections...`,
      );
      server.close(async () => {
        await pool.end();
        console.log("Server and database connections closed gracefully.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();

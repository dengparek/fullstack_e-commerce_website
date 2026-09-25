import type { Request, Response } from "express";
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
import categoryRouter from "./routes/category.routes";
import adminUserRouter from "./routes/admin-user.routes";
import {
  httpRequestDuration,
  httpRequestsTotal,
  metricsRegistry,
} from "./prometheus/metrics";

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

app.use((req, res, next) => {
  const isMetricsEndpoint = req.path === "/metrics";

  if (isMetricsEndpoint) {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000_000;

    // const route = req.route?.path || req.path;
    const route = req.route ? `${req.baseUrl}${req.route.path}` : "unknown";

    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      duration,
    );
  });

  next();
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin/users", adminUserRouter);

app.use((req, res, next) => {
  // Do not count Prometheus scraping its own metrics endpoint.
  if (req.path === "/metrics") {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000_000;

    const route = req.route ? `${req.baseUrl}${req.route.path}` : "unknown";

    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      duration,
    );
  });

  next();
});

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

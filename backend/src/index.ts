import type { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
// const cookieParser = require("cookie-parser");
import cookieParser from "cookie-parser";

import { connectDB, pool } from "./database/db";
import { NODE_ENV, PORT } from "./config/env";
import authRouter from "./routes/auth.routes";

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

// Global Error Handling Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message:
      NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Something went wrong",
  });
});

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

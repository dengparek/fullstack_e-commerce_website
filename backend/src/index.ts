const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
import type { Request, Response } from "express";

import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
import { urlencoded } from "express";
import { connectDB } from "./database/db";
import { NODE_ENV, PORT } from "./config/env";

export const app = express();

// missleware
app.use(urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/auth", authRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server started successfully on port:${PORT} in ${NODE_ENV} mode`,
      );

      console.log(`Server running at port:${PORT} in ${NODE_ENV} mode`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB: " + err.message);
  });

export default app;

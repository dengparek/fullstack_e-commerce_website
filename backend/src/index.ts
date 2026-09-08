const express = require("express");
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
import { urlencoded } from "express";

export const app = express();

// missleware
app.use(urlencoded({ extended: true }));
app.use(express.json());

const port = 3000;

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/auth", authRoutes);

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});

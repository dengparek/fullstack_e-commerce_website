const express = require("express");
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";

export const app = express();
const port = 3000;

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/auth", authRoutes);

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});

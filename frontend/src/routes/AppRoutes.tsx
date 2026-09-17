import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { StorefrontLayout } from "../layouts/StorefrontLayout";
import { AdminLayout } from "../layouts/adminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./adminRoute";

// Storefront pages
import { CatalogPage } from "../pages/CatalogPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartPage } from "../pages/CartPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrderConfirmationPage } from "../pages/OrderConfirmationPage";
import { CustomerOrdersPage } from "../pages/CustomerOrdersPage"; // Real page import

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public storefront routes */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<Navigate to="/products" replace />} />

        <Route path="products" element={<CatalogPage />} />

        <Route path="products/:slug" element={<ProductDetailPage />} />

        <Route path="cart" element={<CartPage />} />

        <Route path="login" element={<LoginPage />} />

        <Route path="register" element={<RegisterPage />} />

        {/* Authenticated customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route
            path="orders/:id/confirmation"
            element={<OrderConfirmationPage />}
          />
          <Route path="my-orders" element={<CustomerOrdersPage />} />
        </Route>
      </Route>

      {/* Authenticated admin routes (Placeholders ready for Module 8 implementation) */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/products" replace />} />

          {/* We will swap these out with real page imports during Module 8 */}
          {/* <Route path="products" element={<div>Admin Products Page</div>} />
          <Route path="categories" element={<div>Admin Categories Page</div>} />
          <Route path="orders" element={<div>Admin Orders Page</div>} />
          <Route path="users" element={<div>Admin Users Page</div>} /> */}
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
};

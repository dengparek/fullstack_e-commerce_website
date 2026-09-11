// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { StorefrontLayout } from "../layouts/StorefrontLayout";
import { AdminLayout } from "../layouts/adminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./adminRoute";
import { ProductDetailPage } from "../pages/ProductDetailPage";

// Public pages
const HomePage = () => (
  <div className="p-6 bg-white rounded-lg border">Home / Storefront</div>
);

const CatalogPage = () => (
  <div className="p-6 bg-white rounded-lg border">Product Catalog</div>
);

const CartPage = () => (
  <div className="p-6 bg-white rounded-lg border">Shopping Cart</div>
);

const LoginPage = () => (
  <div className="p-6 bg-white rounded-lg border">Login Form</div>
);

const RegisterPage = () => (
  <div className="p-6 bg-white rounded-lg border">Register Form</div>
);

// Customer protected pages
const CustomerOrdersPage = () => (
  <div className="p-6 bg-white rounded-lg border">My Orders</div>
);

// Admin protected pages
const AdminProductsPage = () => (
  <div className="p-6 bg-white rounded-lg border">Admin: Products</div>
);

const AdminCategoriesPage = () => (
  <div className="p-6 bg-white rounded-lg border">Admin: Categories</div>
);

const AdminOrdersPage = () => (
  <div className="p-6 bg-white rounded-lg border">Admin: Orders</div>
);

const AdminUsersPage = () => (
  <div className="p-6 bg-white rounded-lg border">Admin: Users</div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route index element={<CatalogPage />} />
        <Route path="products" element={<CatalogPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Authenticated customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="my-orders" element={<CustomerOrdersPage />} />
        </Route>
      </Route>

      {/* Authenticated admin routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

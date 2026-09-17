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

// Customer protected pages
const CustomerOrdersPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h1>

      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <p className="text-sm text-gray-500">
          Order history list will be rendered here in Module 7.
        </p>
      </div>
    </div>
  );
};

// Admin protected pages
const AdminProductsPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      Admin: Products Management
    </div>
  );
};

const AdminCategoriesPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      Admin: Categories Management
    </div>
  );
};

const AdminOrdersPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      Admin: Orders Management
    </div>
  );
};

const AdminUsersPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      Admin: Users Management
    </div>
  );
};

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

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
};

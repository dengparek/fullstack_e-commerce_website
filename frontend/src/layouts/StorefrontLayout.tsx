// src/layouts/StorefrontLayout.tsx
import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
// import { CartDrawer } from "../components/carts/CartDrawer";
import {
  ShoppingBag,
  User,
  LogOut,
  Package,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

export const StorefrontLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { openDrawer, itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  console.log("Logged In User Payload:", user);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/products"
              className="flex items-center gap-2 font-bold text-xl text-indigo-600"
            >
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
              <span> Storefront</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/products"
                className={`text-sm font-medium transition ${
                  location.pathname === "/products"
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                Catalog
              </Link>

              {isAuthenticated && (
                <Link
                  to="/my-orders"
                  className={`text-sm font-medium flex items-center gap-1.5 transition ${
                    location.pathname === "/my-orders"
                      ? "text-indigo-600 font-semibold"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
              )}

              {/* Admin Portal Shortcut for Admin Users */}
              {user?.role?.toLowerCase() === "admin" && (
                <Link
                  to="/admin/products"
                  className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-amber-100 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Cart Drawer Trigger Button */}
              <button
                type="button"
                onClick={openDrawer}
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition cursor-pointer z-10"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-6 h-6 pointer-events-none" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center pointer-events-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
              {/* Drawer rendered outside the button
              <CartDrawer /> */}

              <div className="hidden md:block h-6 w-px bg-gray-200" />

              {/* Desktop Auth Section */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{user.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void handleLogout();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 transition px-2 py-1.5 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="text-xs font-semibold text-gray-700 hover:text-indigo-600 px-3 py-2 transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-3">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              Catalog
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/my-orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  My Orders
                </Link>

                {user?.role?.toLowerCase() === "admin" && (
                  <Link
                    to="/admin/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm font-semibold text-amber-700"
                  >
                    Admin Portal
                  </Link>
                )}

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Signed in as {user?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-xs font-semibold text-red-600 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold py-2 border rounded-lg text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
      {/* Main Page Content Container */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Cart Drawer Component
      <CartDrawer /> */}
    </div>
  );
};

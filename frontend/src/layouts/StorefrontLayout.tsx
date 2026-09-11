import React from "react";
import { Link, Outlet } from "react-router-dom";
import { ShoppingBag, User, Search, ShieldCheck } from "lucide-react";

export const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900"
          >
            <span className="bg-indigo-600 text-white p-1.5 rounded-lg text-sm font-black">
              EC
            </span>

            <span>Storefront</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="search"
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              to="/products"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              Catalog
            </Link>

            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-indigo-600 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>
            © {new Date().getFullYear()} Full-Stack E-Commerce. All rights
            reserved.
          </p>

          <Link
            to="/admin"
            className="hover:underline flex items-center gap-1 text-gray-600"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { clsx } from "clsx";

export const AdminLayout: React.FC = () => {
  const navItems = [
    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: FolderTree,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 font-semibold">
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          <span>Admin Console</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center">
          <h1 className="text-sm font-semibold text-gray-700">
            Management Dashboard
          </h1>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

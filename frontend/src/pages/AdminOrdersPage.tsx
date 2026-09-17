import React, { useEffect, useState } from "react";
import { adminApi } from "../api/admin.api";
import type { Order, OrderStatus } from "../types/api";
import axios from "axios";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message || fallback;
    }
    return fallback;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getOrders();
      setOrders(res.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to fetch orders"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    try {
      setUpdatingId(orderId);
      setError(null);
      await adminApi.updateOrderStatus(orderId, newStatus);

      // Update local state directly for immediate feedback
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update order status."));
      await fetchOrders(); // Rollback local state on error
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "shipped":
      case "processing":
        return "bg-sky-100 text-sky-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
        <p className="text-sm text-slate-500">
          Monitor customer transactions and fulfill order updates.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700 uppercase">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Total Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-slate-900">
                    {order.user?.email || "Guest / Unknown"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    ${Number(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getStatusBadgeClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      disabled={updatingId === order.id}
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as OrderStatus,
                        )
                      }
                      className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-slate-900 disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

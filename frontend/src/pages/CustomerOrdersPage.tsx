import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/orders.api";
import type { Order } from "../types/api";

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersApi.getMyOrders();
        const orderList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setOrders(orderList);
        setOrders([]);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md mb-6">
          {error}
        </div>
      )}

      {Array.isArray(orders) && orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-500 mb-4">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/products"
            className="inline-block bg-slate-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(orders) &&
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      #{order.id}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize bg-slate-100 text-slate-800">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div>
                    <span className="text-xs text-slate-500 block">Total</span>
                    <span className="text-sm font-bold text-slate-900">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order.id}/confirmation`}
                    className="text-xs font-medium text-slate-900 border border-slate-300 rounded px-3 py-1.5 hover:bg-slate-50 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

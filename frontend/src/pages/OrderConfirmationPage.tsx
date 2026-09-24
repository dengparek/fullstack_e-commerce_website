import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../api/orders.api";
import type { Order } from "../types/api";
import axios from "axios";
import { formatCurrency } from "../utils/formatters";

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await ordersApi.getOrderById(id);
        setOrder(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "Failed to load order details.",
          );
        } else {
          setError("Failed to load order details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Order Not Found
        </h2>
        <p className="text-slate-600 mb-6">
          {error || "Unable to locate order summary."}
        </p>
        <Link
          to="/products"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-md text-sm font-medium"
        >
          Return to Store
        </Link>
      </div>
    );
  }
  let shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  try {
    shippingAddress = JSON.parse(order.shippingAddress);
  } catch {
    shippingAddress = {
      street: order.shippingAddress,
      city: "",
      postalCode: "",
      country: "",
    };
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm mb-8">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Thank you for your order!
        </h1>
        <p className="text-sm text-slate-600">
          Order ID:{" "}
          <span className="font-mono font-semibold text-slate-800">
            #{order.id}
          </span>
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
          Order Details
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 block text-xs">Status</span>
            <span className="font-medium capitalize text-slate-900">
              {order.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Date</span>
            <span className="font-medium text-slate-900">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div>
          <span className="text-slate-500 block text-xs mb-2">
            Shipping Address
          </span>

          <div className="text-sm text-slate-800 space-y-1">
            <p>
              <span className="font-medium">Name:</span> {order.shippingName}
            </p>

            <p>
              <span className="font-medium">Phone:</span> {order.shippingPhone}
            </p>

            <p>
              <span className="font-medium">Street:</span>{" "}
              {shippingAddress.street}
            </p>

            <p>
              <span className="font-medium">City:</span> {shippingAddress.city}
            </p>

            <p>
              <span className="font-medium">Postal Code:</span>{" "}
              {shippingAddress.postalCode}
            </p>

            <p>
              <span className="font-medium">Country:</span>{" "}
              {shippingAddress.country}
            </p>
          </div>
        </div>
        <div>
          <span className="text-slate-500 block text-xs mb-2">
            Items Purchased
          </span>
          <div className="divide-y divide-slate-200 border-t border-b border-slate-200 py-2">
            {order.items?.length ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-2 flex justify-between text-sm"
                >
                  <span className="text-slate-800">
                    {item.productName} (x{item.quantity})
                  </span>

                  <span className="font-medium text-slate-900">
                    {formatCurrency(Number(item.subtotal))}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-slate-500">
                No order items found.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between text-base font-bold text-slate-900 pt-2">
          <span>Total Paid</span>
          <span>${formatCurrency(Number(order.totalAmount))}</span>
        </div>
      </div>

      <div className="mt-8 text-center space-x-4">
        <Link
          to="/my-orders"
          className="bg-slate-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition"
        >
          View Order History
        </Link>
        <Link
          to="/products"
          className="text-slate-600 hover:text-slate-900 text-sm font-medium underline"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

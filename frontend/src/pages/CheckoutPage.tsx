import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersApi } from "../api/orders.api";
import axios from "axios";
import type { CreateOrderPayload } from "../types/api";
export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    shippingPhone: "",
    shippingName: "",
    postalCode: "",

    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;

    const cleanedAddress = {
      street: shippingAddress.street.trim(),
      shippingName: shippingAddress.shippingName.trim(),
      shippingPhone: shippingAddress.shippingPhone,
      city: shippingAddress.city.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      country: shippingAddress.country.trim(),
    };

    if (Object.values(cleanedAddress).some((value) => !value)) {
      setError("Please complete all shipping address fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderPayload: CreateOrderPayload = {
        shippingAddress: JSON.stringify(shippingAddress),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.product.price),
        })),
      };

      const newOrder = await ordersApi.createOrder(orderPayload);
      clearCart();
      navigate(`/orders/${newOrder.id}/confirmation`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to place order. Please try again.",
        );
      } else {
        setError("Failed to place order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-slate-600 mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Shipping Form */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Shipping Address
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="street"
              required
              value={shippingAddress.street}
              onChange={handleInputChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                required
                value={shippingAddress.city}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                required
                value={shippingAddress.postalCode}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="shippingPhone"
                required
                value={shippingAddress.shippingPhone}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Shipping Name
              </label>
              <input
                type="text"
                name="shippingName"
                required
                value={shippingAddress.shippingName}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              required
              value={shippingAddress.country}
              onChange={handleInputChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 bg-slate-50 p-6 rounded-lg border border-slate-200 h-fit space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Order Summary
          </h2>

          <div className="divide-y divide-slate-200 max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="py-2 flex justify-between text-sm"
              >
                <span className="text-slate-700">
                  {item.product.name} (x{item.quantity})
                </span>
                <span className="font-medium text-slate-900">
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-md font-medium text-sm hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {loading ? "Processing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

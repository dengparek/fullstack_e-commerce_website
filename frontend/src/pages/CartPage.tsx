// src/pages/CartPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

export const CartPage: React.FC = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4 stroke-1" />
        <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          Looks like you haven't added any products to your shopping cart yet.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {itemCount} items in your cart
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-xs"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-8 h-8 stroke-1" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 text-sm transition truncate block"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatCurrency(item.product.price)} each
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        Math.min(item.product.stock, item.quantity + 1),
                      )
                    }
                    disabled={item.quantity >= item.product.stock}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit space-y-6 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="text-emerald-600 font-medium">
                Calculated at Checkout
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="text-gray-500">Calculated at Checkout</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-xl font-extrabold text-indigo-600">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm text-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

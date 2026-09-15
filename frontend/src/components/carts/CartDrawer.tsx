// src/components/cart/CartDrawer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatters";

export const CartDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    items,
    itemCount,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
                <ShoppingBag className="w-12 h-12 stroke-1 text-gray-300 mb-3" />
                <p className="text-base font-medium text-gray-800">
                  Your cart is empty
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="mt-6 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                >
                  Continue Shopping &rarr;
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 items-center justify-between"
                >
                  {/* Item Thumbnail */}
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-6 h-6 stroke-1" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs font-bold text-gray-700 mt-0.5">
                      {formatCurrency(item.product.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          className="p-1 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Item */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Callout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Taxes and shipping calculated during checkout.
              </p>

              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center text-xs font-semibold text-gray-600 hover:text-indigo-600 py-2 transition"
                >
                  View Full Cart Page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

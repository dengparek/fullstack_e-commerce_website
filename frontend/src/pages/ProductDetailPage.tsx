// src/pages/ProductDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productsApi } from "../api/products.api";
import type { Product } from "../types/api";
import {
  ShoppingBag,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { parseApiError } from "../api/client";
import { cartApi } from "../api/cart.api";

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await productsApi.getProductBySlug(slug);
        if (isMounted) {
          setProduct(response.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(parseApiError(err));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;

    setIsAddingToCart(true);

    try {
      await cartApi.addItem({
        productId: product.id,
        quantity,
      });
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-sm">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {error ||
            "The product you're looking for doesn't exist or was removed."}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Left: Product Image */}
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <ShoppingBag className="w-16 h-16 stroke-1 mb-2" />
              <span className="text-xs">No image uploaded</span>
            </div>
          )}

          {product.category && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              {product.category.name}
            </span>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-extrabold text-gray-900">
                {formattedPrice}
              </span>
              {isOutOfStock ? (
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description ||
                  "No description provided for this product."}
              </p>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-700">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition shadow-md"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>
                {isOutOfStock
                  ? "Currently Unavailable"
                  : isAddingToCart
                    ? "Adding..."
                    : "Add to Cart"}
              </span>
            </button>

            {/* Feature Callouts */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-500">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

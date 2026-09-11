// src/components/products/ProductCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Tag } from "lucide-react";
import type { ProductCardProps } from "../../types/api";

export const STORE_CURRENCY = "SSP";
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: STORE_CURRENCY,
  }).format(product.price);

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      {/* Image Container */}
      <Link
        to={`/products/${product.slug}`}
        className="relative aspect-square bg-gray-100 overflow-hidden block"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <ShoppingBag className="w-10 h-10 mb-1 stroke-1" />
            <span className="text-xs">No image available</span>
          </div>
        )}

        {/* Category Tag Overlay */}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-600" />
            {product.category.name}
          </span>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
            Out of Stock
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/products/${product.slug}`}
            className="font-semibold text-gray-900 group-hover:text-indigo-600 transition line-clamp-1"
          >
            {product.name}
          </Link>
          {product.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">Price</span>
            <span className="text-lg font-bold text-gray-900">
              {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

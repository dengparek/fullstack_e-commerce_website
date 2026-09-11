// src/pages/CatalogPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  PackageX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productsApi } from "../api/products.api";
import type {
  Product,
  PaginatedResult,
  ProductQueryParams,
} from "../types/api";
import { ProductCard } from "../components/products/ProductCard";
import { CategoryFilter } from "../components/categories/CategoryFilter";
import { parseApiError } from "../api/client";

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract params from URL
  const currentCategory = searchParams.get("category") || undefined;
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSort = searchParams.get("sort") || "createdAt:desc";

  // State
  const [searchInputValue, setSearchInputValue] = useState(currentSearch);
  const [data, setData] = useState<PaginatedResult<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync internal search input state with URL changes
  useEffect(() => {
    setSearchInputValue(currentSearch);
  }, [currentSearch]);

  // Load products from backend
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sortBy, order] = currentSort.split(":") as [
        ProductQueryParams["sortBy"],
        ProductQueryParams["order"],
      ];

      const response = await productsApi.getProducts({
        page: currentPage,
        limit: 12,
        categoryId: currentCategory,
        search: currentSearch || undefined,
        sortBy,
        order,
      });
      setData(response.data);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentCategory, currentSearch, currentSort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Helper to update URL params cleanly
  const updateParams = (newParams: Record<string, string | undefined>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });
    setSearchParams(updated);
  };
  // Submit search and update URL
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInputValue, page: "1" });
  };

  const handleCategorySelect = (categoryId?: string) => {
    updateParams({ category: categoryId, page: "1" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ sort: e.target.value, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Discover our premium collection of curated items
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex gap-2 w-full md:w-80"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-200">
        <CategoryFilter
          selectedCategoryId={currentCategory}
          onSelectCategory={handleCategorySelect}
        />

        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 py-1.5 pl-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="name:asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Main Grid State Rendering */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Fetching products...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          <p className="font-semibold text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchProducts}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center">
          <PackageX className="w-12 h-12 stroke-1 text-gray-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-800">
            No products found
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            We couldn't find any products matching your selected criteria. Try
            adjusting your search query or filters.
          </p>
        </div>
      ) : (
        <>
          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(prod) => console.log("Add to cart:", prod)}
              />
            ))}
          </div>

          {/* Pagination Bar */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <span className="text-xs text-gray-500">
                Page <span className="font-medium">{data.page}</span> of{" "}
                <span className="font-medium">{data.totalPages}</span> (
                {data.total} total items)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= data.totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

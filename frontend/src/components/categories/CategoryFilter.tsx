// src/components/categories/CategoryFilter.tsx
import React, { useEffect, useState } from "react";
import { categoriesApi } from "../../api/categories.api";
import type { Category } from "../../types/api";
import { clsx } from "clsx";

interface CategoryFilterProps {
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getCategories();
        if (isMounted && response.data) {
          setCategories(response.data.filter((category) => category.isActive));
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto py-2 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-gray-200 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelectCategory(undefined)}
        className={clsx(
          "px-4 py-1.5 rounded-full text-xs font-medium transition shrink-0 border",
          !selectedCategoryId
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
        )}
      >
        All Products
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            type="button"
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-xs font-medium transition shrink-0 border",
              isSelected
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

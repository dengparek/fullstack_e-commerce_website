import React, { useEffect, useState } from "react";
import { categoriesApi } from "../api/categories.api";
import type { Category } from "../types/api";
import axios from "axios";
import { adminApi } from "../api/admin.api";

// Define the creation payload type matching your backend requirements
export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
}

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CategoryPayload>({
    name: "",
    slug: "",
    description: "",
  });

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message || fallback;
    }
    return fallback;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesRes = await categoriesApi.getCategories();

      // Handle both raw array and wrapped data responses
      const catData = Array.isArray(categoriesRes)
        ? categoriesRes
        : categoriesRes.data || [];

      setCategories(catData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to fetch categories"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-generate slug from name when adding a new category
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: nameValue,
      // Only auto-slugify if user is creating a new category or hasn't manually edited slug heavily
      slug: !editingCategory
        ? nameValue
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
        : prev.slug,
    }));
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (editingCategory) {
        // Assuming update category endpoint exists on adminApi or categoriesApi
        await adminApi.updateCategory(editingCategory.id, formData);
      } else {
        await adminApi.createCategory(formData);
      }

      handleCloseModal();
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Operation failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    try {
      await adminApi.deactivateCategory(id);
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete category."));
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories Management
          </h1>
          <p className="text-sm text-slate-500">
            Organize product groups and catalog navigation structures.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition"
        >
          + Add Category
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700 uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {category.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="text-xs font-medium text-slate-700 hover:text-slate-900 underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800 underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3
                id="category-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-slate-900"
                  placeholder="e.g. Electronics"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-slate-900"
                  placeholder="e.g. electronics"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-slate-900"
                  placeholder="Optional description for search or catalog layout..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

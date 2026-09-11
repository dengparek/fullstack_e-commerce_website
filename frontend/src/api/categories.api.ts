import { apiClient } from "./client";
import type { ApiResponse, Category } from "../types/api";

export const categoriesApi = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response =
      await apiClient.get<ApiResponse<Category[]>>("/api/categories");
    return response.data;
  },

  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    const response = await apiClient.get<ApiResponse<Category>>(
      `/api/categories/slug/${slug}`,
    );
    return response.data;
  },
};

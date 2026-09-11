import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResult,
  Product,
  ProductQueryParams,
} from "../types/api";

export const productsApi = {
  async getProducts(
    params?: ProductQueryParams,
  ): Promise<ApiResponse<PaginatedResult<Product>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResult<Product>>>(
      "/api/products",
      { params },
    );
    return response.data;
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/api/products/slug/${slug}`,
    );
    return response.data;
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/api/products/${id}`,
    );
    return response.data;
  },
};

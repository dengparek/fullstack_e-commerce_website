import type { ProductPayload } from "../types/api";
import { apiClient } from "./client";

export const adminApi = {
  async createProduct(payload: ProductPayload) {
    const response = await apiClient.post("/api/v1/product", payload);
    return response.data;
  },

  async updateProduct(id: string, payload: Partial<ProductPayload>) {
    const response = await apiClient.patch(`/api/v1/product/${id}`, payload);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/api/v1/product${id}`);
    return response.data;
  },
};

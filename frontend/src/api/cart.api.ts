import { apiClient } from "./client";
import type {
  AddToCartPayload,
  ApiResponse,
  Cart,
  UpdateCartItemPayload,
} from "../types/api";

export const cartApi = {
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await apiClient.get<ApiResponse<Cart>>("/api/cart");

    return response.data;
  },

  async addItem(payload: AddToCartPayload): Promise<ApiResponse<Cart>> {
    const response = await apiClient.post<ApiResponse<Cart>>(
      "/api/cart/items",
      payload,
    );

    return response.data;
  },

  async updateQuantity(
    itemId: string,
    payload: UpdateCartItemPayload,
  ): Promise<ApiResponse<Cart>> {
    const response = await apiClient.patch<ApiResponse<Cart>>(
      `/api/cart/items/${itemId}`,
      payload,
    );

    return response.data;
  },

  async removeItem(itemId: string): Promise<ApiResponse<Cart>> {
    const response = await apiClient.delete<ApiResponse<Cart>>(
      `/api/cart/items/${itemId}`,
    );

    return response.data;
  },

  async clearCart(): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>("/api/cart");

    return response.data;
  },
};

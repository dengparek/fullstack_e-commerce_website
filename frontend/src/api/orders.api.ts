import { apiClient } from "./client";
import type { ApiResponse, CreateOrderPayload, Order } from "../types/api";

export const ordersApi = {
  async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponse<Order>>(
      "/api/orders",
      payload,
    );
    return response.data;
  },

  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    const response = await apiClient.get<ApiResponse<Order[]>>("/api/orders");
    return response.data;
  },

  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponse<Order>>(
      `/api/orders/${orderId}`,
    );
    return response.data;
  },
};

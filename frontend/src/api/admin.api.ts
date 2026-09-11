import { apiClient } from "./client";
import type {
  AdminUserQueryParams,
  ApiResponse,
  Category,
  CategoryPayload,
  Order,
  OrderStatus,
  PaginatedResult,
  Product,
  ProductPayload,
  User,
} from "../types/api";

export const adminApi = {
  // Admin Products
  async createProduct(payload: ProductPayload): Promise<ApiResponse<Product>> {
    const response = await apiClient.post<ApiResponse<Product>>(
      "/api/products",
      payload,
    );

    return response.data;
  },

  async updateProduct(
    id: string,
    payload: Partial<ProductPayload>,
  ): Promise<ApiResponse<Product>> {
    const response = await apiClient.patch<ApiResponse<Product>>(
      `/api/products/${id}`,
      payload,
    );

    return response.data;
  },

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/api/products/${id}`,
    );

    return response.data;
  },

  // Admin Categories
  async createCategory(
    payload: CategoryPayload,
  ): Promise<ApiResponse<Category>> {
    const response = await apiClient.post<ApiResponse<Category>>(
      "/api/categories",
      payload,
    );

    return response.data;
  },

  async updateCategory(
    id: string,
    payload: CategoryPayload,
  ): Promise<ApiResponse<Category>> {
    const response = await apiClient.patch<ApiResponse<Category>>(
      `/api/categories/${id}`,
      payload,
    );

    return response.data;
  },

  async deactivateCategory(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/api/categories/${id}`,
    );

    return response.data;
  },

  // Admin Orders
  async getOrders(): Promise<ApiResponse<Order[]>> {
    const response =
      await apiClient.get<ApiResponse<Order[]>>("/api/admin/orders");

    return response.data;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<ApiResponse<Order>> {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/api/admin/orders/${orderId}/status`,
      { status },
    );

    return response.data;
  },

  // Admin Users
  async getUsers(
    params?: AdminUserQueryParams,
  ): Promise<ApiResponse<PaginatedResult<User>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResult<User>>>(
      "/api/admin/users",
      { params },
    );

    return response.data;
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(
      `/api/admin/users/${id}`,
    );

    return response.data;
  },

  async updateUserRole(
    id: string,
    role: "customer" | "admin",
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(
      `/api/admin/users/${id}`,
      { role },
    );

    return response.data;
  },

  async toggleUserActiveStatus(
    id: string,
    isActive: boolean,
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(
      `/api/admin/users/${id}`,
      { isActive },
    );

    return response.data;
  },
};

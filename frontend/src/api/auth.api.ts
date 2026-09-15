import axios, { type AxiosRequestConfig } from "axios";
import { apiClient, setAccessToken } from "./client";
import type {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authApi = {
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/register",
      payload,
    );

    if (response.data.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }

    return response.data;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/login",
      payload,
    );

    return response.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response =
        await apiClient.post<ApiResponse<null>>("/api/auth/logout");

      return response.data;
    } finally {
      setAccessToken(null);
    }
  },

  async getCurrentUser(
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(
      "/api/users/me",
      config,
    );

    return response.data;
  },

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    // FIX: Use vanilla axios instance to bypass apiClient interceptors completely
    const response = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true },
    );

    if (response.data.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }

    return response.data;
  },
};

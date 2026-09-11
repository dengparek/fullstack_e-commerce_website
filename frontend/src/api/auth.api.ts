import { apiClient, setAccessToken } from "./client";
import type {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/api";

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

    if (response.data.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }

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

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>("/api/users/me");

    return response.data;
  },

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const response =
      await apiClient.post<ApiResponse<{ accessToken: string }>>(
        "/api/auth/refresh",
      );

    if (response.data.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }

    return response.data;
  },
};

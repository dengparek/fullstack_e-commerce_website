import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import type { ApiErrorResponse } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Access token is intentionally kept in memory only.
let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

// Prevent multiple requests from refreshing the token simultaneously.
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: {
          accessToken: string;
        };
      }>("/api/auth/refresh");

      const newAccessToken = response.data.data.accessToken;

      setAccessToken(newAccessToken);

      return newAccessToken;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Attach access token to outgoing requests.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle expired access tokens.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    const isRefreshRequest = originalRequest.url?.includes("/api/auth/refresh");

    const isLoginRequest = originalRequest.url?.includes("/api/auth/login");

    const isRegisterRequest =
      originalRequest.url?.includes("/api/auth/register");

    // Only attempt refresh for authenticated requests.
    if (
      status !== 401 ||
      isRefreshRequest ||
      isLoginRequest ||
      isRegisterRequest
    ) {
      return Promise.reject(error);
    }

    // Prevent the same request from being retried repeatedly.
    if (
      (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })
        ._retry
    ) {
      setAccessToken(null);
      return Promise.reject(error);
    }

    (
      originalRequest as InternalAxiosRequestConfig & { _retry?: boolean }
    )._retry = true;

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      setAccessToken(null);
      return Promise.reject(error);
    }

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    }

    return apiClient(originalRequest);
  },
);

// Convert backend errors into clean frontend messages.
export const parseApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data as ApiErrorResponse | undefined;

    if (serverError?.message) {
      return serverError.message;
    }

    if (error.response?.status === 401) {
      return "Unauthorized access. Please log in.";
    }

    if (error.response?.status === 403) {
      return "Access forbidden. You do not have permission.";
    }

    if (error.message) {
      return error.message;
    }
  }

  return "An unexpected error occurred. Please try again.";
};

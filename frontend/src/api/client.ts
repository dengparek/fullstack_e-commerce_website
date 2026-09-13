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

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

let refreshPromise: Promise<string | null> | null = null;

/**
 * Executes token refresh using vanilla axios to prevent
 * the refresh call itself from running through apiClient interceptors.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // FIX 1: Use plain `axios` instead of `apiClient` so refresh
      // calls never trigger the apiClient interceptors recursively.
      const response = await axios.post<{
        success: boolean;
        message: string;
        data: {
          accessToken: string;
        };
      }>(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });

      const newAccessToken = response.data.data.accessToken;

      if (!newAccessToken) {
        throw new Error("Refresh response did not contain an access token");
      }
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

// Attach access token to outgoing requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle expired access tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = originalRequest.url || "";

    // FIX 2: Explicitly identify auth endpoint requests to bypass retries completely
    const isAuthRequest =
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout");

    // Do NOT attempt token refresh if:
    // 1. The status is not 401
    // 2. The request was already an Auth route (Login, Register, Refresh)
    // 3. The request has already been retried once
    if (status !== 401 || isAuthRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark request as retried
    originalRequest._retry = true;

    // Attempt to acquire a new token
    const newAccessToken = await refreshAccessToken();

    // If refresh fails, reject immediately so callers (like ProductDetailPage)
    // can catch the failure in their try/catch/finally block.
    if (!newAccessToken) {
      return Promise.reject(error);
    }

    // Retry original request with new token
    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    }

    return apiClient(originalRequest);
  },
);

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

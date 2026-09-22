import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authApi } from "../api/auth.api";
import { setAccessToken } from "../api/client";
import type {
  AuthContextValue,
  AuthProviderProps,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/api";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Add inside AuthProvider component, right before refreshSession:
  const extractUserData = (data: unknown): User | null => {
    if (!data || typeof data !== "object") return null;
    const payload = data as Record<string, unknown>;

    if (payload.user && typeof payload.user === "object") {
      return payload.user as User;
    }
    if (
      payload.data &&
      typeof payload.data === "object" &&
      (payload.data as Record<string, unknown>).user
    ) {
      return (payload.data as Record<string, unknown>).user as User;
    }
    if ("id" in payload || "email" in payload) {
      return payload as unknown as User;
    }
    return null;
  };
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);

  const [accessToken, setToken] = useState<string | null>(null);

  const updateAccessToken = useCallback((token: string | null) => {
    setToken(token);
    setAccessToken(token);
  }, []);

  const refreshSession = useCallback(async (): Promise<User | null> => {
    try {
      const refreshResponse = await authApi.refreshToken();
      const accessToken = refreshResponse.data?.accessToken;

      if (!accessToken) {
        updateAccessToken(accessToken);
        setUser(null);
        return null;
      }

      // FIX 1: Set token in memory FIRST so getCurrentUser carries the Bearer header
      // setAccessToken(accessToken);

      const userResponse = await authApi.getCurrentUser();
      const userData = extractUserData(userResponse.data);

      if (!userData) {
        updateAccessToken(null);
        setUser(null);
        return null;
      }
      setUser(userData);
      return userData;
    } catch {
      updateAccessToken(null);
      setUser(null);
      return null;
    }
  }, [updateAccessToken]);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const response = await authApi.login(payload);
    const accessToken = response.data?.accessToken;

    if (!accessToken) {
      throw new Error("Login succeeded but no access token was returned.");
    }

    updateAccessToken(accessToken);

    const userResponse = await authApi.getCurrentUser();

    const userData = extractUserData(userResponse.data);

    if (!userData) {
      updateAccessToken(null);
      throw new Error("Unable to retrieve the logged-in user.");
    }

    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const response = await authApi.register(payload);
      const accessToken = response.data?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Registration succeeded but no access token was returned.",
        );
      }

      setAccessToken(accessToken);
      const userResponse = await authApi.getCurrentUser({
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // const userResponse = await authApi.getCurrentUser();

      const userData = extractUserData(userResponse.data);
      if (!userData) {
        updateAccessToken(null);
        throw new Error("Unable to retrieve the logged-in user.");
      }
      setUser(userData);
      return userData;
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      updateAccessToken(null);
      setUser(null);
    }
  }, []);

  // FIX 2: Single, clean initialization effect with ref guard
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const initializeAuth = async () => {
      try {
        await refreshSession();
      } finally {
        // ALWAYS unblock the app loading state
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user && accessToken),
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, isLoading, login, register, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};

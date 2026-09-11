import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApi } from "../api/auth.api";
import { getAccessToken, setAccessToken } from "../api/client";
import type { LoginPayload, RegisterPayload, User } from "../types/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<User | null> => {
    try {
      const refreshResponse = await authApi.refreshToken();

      const accessToken = refreshResponse.data?.accessToken;

      if (!accessToken) {
        setAccessToken(null);
        setUser(null);
        return null;
      }

      const userResponse = await authApi.getCurrentUser();

      if (!userResponse.data) {
        setAccessToken(null);
        setUser(null);
        return null;
      }

      setUser(userResponse.data);

      return userResponse.data;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const response = await authApi.login(payload);

    const accessToken = response.data?.accessToken;

    if (!accessToken) {
      throw new Error("Login succeeded but no access token was returned.");
    }

    const userResponse = await authApi.getCurrentUser();

    if (!userResponse.data) {
      setAccessToken(null);
      throw new Error("Unable to retrieve the logged-in user.");
    }

    setUser(userResponse.data);

    return userResponse.data;
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

      const userResponse = await authApi.getCurrentUser();

      if (!userResponse.data) {
        setAccessToken(null);
        throw new Error("Unable to retrieve the registered user.");
      }

      setUser(userResponse.data);

      return userResponse.data;
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        await refreshSession();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user && getAccessToken()),
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

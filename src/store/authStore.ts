// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AxiosError } from "axios";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: number;
  fio?: string;
  username?: string;
  telefon?: string;
  telegram_id?: string;
  lavozim?: string;
  lavozim_display?: string;
  permissions?: Record<string, boolean>;
  boshqarma?: string;
  is_active?: boolean;
  is_staff?: boolean;
  date_joined?: string;
  last_login?: string | null;
};

type LoginPayload = {
  username: string;
  password: string;
};

type RegisterPayload = Record<string, unknown>;

type AuthResponse = {
  user: AuthUser;
  access?: string;
  refresh?: string;
  token?: string;
};

type MeResponse = AuthUser | { user: AuthUser };

type ApiErrorBody = {
  message?: string;
  detail?: string;
};

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refreshTokenValue: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<AuthActionResult>;
  register: (userData: RegisterPayload) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  updateUser: (userData: Partial<AuthUser>) => void;
  clearSession: (error?: string | null) => void;
  clearError: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.detail ??
    axiosError.message ??
    fallback
  );
};

const extractToken = (data: AuthResponse): string => {
  const token = data.access ?? data.token;
  if (!token) throw new Error("Authentication token missing in response");
  return token;
};

const extractRefreshToken = (data: AuthResponse): string | null =>
  data.refresh ?? null;

const normalizeMeResponse = (data: MeResponse): AuthUser =>
  "user" in data ? data.user : data;

const persistAuthToken = (token: string) =>
  localStorage.setItem("auth_token", token);

const persistRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("refresh_token", token);
  } else {
    localStorage.removeItem("refresh_token");
  }
};

const clearAuthTokens = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshTokenValue: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<AuthResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials,
          );
          const token = extractToken(data);
          const refreshTokenValue = extractRefreshToken(data);

          persistAuthToken(token);
          persistRefreshToken(refreshTokenValue);
          set({
            user: data.user,
            token,
            refreshTokenValue,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message = getErrorMessage(error, "Login failed");
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            userData,
          );
          const token = data.access ?? data.token ?? null;
          const refreshTokenValue = extractRefreshToken(data);

          if (token) persistAuthToken(token);
          persistRefreshToken(refreshTokenValue);

          set({
            user: token ? data.user : null,
            token,
            refreshTokenValue,
            isAuthenticated: Boolean(token),
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message = getErrorMessage(error, "Registration failed");
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        const refreshTokenValue =
          get().refreshTokenValue ?? localStorage.getItem("refresh_token");

        try {
          await api.post(API_ENDPOINTS.AUTH.LOGOUT, refreshTokenValue ? {
            refresh: refreshTokenValue,
          } : undefined);
        } catch (error) {
          console.error("[Auth] Logout endpoint error:", error);
        } finally {
          get().clearSession();
        }
      },

      fetchUser: async () => {
        const token = get().token ?? localStorage.getItem("auth_token");

        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get<MeResponse>(
            API_ENDPOINTS.USERS.PROFILE,
          );
          const user = normalizeMeResponse(data);

          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          get().clearSession(getErrorMessage(error, "Failed to fetch user"));
        }
      },

      refreshAccessToken: async () => {
        const refreshTokenValue =
          get().refreshTokenValue ?? localStorage.getItem("refresh_token");

        if (!refreshTokenValue) {
          return null;
        }

        const { data } = await api.post<{ access: string }>(
          API_ENDPOINTS.AUTH.REFRESH,
          {
            refresh: refreshTokenValue,
          },
        );

        persistAuthToken(data.access);
        set({ token: data.access, isAuthenticated: true });
        return data.access;
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      clearSession: (error = null) => {
        clearAuthTokens();
        set({
          user: null,
          token: null,
          refreshTokenValue: null,
          isAuthenticated: false,
          isLoading: false,
          error,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshTokenValue: state.refreshTokenValue,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

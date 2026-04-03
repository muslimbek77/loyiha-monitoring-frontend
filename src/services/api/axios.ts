// src/services/api/axios.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

const AUTH_ENDPOINTS = [
  "/auth/login/",
  "/auth/logout/",
  "/auth/register/",
  "/auth/token/refresh/",
];

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const normalizeRelativeUrl = (url?: string) => {
  if (!url || /^https?:\/\//i.test(url)) return url;

  const [path, query] = url.split("?");
  const normalizedPath = `/${path}`.replace(/\/{2,}/g, "/");

  return query === undefined ? normalizedPath : `${normalizedPath}?${query}`;
};

const isAuthEndpoint = (url?: string) =>
  AUTH_ENDPOINTS.some((endpoint) => normalizeRelativeUrl(url)?.startsWith(endpoint));

const api = axios.create({
  baseURL: normalizeBaseUrl(
    import.meta.env.VITE_APP_BASE_URL ??
      "https://loyiha.kuprikqurilish.uz/api/v1",
  ),
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Token refresh state ───────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error),
  );
  failedQueue = [];
};

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.url = normalizeRelativeUrl(config.url);

    const token =
      useAuthStore.getState().token ?? localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const { refreshAccessToken, clearSession } = useAuthStore.getState();

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return api(originalRequest);
          })
          .catch(Promise.reject.bind(Promise));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          throw new Error("Access token refresh failed");
        }

        processQueue(null, newToken);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      console.warn("[API] Forbidden — insufficient permissions.");
    }

    if (error.response?.status && error.response.status >= 500) {
      console.error("[API] Server error:", error.response.status);
    }

    return Promise.reject(error);
  },
);

function redirectToLogin() {
  if (window.location.pathname !== "/auth/login") {
    window.location.href = "/auth/login";
  }
}

export default api;

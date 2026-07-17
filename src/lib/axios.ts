import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { PROXY_BASE_URL, ROUTES } from "@/lib/constants";
import type { ApiResponse } from "@/types/response.types";

/**
 * All traffic goes through our own Route Handler (/api/proxy), which reads the
 * httpOnly cookie and attaches `Authorization: Bearer …` on the server.
 * The JWT therefore never reaches client-side JavaScript.
 */

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: string[];

  constructor(message: string, statusCode: number, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const api = axios.create({
  baseURL: PROXY_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Same-origin request — the httpOnly cookie rides along automatically.
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Let the browser set the multipart boundary itself.
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  return config;
});

/**
 * Unwraps `{ data, errors, statusCode }` so callers get `T` directly.
 *
 * `errors` is NOT a reliable failure signal: some endpoints answer with
 * `{ errors: ["success"], statusCode: 200 }` (e.g. update-user-image-profile).
 * Only the statusCode decides.
 */
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const payload = response.data;

    if (payload && typeof payload === "object" && "data" in payload) {
      if (payload.statusCode >= 400) {
        throw new ApiError(payload.errors?.[0] ?? "", payload.statusCode, payload.errors ?? []);
      }
      response.data = payload.data as never;
    }

    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;

    if (status === 401) {
      handleUnauthorized();
    }

    const errors = error.response?.data?.errors ?? null;
    // `error.message` is axios's own hardcoded English text (e.g. "Network Error") for
    // connection failures with no server response — never localized, so it must not
    // leak into the UI. Only the backend's own `errors[]` is a safe message source;
    // everything else falls through to the caller's `error.message || t("network")`.
    const message = errors?.[0] ?? "";

    return Promise.reject(new ApiError(message, status, errors ?? []));
  },
);

function handleUnauthorized(): void {
  if (typeof window === "undefined") return;

  // Clears the httpOnly cookie server-side, then bounces to the login screen.
  void fetch("/api/auth/session", { method: "DELETE" }).finally(() => {
    if (!window.location.pathname.includes(ROUTES.login)) {
      window.location.href = ROUTES.login;
    }
  });
}

/** Convenience helpers so services stay one-liners. */
export const http = {
  get: async <T>(url: string, params?: unknown): Promise<T> => {
    const res = await api.get<T>(url, { params: params as never });
    return res.data;
  },
  post: async <T>(url: string, body?: unknown, params?: unknown): Promise<T> => {
    const res = await api.post<T>(url, body, { params: params as never });
    return res.data;
  },
  put: async <T>(url: string, body?: unknown, params?: unknown): Promise<T> => {
    const res = await api.put<T>(url, body, { params: params as never });
    return res.data;
  },
  delete: async <T>(url: string, params?: unknown): Promise<T> => {
    const res = await api.delete<T>(url, { params: params as never });
    return res.data;
  },
};

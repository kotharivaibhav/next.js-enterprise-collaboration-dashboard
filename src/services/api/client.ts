import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { parseApiError } from "@/services/api/errors";

const API_PROXY_BASE = "/api/backend";

export const apiClient = axios.create({
  baseURL: API_PROXY_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processRefreshQueue(error: unknown | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(undefined);
    }
  });
  refreshQueue = [];
}

async function refreshSession(): Promise<void> {
  await axios.post("/api/auth/refresh", undefined, { withCredentials: true });
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await refreshSession();
      processRefreshQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { parseApiError };

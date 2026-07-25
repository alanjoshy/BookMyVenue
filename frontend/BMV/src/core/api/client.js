import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "../auth/tokenStorage";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Auth routes that return 401 for bad credentials / intentional logout — never refresh-retry them. */
const AUTH_NO_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/logout",
  "/auth/refresh",
];

function isAuthNoRefreshUrl(url = "") {
  return AUTH_NO_REFRESH.some((path) => url.includes(path));
}

client.interceptors.request.use(
  (config) => {
    // Preserve an Authorization header set by the caller (e.g. logout sends the refresh token).
    if (!config.headers.Authorization) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthNoRefreshUrl(requestUrl)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token available.");

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const rememberMe = !!localStorage.getItem("bmv_access_token");
        saveTokens(data.access_token, data.refresh_token, rememberMe);

        processQueue(null, data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        const path = window.location.pathname;
        const onPublicAuthPage =
          path === "/" ||
          path === "/login" ||
          path === "/register" ||
          path === "/admin/login";
        if (!onPublicAuthPage) {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const detail = error.response?.data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg || d).join(", ")
          : error.message || "Something went wrong.";
    const status = error.response?.status || 500;
    return Promise.reject({ message, status });
  },
);

export default client;

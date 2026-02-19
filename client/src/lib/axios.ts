import axios from "axios";
import { store } from "../store/store.ts";
import { logout } from "../store/slices/authSlice.ts";

const isDev = import.meta.env.DEV;
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isDev
    ? "http://localhost:5505/api"
    : "https://chatapp-8huj.onrender.com/api");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only attempt refresh if we think we are logged in
      const hasUser = !!localStorage.getItem("user");
      if (!hasUser) {
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token using cookies
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());

        const currentPath = window.location.pathname;
        if (
          !currentPath.startsWith("/login") &&
          !currentPath.startsWith("/register") &&
          !currentPath.startsWith("/verify-email")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

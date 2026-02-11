import axios from "axios";
import { store } from "../store/store.ts";
import { logout } from "../store/slices/authSlice.ts";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://chatapp-8huj.onrender.com/api",
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

      try {
        // Try to refresh the token using cookies
        await axios.post(
          `${import.meta.env.VITE_API_URL || "https://chatapp-8huj.onrender.com/api"}/auth/refresh`,
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

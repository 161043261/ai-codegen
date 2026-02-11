/**
 * @deprecated Use hooks from `@/hooks/queries` and `@/hooks/mutations` instead.
 * This module is kept for backward compatibility only.
 */
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

// Create Axios instance
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
});

// Request interceptor
request.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    // Not logged in
    if (data.code === 40100) {
      if (
        !response.request.responseURL.includes("user/get/login") &&
        !window.location.pathname.includes("/user/login")
      ) {
        toast.warning("Please login first");
        window.location.href = `/user/login?redirect=${window.location.href}`;
      }
    }
    return response;
  },
  (error) => Promise.reject(error),
);

export default request;

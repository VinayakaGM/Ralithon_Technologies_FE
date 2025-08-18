import axios from "axios";
import AuthService from "./auth.service";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = AuthService.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("session-expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
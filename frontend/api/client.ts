import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://backend-erp-p8ct.onrender.com/api";
console.log("🌐 API Client configured with baseURL:", baseURL);

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  console.log("📤 Request:", config.method?.toUpperCase(), (config.baseURL || "") + (config.url || ""));
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

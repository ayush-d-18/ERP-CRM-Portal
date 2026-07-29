import apiClient from "./client";

export const login = async (email: string, password: string) => {
  const response = await apiClient.post("/api/auth/login", { email, password });
  return response.data;
};

export const signup = async (email: string, password: string, name: string) => {
  const response = await apiClient.post("/api/auth/signup", { email, password, name });
  return response.data;
};

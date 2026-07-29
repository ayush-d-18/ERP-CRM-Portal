import apiClient from "./client";

export const getProducts = async (search = "", category = "") => {
  const response = await apiClient.get("/api/products", {
    params: { search, category },
  });
  return response.data;
};

export const getProduct = async (id: string) => {
  const response = await apiClient.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (data: any) => {
  const response = await apiClient.post("/api/products", data);
  return response.data;
};

export const updateProduct = async (id: string, data: any) => {
  const response = await apiClient.put(`/api/products/${id}`, data);
  return response.data;
};

export const addStockMovement = async (
  id: string,
  quantity: number,
  type: string,
  reason?: string
) => {
  const response = await apiClient.post(`/api/products/${id}/stock`, {
    quantity,
    type,
    reason,
  });
  return response.data;
};

import apiClient from "./client";

export const getChallans = async (page = 1, limit = 10, status = "") => {
  const response = await apiClient.get("/api/challans", {
    params: { page, limit, status },
  });
  return response.data;
};

export const getChallan = async (id: string) => {
  const response = await apiClient.get(`/api/challans/${id}`);
  return response.data;
};

export const createChallan = async (customerId: string, items: any[]) => {
  const response = await apiClient.post("/api/challans", {
    customerId,
    items,
  });
  return response.data;
};

export const updateChallan = async (id: string, items: any[]) => {
  const response = await apiClient.put(`/api/challans/${id}`, { items });
  return response.data;
};

export const confirmChallan = async (id: string) => {
  const response = await apiClient.post(`/api/challans/${id}/confirm`);
  return response.data;
};

export const cancelChallan = async (id: string) => {
  const response = await apiClient.post(`/api/challans/${id}/cancel`);
  return response.data;
};

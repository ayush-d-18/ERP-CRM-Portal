import apiClient from "./client";

export const getCustomers = async (
  page = 1,
  limit = 10,
  search = "",
  status = ""
) => {
  const response = await apiClient.get("/api/customers", {
    params: { page, limit, search, status },
  });
  return response.data;
};

export const getCustomer = async (id: string) => {
  const response = await apiClient.get(`/api/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: any) => {
  const response = await apiClient.post("/api/customers", data);
  return response.data;
};

export const updateCustomer = async (id: string, data: any) => {
  const response = await apiClient.put(`/api/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await apiClient.delete(`/api/customers/${id}`);
  return response.data;
};

export const addCustomerNote = async (id: string, notes: string) => {
  const response = await apiClient.post(`/api/customers/${id}/notes`, { notes });
  return response.data;
};

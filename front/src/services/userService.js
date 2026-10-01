import { request } from "./apiClient";

export const getUsers = async () => {
  const data = await request("/api/users", { fallbackError: "Failed to fetch users" });
  return data.users || [];
};

export const getUserDetail = (id) =>
  request(`/api/users/${id}`, { fallbackError: "Failed to load user details" });

export const updateUserRole = (id, role) =>
  request(`/api/users/${id}/role`, { method: "PATCH", body: { role }, fallbackError: "Failed to update role" });

export const deleteUser = (id) =>
  request(`/api/users/${id}`, { method: "DELETE", fallbackError: "Failed to delete user" });

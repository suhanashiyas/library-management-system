import { request } from "./apiClient";

export const getCategories = async () => {
  const data = await request("/api/categories", { fallbackError: "Failed to fetch categories" });
  return data.categories || [];
};

export const createCategory = async (name) => {
  const data = await request("/api/categories", {
    method: "POST",
    body: { name },
    fallbackError: "Failed to create category",
  });
  return data.category;
};

export const updateCategory = async (id, name) => {
  const data = await request(`/api/categories/${id}`, {
    method: "PUT",
    body: { name },
    fallbackError: "Failed to update category",
  });
  return data.category;
};

export const deleteCategory = (id) =>
  request(`/api/categories/${id}`, { method: "DELETE", fallbackError: "Failed to delete category" });

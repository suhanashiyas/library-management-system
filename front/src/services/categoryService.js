import { API_BASE_URL } from "../config";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Every function returns the parsed JSON body — check `response.ok`-derived
// `message` on the caller side, same pattern as the existing page-level fetches.
export const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  return data.categories || [];
};

export const createCategory = async (name) => {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create category");
  }

  return data.category;
};

export const updateCategory = async (id, name) => {
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update category");
  }

  return data.category;
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete category");
  }

  return data;
};

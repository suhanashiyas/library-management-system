import { API_BASE_URL } from "../config";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Builds either a JSON body (no image selected) or multipart FormData (image
// selected) so the backend's upload middleware only kicks in when needed.
const buildBookBody = (fields, imageFile) => {
  if (!imageFile) {
    return {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(fields),
    };
  }

  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  formData.append("coverImage", imageFile);

  return {
    headers: authHeaders(),
    body: formData,
  };
};

export const getBooks = async () => {
  const response = await fetch(`${API_BASE_URL}/api/books`, {
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch books");
  }

  return data.books || [];
};

export const createBook = async (fields, imageFile) => {
  const { headers, body } = buildBookBody(fields, imageFile);

  const response = await fetch(`${API_BASE_URL}/api/books`, {
    method: "POST",
    headers,
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add book");
  }

  return data.book;
};

export const updateBook = async (id, fields, imageFile) => {
  const { headers, body } = buildBookBody(fields, imageFile);

  const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
    method: "PUT",
    headers,
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update book");
  }

  return data.book;
};

export const deleteBook = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete book");
  }

  return data;
};

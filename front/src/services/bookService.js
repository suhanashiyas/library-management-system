import { request } from "./apiClient";

// Sends JSON when there is no image, multipart FormData when there is, so the
// backend's upload middleware only kicks in when needed.
const buildBookBody = (fields, imageFile) => {
  if (!imageFile) return fields;

  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  formData.append("coverImage", imageFile);

  return formData;
};

export const getBooks = async () => {
  const data = await request("/api/books", { fallbackError: "Failed to fetch books" });
  return data.books || [];
};

export const createBook = async (fields, imageFile) => {
  const data = await request("/api/books", {
    method: "POST",
    body: buildBookBody(fields, imageFile),
    fallbackError: "Failed to add book",
  });
  return data.book;
};

export const updateBook = async (id, fields, imageFile) => {
  const data = await request(`/api/books/${id}`, {
    method: "PUT",
    body: buildBookBody(fields, imageFile),
    fallbackError: "Failed to update book",
  });
  return data.book;
};

export const deleteBook = (id) =>
  request(`/api/books/${id}`, { method: "DELETE", fallbackError: "Failed to delete book" });

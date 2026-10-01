import { request } from "./apiClient";

export const getMyBorrows = async () => {
  const data = await request("/api/borrows/my", { fallbackError: "Failed to load borrowings" });
  return data.borrows || [];
};

export const getAllBorrows = async () => {
  const data = await request("/api/borrows/admin", { fallbackError: "Failed to fetch borrow records" });
  return data.borrows || [];
};

export const borrowBook = (bookId) =>
  request("/api/borrows", { method: "POST", body: { bookId }, fallbackError: "Failed to borrow book" });

export const returnBook = (borrowId) =>
  request("/api/borrows/return", { method: "PUT", body: { borrowId }, fallbackError: "Failed to return book" });

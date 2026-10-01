import { request } from "./apiClient";

export const getDashboard = (isAdmin) =>
  request(`/api/dashboard/${isAdmin ? "admin" : "user"}`, {
    fallbackError: "Failed to load dashboard statistics",
  });

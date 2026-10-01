import { request } from "./apiClient";

export const loginUser = (credentials) =>
  request("/api/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
    fallbackError: "Invalid email or password.",
  });

export const registerUser = (form) =>
  request("/api/auth/register", {
    method: "POST",
    body: form,
    auth: false,
    fallbackError: "Registration failed.",
  });

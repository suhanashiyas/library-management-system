import { API_BASE_URL } from "../config";

// Shared HTTP layer: builds the URL from the env-driven base, attaches the
// auth token, parses JSON and turns failures into Errors with a user-facing
// message. Services call this instead of using fetch directly.
const NETWORK_ERROR = "Unable to connect to server";

export const request = async (path, { method = "GET", body, auth = true, fallbackError } = {}) => {
  const headers = {};

  if (auth) {
    headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }

  let payload;

  if (body instanceof FormData) {
    payload = body; // browser sets the multipart boundary
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  } catch (error) {
    console.error(error);
    throw new Error(NETWORK_ERROR, { cause: error });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackError || "Request failed");
  }

  return data;
};

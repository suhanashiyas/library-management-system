// Single source of truth for the backend API origin. Override by setting
// VITE_API_URL in a .env file when deploying somewhere other than localhost.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

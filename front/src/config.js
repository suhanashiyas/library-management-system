// Single source of truth for the backend API origin. Set VITE_API_URL in
// front/.env (see .env.example); there is intentionally no hardcoded fallback.
const rawBaseUrl = import.meta.env.VITE_API_URL;

if (!rawBaseUrl) {
  throw new Error(
    "VITE_API_URL is not set. Copy .env.example to .env and set the backend URL."
  );
}

// Strip trailing slashes so callers can always append "/api/..."
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

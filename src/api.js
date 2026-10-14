export const BACKEND_URL = (import.meta.env?.VITE_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");
let accessToken = null;
let sessionVersion = 0;

export function setAccessToken(token) {
  accessToken = token;
  sessionVersion += 1;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(path, { body, authenticated = true, ...options } = {}) {
  const version = sessionVersion;
  const headers = { ...options.headers };
  if (authenticated) {
    if (!accessToken) throw new ApiError("Please sign in first.", 401);
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options, headers, body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "omit",
  });
  if (authenticated && version !== sessionVersion) throw new ApiError("Your session changed.", 401);
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      setAccessToken(null);
      window.dispatchEvent(new Event("auth-expired"));
    }
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.detail || data.message || (response.status === 401
      ? "Invalid credentials or expired session." : "The request could not be completed."), response.status);
  }
  return response.status === 204 ? null : response.json();
}

export function imageUrl(path) {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${BACKEND_URL}/images/${encodeURIComponent(path)}`;
}

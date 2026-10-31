export const BACKEND_URL = (import.meta.env?.VITE_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");
// Auth stays on the frontend origin so HttpOnly cookies are first-party.
// Vite/Vercel forward /auth requests to the configured backend.
let accessToken = null;
let sessionVersion = 0;
let refreshing;

export function refreshSession() {
  if (refreshing) return refreshing;
  const version = sessionVersion;
  const renew = () => {
    if (version !== sessionVersion) throw new ApiError("Your session changed.", 401);
    return apiRequest("/auth/refresh", { method: "POST", authenticated: false });
  };
  const request = globalThis.navigator?.locks
    ? navigator.locks.request("tinder-session-refresh", renew) : renew();
  const pending = request.then((token) => {
    if (version !== sessionVersion) throw new ApiError("Your session changed.", 401);
    accessToken = token.accessToken;
    return token;
  }).finally(() => { if (refreshing === pending) refreshing = undefined; });
  refreshing = pending;
  return pending;
}

export async function endSession() {
  setAccessToken(null);
  const revoke = () => apiRequest("/auth/logout", { method: "POST", authenticated: false });
  if (globalThis.navigator?.locks) await navigator.locks.request("tinder-session-refresh", revoke);
  else await revoke();
}

export function setAccessToken(token) {
  accessToken = token;
  sessionVersion += 1;
  refreshing = undefined;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(path, { body, authenticated = true, retry = true, ...options } = {}) {
  const version = sessionVersion;
  const headers = { ...options.headers };
  if (authenticated) {
    if (!accessToken) throw new ApiError("Please sign in first.", 401);
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(path.startsWith("/auth/") ? path : `${BACKEND_URL}${path}`, {
    ...options, headers, body: body === undefined ? undefined : JSON.stringify(body),
    credentials: path.startsWith("/auth/") ? "include" : "omit",
  });
  if (authenticated && version !== sessionVersion) throw new ApiError("Your session changed.", 401);
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      if (retry) {
        try {
          // A different request may already have renewed this token.
          if (headers.Authorization === `Bearer ${accessToken}`) await refreshSession();
        } catch (error) {
          if (version !== sessionVersion) throw new ApiError("Your session changed.", 401);
          if (error.status !== 401) throw error;
          setAccessToken(null);
          window.dispatchEvent(new Event("auth-expired"));
          throw error;
        }
        return apiRequest(path, { ...options, body, authenticated, retry: false });
      }
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
  return /^(https?:\/\/|data:image\/)/.test(path) ? path : `${BACKEND_URL}/images/${encodeURIComponent(path)}`;
}

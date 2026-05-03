const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  try {
    const raw = localStorage.getItem("ttm_auth");
    const auth = raw ? JSON.parse(raw) : null;
    return auth?.token;
  } catch (error) {
    return null;
  }
}

export async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem("ttm_auth");
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok || payload.success === false) {
    const message = payload?.error?.message || "Request failed";
    throw new Error(message);
  }

  return payload.data;
}

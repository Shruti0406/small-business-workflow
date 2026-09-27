const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the API. Check that the backend is running.");
  }

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(payload.error || "The request could not be completed.");
  return payload;
}

export function jsonBody(value) {
  return JSON.stringify(value);
}

export function formatDate(
  value,
  options = { month: "short", day: "numeric" },
) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en", options).format(
    new Date(`${String(value).slice(0, 10)}T12:00:00`),
  );
}

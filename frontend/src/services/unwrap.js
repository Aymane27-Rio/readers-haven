import { API_BASE } from "./apiBase.js";

export function unwrap(data) {
  if (data && typeof data === "object" && "status" in data && "data" in data) {
    return data.data;
  }
  return data;
}

const CSRF_SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const readCsrfCookie = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )rh_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const ensureCsrfCookie = async () => {
  if (readCsrfCookie()) return;
  try {
    await fetch(`${API_BASE}/auth/csrf`, { credentials: "include" });
  } catch (_) {
    // Ignore fetch errors; subsequent request will surface issues.
  }
};

export async function fetchJson(input, init) {
  const opts = { credentials: "include", ...(init || {}) };
  const method = (opts.method || "GET").toString().toUpperCase();

  if (!CSRF_SAFE_METHODS.has(method)) {
    if (!readCsrfCookie()) {
      await ensureCsrfCookie();
    }

    const csrf = readCsrfCookie();
    if (csrf) {
      const headers = new Headers(opts.headers || {});
      if (!headers.has("X-CSRF-Token")) {
        headers.set("X-CSRF-Token", csrf);
      }
      opts.headers = headers;
    }
  }

  const res = await fetch(input, opts);
  const raw = await res.json();
  if (!res.ok) {
    const msg = raw?.message || raw?.error?.code || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return unwrap(raw);
}

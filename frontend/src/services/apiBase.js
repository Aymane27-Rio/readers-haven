const normalizeBase = (raw, suffix = '') => {
  if (!raw) return suffix ? `http://localhost:8080${suffix}` : 'http://localhost:8080';
  const trimmed = raw.replace(/\/+$/, '');
  if (!suffix) return trimmed;
  return trimmed.endsWith(suffix) ? trimmed : `${trimmed}${suffix}`;
};

const rawBase = import.meta.env?.VITE_API_BASE;

export const API_ORIGIN = normalizeBase(rawBase);
export const API_BASE = normalizeBase(rawBase, '/api');
export const AUTH_BASE = API_ORIGIN;
export const UPLOADS_BASE = normalizeBase(import.meta.env?.VITE_UPLOADS_BASE || API_ORIGIN);

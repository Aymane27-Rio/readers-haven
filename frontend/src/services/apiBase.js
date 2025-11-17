const normalizeBase = (raw, suffix = '') => {
  if (!raw) return suffix ? `http://localhost:8080${suffix}` : 'http://localhost:8080';
  const trimmed = raw.replace(/\/+$/, '');
  if (!suffix) return trimmed;
  return trimmed.endsWith(suffix) ? trimmed : `${trimmed}${suffix}`;
};

export const API_BASE = normalizeBase(import.meta.env?.VITE_API_BASE, '/api');
export const UPLOADS_BASE = normalizeBase(import.meta.env?.VITE_UPLOADS_BASE || API_BASE);

export const API_BASE = (import.meta.env?.VITE_API_BASE || 'http://localhost:8080').replace(/\/$/, '');
export const UPLOADS_BASE = (import.meta.env?.VITE_UPLOADS_BASE || API_BASE).replace(/\/$/, '');
